import { fork, ForkOptions, ChildProcess } from 'child_process'
import { access, constants } from 'fs'
import { join } from 'path'
import generateId from './utils/generateId'
import waitForExit from './utils/waitForExit'
import EventsContainer from './utils/EventsContainer'
import RequestResolvers from './types/RequestResolvers'
import Message, { EmitMessage, EmitMessagePayload, RequestMessage, RequestMessagePayload, ResponseMessage, ResponseMessagePayload } from './types/Message'

export class Slave {
  private eventsContainer = new EventsContainer
  private requestEventsContainer = new EventsContainer
  
  //if process exits, every request's pending Promise will be rejected
  private requestResolvers: RequestResolvers = Object.create(null)

  public readonly on = this.eventsContainer.add
  public readonly once = this.eventsContainer.addOnce
  public readonly removeListener = this.eventsContainer.delete
  public readonly onRequest = this.requestEventsContainer.add
  public readonly onceRequest = this.requestEventsContainer.addOnce
  public readonly removeRequestListener = this.requestEventsContainer.delete

  constructor(public readonly fork: ChildProcess){
    this.fork.on('message', this.handleMessage)
    this.clearAfterExit()
  }

  private async clearAfterExit(){
    await waitForExit(this.fork)
    this.eventsContainer = new EventsContainer
    this.requestEventsContainer = new EventsContainer

    //reject every request
    Object.values(this.requestResolvers).forEach(({ reject }) => reject(`Slave fork was killed`))
    this.requestResolvers = Object.create(null)
  }

  public emit(event: string, data?: any){
    this.fork.send({
      type: 'emit',
      payload: { event, data }
    } as EmitMessage)
  }

  public request<T>(event: string, data?: any, maximumTimeout: number = 10): Promise<T>{
    return new Promise((resolve, reject) => {
      const id = generateId()

      const clear = () => {
        if(timeout !== null){
          clearTimeout()
          timeout = null
        }
        delete this.requestResolvers[id]
      }

      const clearAndResolve = (data?: any) => {
        clear()
        resolve(data)
      }

      const clearAndReject = (error?: any) => {
        clear()
        reject(error)
      }

      this.requestResolvers[id] = { resolve: clearAndResolve, reject: clearAndReject }

      this.fork.send({
        type: 'request',
        payload: { event, data, id }
      } as RequestMessage)

      /*
        For very long tasks, not recommended though.
        If task crashes and forked process still works it will cause a memory leak.
      */
      if(maximumTimeout === Infinity)
        return

      let timeout: NodeJS.Timeout | null = setTimeout(() => clearAndReject(`Request ${event} was not handled by slave`), maximumTimeout*1000)
    })
  }

  public kill(){
    this.fork.kill('SIGINT')
  }

  private handleMessage = async (message: Message) => {
    if(typeof message !== 'object')
      return

    const { type, payload } = message
    if(type === 'emit'){
      const { event, data } = payload as EmitMessagePayload
      this.eventsContainer.forEach(event, fn => fn(data))
      return
    }

    if(type === 'request'){
      const { event, data, id } = payload as RequestMessagePayload

      const handler = this.requestEventsContainer.get(event)[0]
      if(handler === undefined)
        throw new Error(`Received not handled request from slave (${event})`)

      let responsePayload: ResponseMessagePayload 
      try {
        responsePayload = {
          isRejected: false,
          data: await handler(data),
          id
        }
      } catch(error) {
        responsePayload = {
          isRejected: true,
          data: error instanceof Error
            ? error.stack
            : error.toString(),
          id
        }
      }

      this.fork.send({ type: 'response', payload: responsePayload } as ResponseMessage)
    }

    if(type === 'response'){
      const { isRejected, data, id } = payload as ResponseMessagePayload

      if(isRejected){
        this.requestResolvers[id].reject(data)
        return
      }

      this.requestResolvers[id].resolve(data)
    }
  }
}

type Options = ForkOptions & {
  args?: string[]
}

export const createSlave = (modulePath: string, options: Options = {}) => {
  options.stdio = options.stdio || [undefined, undefined, undefined, 'ipc']

  //throw error if file does not exist
  access(join(options.cwd || process.cwd(), modulePath), constants.F_OK, error => {
    if(error)
      throw error
  })

  const forked = fork(modulePath, options.args || [], options)
  return new Slave(forked)
}
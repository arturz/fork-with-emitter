import { fork, ForkOptions, ChildProcess } from 'child_process'
import { EventEmitter } from 'events'
import { access, constants } from 'fs'
import { join } from 'path'
import generateId from './utils/generateId'
import EventsContainer from './utils/EventsContainer'

class Slave {
  private readonly eventsContainer = new EventsContainer
  private readonly requestEventsContainer = new EventsContainer
  private readonly requestResponseEmitter = new EventEmitter

  public readonly on = this.eventsContainer.add
  public readonly once = this.eventsContainer.addOnce
  public readonly removeListener = this.eventsContainer.delete
  public readonly onRequest = this.requestEventsContainer.add
  public readonly onceRequest = this.requestEventsContainer.addOnce
  public readonly removeRequestListener = this.requestEventsContainer.delete

  constructor(public readonly fork: ChildProcess){
    this.fork.on('message', this.handleMessage)
  }

  public emit(event: string, payload?: any){
    this.fork.send({ type: 'emit', event, payload })
  }

  public request(event: string, payload?: any, maximumTimeout: number = 10){
    return new Promise((resolve, reject) => {
      const id = generateId()
      this.fork.send({ type: 'request', id, event, payload })

      const resolveAndClear = (response: any) => {
        resolve(response)
        clearTimeout(timeoutHandler)
      }
      this.requestResponseEmitter.once(id, resolveAndClear)

      const timeoutHandler = setTimeout(() => {
        this.requestResponseEmitter.removeListener(id, resolveAndClear)
        reject()
      }, maximumTimeout*1000)
    })
  }

  public kill(){
    this.fork.kill('SIGINT')
  }

  private handleMessage = async (message: any) => {
    if(typeof message !== 'object')
      return

    const { type, event, payload, id } = message

    if(type === 'response'){
      this.requestResponseEmitter.emit(id, payload)
      return
    }

    if(type === 'request'){
      const response = await this.requestEventsContainer.get(event)[0](payload)
      this.fork.send({ type: 'response', payload: response, id })
      return
    }

    if(type === 'emit'){
      this.eventsContainer.forEach(event, fn => fn(payload))
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
  forked.on('error', error => {
    throw error
  })
  return new Slave(forked)
}
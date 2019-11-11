import { fork, ForkOptions, ChildProcess } from 'child_process'
import { EventEmitter } from 'events'
import { access, constants } from 'fs'
import { join } from 'path'
import generateId from './utils/generateId'
import Events from './types/Events'

class Slave {
  private readonly events: Events = Object.create(null)
  private readonly responseEmitter = new EventEmitter

  constructor(public readonly fork: ChildProcess){
    this.fork.on('message', this.handleMessage)
  }

  public on(event: string, listener: (payload?: any) => void | Promise<any>){
    if(this.events[event] === undefined){
      this.events[event] = [listener]
      return
    }
    
    this.events[event].push(listener)
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
      this.responseEmitter.once(id, resolveAndClear)

      const timeoutHandler = setTimeout(() => {
        this.responseEmitter.removeListener(id, resolveAndClear)
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
      this.responseEmitter.emit(id, payload)
      return
    }

    if(type === 'request'){
      const response = await this.events[event][0](payload)
      this.fork.send({ type: 'response', payload: response, id })
      return
    }

    if(type === 'emit'){
      this.events[event].forEach(fn => fn(payload))
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
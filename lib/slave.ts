import { EventEmitter } from 'events'
import generateId from './utils/generateId'
import Events from './types/Events'

export const isSlave = typeof process.send === 'function'

const events: Events = Object.create(null)
const responseEmitter = new EventEmitter

export const master = {
  on(event: string, listener: Function){
    if(events[event] === undefined){
      events[event] = [listener]
      return
    }
      
    events[event].push(listener)
  },
  emit(event: string, payload?: any){
    if(process.send)
      process.send({ type: 'emit', event, payload })
  },
  request(event: string, payload?: any, maximumTimeout: number = 10){
    return new Promise((resolve, reject) => {
      if(!process.send)
        return

      const id = generateId()
      process.send({ type: 'request', id, event, payload })
      
      const resolveAndClear = (response: any) => {
        resolve(response)
        clearTimeout(timeoutHandler)
      }
      responseEmitter.once(id, resolveAndClear)

      const timeoutHandler = setTimeout(() => {
        responseEmitter.removeListener(id, resolveAndClear)
        reject()
      }, maximumTimeout*1000)
    })
  }
}

if(isSlave){
  process.on('message', async (message: any) => {
    if(typeof message !== 'object')
      return

    const { type, event, payload, id } = message

    if(type === 'response'){
      responseEmitter.emit(id, payload)
      return
    }

    if(type === 'request' && process.send){
      const response = await events[event][0](payload)
      process.send({ type: 'response', payload: response, id })
      return
    }

    if(type === 'emit'){
      events[event].forEach(fn => fn(payload))
    }
  })
}
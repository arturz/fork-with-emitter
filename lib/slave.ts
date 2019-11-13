import { EventEmitter } from 'events'
import generateId from './utils/generateId'
import EventsContainer from './utils/EventsContainer'

export const isSlave = typeof process.send === 'function'

const eventsContainer = new EventsContainer
const requestEventsContainer = new EventsContainer
const requestResponseEmitter = new EventEmitter

export const master = {
  on: eventsContainer.add,
  once: eventsContainer.addOnce,
  removeListener: eventsContainer.delete,
  onRequest: requestEventsContainer.add,
  onceRequest: requestEventsContainer.addOnce,
  removeRequestListener: requestEventsContainer.delete,
 
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
      requestResponseEmitter.once(id, resolveAndClear)

      const timeoutHandler = setTimeout(() => {
        requestResponseEmitter.removeListener(id, resolveAndClear)
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
      requestResponseEmitter.emit(id, payload)
      return
    }

    if(type === 'request' && process.send){
      const response = await requestEventsContainer.get(event)[0](payload)
      process.send({ type: 'response', payload: response, id })
      return
    }

    if(type === 'emit'){
      eventsContainer.forEach(event, fn => fn(payload))
    }
  })
}
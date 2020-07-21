import generateId from './utils/generateId'
import EventsContainer from './utils/EventsContainer'
import RequestResolvers from './types/RequestResolvers'
import Message, { EmitMessage, EmitMessagePayload, RequestMessage, RequestMessagePayload, ResponseMessage, ResponseMessagePayload } from './types/Message'

export const isFork = typeof process.send === 'function'

const eventsContainer = new EventsContainer
const requestEventsContainer = new EventsContainer
const requestResolvers: RequestResolvers = Object.create(null)

export const host = {
  on: eventsContainer.add,
  once: eventsContainer.addOnce,
  removeListener: eventsContainer.delete,
  onRequest: requestEventsContainer.add,
  onceRequest: requestEventsContainer.addOnce,
  removeRequestListener: requestEventsContainer.delete,
 
  emit(event: string, data?: any){
    if(!process.send)
      return
    
    process.send({
      type: 'emit',
      payload: { event, data }
    } as EmitMessage)
  },

  request<T>(event: string, data?: any, maximumTimeout: number = 10): Promise<T>{
    return new Promise((resolve, reject) => {
      if(!process.send)
        return

      const id = generateId()

      const clear = () => {
        if(timeout !== null){
          clearTimeout()
          timeout = null
        }
        delete requestResolvers[id]
      }

      const clearAndResolve = (data?: any) => {
        clear()
        resolve(data)
      }

      const clearAndReject = (error?: any) => {
        clear()
        reject(error)
      }

      requestResolvers[id] = { resolve: clearAndResolve, reject: clearAndReject }

      process.send({
        type: 'request',
        payload: { event, data, id }
      } as RequestMessage)

      /*
        For very long tasks, not recommended though.
        If task crashes and forked process still works it will cause a memory leak.
      */
      if(maximumTimeout === Infinity)
        return

      let timeout: NodeJS.Timeout | null = setTimeout(() => clearAndReject(`Request ${event} was not handled by host`), maximumTimeout*1000)
    })
  }
}

if(isFork){
  process.on('message', async (message: Message) => {
    if(typeof message !== 'object' || !process.send)
      return

    const { type, payload } = message
    if(type === 'emit'){
      const { event, data } = payload as EmitMessagePayload
      eventsContainer.forEach(event, fn => fn(data))
      return
    }

    if(type === 'request'){
      const { event, data, id } = payload as RequestMessagePayload

      const handler = requestEventsContainer.get(event)[0]
      if(handler === undefined)
        throw new Error(`Received not handled request from host (${event})`)

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

      process.send({ type: 'response', payload: responsePayload } as ResponseMessage)
    }

    if(type === 'response'){
      const { isRejected, data, id } = payload as ResponseMessagePayload

      if(isRejected){
        requestResolvers[id].reject(data)
        return
      }

      requestResolvers[id].resolve(data)
    }
  })
}
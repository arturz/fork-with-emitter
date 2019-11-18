import Handler from '../types/Handler'

interface Events {
  [event: string]: Handler[]
}

export default class EventsContainer {
  private readonly events: Events = Object.create(null)

  public readonly add = (event: string, handler: Handler) => {
    if(this.events[event] === undefined){
      this.events[event] = [handler]
      return
    }
    
    this.events[event].push(handler)
  }

  public readonly addOnce = (event: string, fn: Handler) => {
    const handler = (payload?: any) => {
      fn(payload)
      this.delete(event, handler)
    }

    this.add(event, handler)
  }

  public readonly delete = (event: string, handler: Handler) => {
    if(this.events[event] === undefined)
      return

    this.events[event] = this.events[event].filter(fn => fn !== handler)
  }

  public readonly get = (event: string) => {
    if(this.events[event] === undefined)
      return []
      
    return [...this.events[event]]
  }

  public readonly forEach = (event: string, fn: Handler) => {
    this.get(event).forEach(fn)
  }
}
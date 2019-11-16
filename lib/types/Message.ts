export interface EmitMessagePayload {
  event: string,
  data: any
}

export interface EmitMessage {
  type: 'emit',
  payload: EmitMessagePayload
}


export interface RequestMessagePayload {
  event: string,
  data: any,
  id: string
}

export interface RequestMessage {
  type: 'request',
  payload: RequestMessagePayload
}


export interface ResponseMessagePayload {
  isRejected: boolean,
  data: any,
  id: string
}

export interface ResponseMessage {
  type: 'response',
  payload: ResponseMessagePayload
}

type Message = EmitMessage | RequestMessage | ResponseMessage
export default Message 
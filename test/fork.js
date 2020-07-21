const { host } = require('../dist/index')

const sleep = ms => 
  new Promise(res => setTimeout(res, ms))

host.onRequest('identity', value => value)

host.onRequest('test', async () => {
  await sleep(200)
  return host.request('test')
})

host.onRequest('throwRejection', async () => {
  throw new Error(`Example rejection`)
})

host.on('ping', (once = false) => 
  once 
    ? host.emit('oncePong') 
    : host.emit('pong')
)

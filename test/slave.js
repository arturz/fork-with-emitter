const { master } = require('../dist/index')

const sleep = ms => 
  new Promise(res => setTimeout(res, ms))

master.onRequest('identity', value => value)

master.onRequest('test', async () => {
  await sleep(200)
  return master.request('test')
})

master.on('ping', (once = false) => 
  once 
    ? master.emit('oncePong') 
    : master.emit('pong')
)

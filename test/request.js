const { master } = require('../dist/index')

const sleep = ms => 
  new Promise(res => setTimeout(res, ms))

master.on('identity', value => value)

master.on('test', async () => {
  await sleep(200)
  return master.request('test')
})
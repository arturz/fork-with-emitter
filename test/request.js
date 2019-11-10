const { master } = require('../dist/index')

const sleep = ms => 
  new Promise(res => setTimeout(res, ms))

master.on('identity', async value => {
  await sleep(200)
  return value
})
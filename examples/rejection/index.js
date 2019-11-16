const { createSlave } = require('../../dist/index')

const bot = createSlave('bot.js', { cwd: __dirname })

;(async () => {
  try {
    await bot.request('throwRejection')
  } catch(error) {
    console.log(error)
  }
})()
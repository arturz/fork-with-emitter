const { createSlave } = require('../../dist/index')

const bot = createSlave('bot.js', { cwd: __dirname })
//pipe bot's console.log to master's console.log
bot.fork.stdout.pipe(process.stdout)

bot.emit('hello', 'Artur')

;(async () => {
  const randomNumber = await bot.request('getRandomNumber')
  console.log(randomNumber)

  bot.kill()
})()
# fork-with-emitter

Simple EventEmitter wrapper for IPC, ehnanced with async .request(). 
- Zero dependencies.
- TypeScript support.
- Intuitive naming (master/slave).

## Example

bot.js (slave):
```javascript
const { master } = require('fork-with-emitter')

//returns promise that resolves after given ms
const sleep = ms => 
  new Promise(res => setTimeout(res, ms))

master.on('hello', name => {
  console.log(`Hello ${name}`)
})

master.on('getRandomNumber', async () => {
  await sleep(1000)
  return Math.floor(Math.random() * 1000)
})
```

index.js (master):
```javascript
const { createSlave } = require('fork-with-emitter')

const bot = createSlave('bot.js')
//pipe bot's console.log to master's console.log
bot.fork.stdout.pipe(process.stdout)

bot.emit('hello', 'Artur')

;(async () => {
  const randomNumber = await bot.request('getRandomNumber')
  console.log(randomNumber)

  bot.kill()
})()
```

Output:
```bash
Hello Artur
623
```

## Exports
```javascript
{
  /*
    Returns new Slave object.
    same as fork(modulePath, args, options)
  */
  createSlave(modulePath, options = { args: [] }),

  /*
    Points to master.
  */
  master: {
    /*
      If listener is an async function or returns Promise, resolved data may be passed to master's request.  
      process.on('message', listener) with events
    */
    on(event, listener),

    /*
      process.send(payload) with events
    */
    emit(event, listener),

    /*
      Returns Promise that resolves with data resolved from master's .on() listener.
      Rejects if response is not sent after 10 seconds.
    */
    request(event, listener, maximumTimeout = 10)
  },

  /*
    Returns if process is slave/was forked.
    same as process.send === 'function'
  */
  isSlave
}
```

## Slave object

```javascript
{
  /*
    native ChildProcess object
  */
  fork = ChildProcess,

  /*
    Exits process with SIGINT.
  */
  kill()

  /*
    Same as exported 'master' methods, but points to slave instead of master.
  */
  on(event, listener),
  emit(event, listener),
  request(event, listener, maximumTimeout = 10),
}
```
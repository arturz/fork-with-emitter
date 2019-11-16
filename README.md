# fork-with-emitter [![Build Status](https://travis-ci.com/xout/fork-with-emitter.svg?branch=master)](https://travis-ci.org/xout/fork-with-emitter)

Simple EventEmitter wrapper for IPC, enhanced with async .request(). 
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

master.onRequest('getRandomNumber', async () => {
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
      process.on('message', listener) with events
    */
    on(event, listener),

    /*
      Listener is removed after execution.
    */
    once(event, listener),

    removeListener(event, listener),

    /*
      process.send(payload) with events
    */
    emit(event, listener),

    /*
      Returned/resolved data from async function will be passed to master's request.  
    */
    onRequest(event, listener),
    onceRequest(event, listener),

    removeRequestListener(event, listener),

    /*
      Returns Promise that resolves with data resolved from master's .onRequest() listener.
      Rejects if response is not sent after 10 seconds.
    */
    request(event, listener, maximumTimeout = 10)
  },

  /*
    Is true when process is slave/was forked, otherwise is false.
    Same as process.send === 'function'
  */
  isSlave
}
```

## Slave object

```javascript
{
  /*
    Native ChildProcess object.
  */
  fork = ChildProcess,

  /*
    Exits process with SIGINT.
  */
  kill(),

  /*
    Same as exported 'master' methods, but points to slave instead of master.
  */
  on(event, listener),
  once(event, listener),
  removeListener(event, listener),
  emit(event, listener),
  onRequest(event, listener),
  onceRequest(event, listener),
  removeRequestListener(event, listener),
  request(event, listener, maximumTimeout = 10)
}
```
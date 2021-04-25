# fork-with-emitter ![Downloads count](https://img.shields.io/npm/dt/fork-with-emitter) [![Build Status](https://travis-ci.org/arturz/fork-with-emitter.svg?branch=master)](https://travis-ci.org/arturz/fork-with-emitter.svg?branch=master) ![Zero dependencies](https://status.david-dm.org/gh/arturz/fork-with-emitter.svg)

Simple EventEmitter wrapper for IPC, enhanced with async .request().

- Zero dependencies.
- TypeScript support.
- Intuitive naming (fork/host).

## Basics

`bot.js` (fork):

```javascript
import { host } from "fork-with-emitter";

host.on("hello", (name) => {
  console.log(`Hello ${name}`);
});

host.onRequest("getRandomNumber", async () => {
  await sleep(1000);
  return Math.floor(Math.random() * 1000);
});

//returns promise that resolves after given ms
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
```

`index.js` (host):

```javascript
import { createFork } from "fork-with-emitter";

const fork = createFork("bot.js");
//pipe fork's console.log to host's console.log
fork.process.stdout.pipe(process.stdout);

fork.emit("hello", "Artur");
(async () => {
  const randomNumber = await fork.request("getRandomNumber");
  console.log(randomNumber);

  fork.kill();
})();
```

`Output:`

```shell
Hello Artur
623
```

## Handling errors

`bot.js` (fork):

```javascript
import { host } from "fork-with-emitter";

host.onRequest("throwError", async () => {
  throw new Error(`Some error message`);
});
```

`index.js` (host):

```javascript
import { createFork } from "fork-with-emitter";

const fork = createFork("bot.js");

(async () => {
  try {
    await fork.request("throwError");
  } catch (error) {
    console.log(error);
  }
})();
```

`Output:`

```shell
Error: Some error message
    at (fork's stack)
```

Errors and rejections are captured only from .onRequest() handlers.

# Exports

```javascript
{
  /*
    Returns new spawned fork.
  */
  createFork(modulePath, options = { args: [] }),

  /*
    Variable indicating if process is a fork.
  */
  isForked,

  /*
    Points to host (use those methods from fork).
  */
  host: {
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
      Returned/resolved data from async function will be passed to host's request.
    */
    onRequest(event, listener),

    onceRequest(event, listener),

    removeRequestListener(event, listener),

    /*
      Returns Promise that resolves with data resolved from host's .onRequest() listener.
      Rejects if response is not sent after 10 seconds.
      maximumTimeout = Infinity -> for very long tasks, not recommended though, because if task stucks and fork still works it causes a memory leak.
    */
    request(event, listener, maximumTimeout = 10)
  }
}
```

## Fork object

Object that points to spawned fork.

```javascript
{
  /*
    Native ChildProcess object.
  */
  process,
    /*
    Exits process with SIGINT.
  */
    kill(),
    on(event, listener),
    once(event, listener),
    removeListener(event, listener),
    emit(event, listener),
    onRequest(event, listener),
    onceRequest(event, listener),
    removeRequestListener(event, listener),
    request(event, listener, (maximumTimeout = 10));
}
```

# License

MIT

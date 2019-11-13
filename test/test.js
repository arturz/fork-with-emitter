const chai = require('chai')
const { createSlave } = require('../dist/index')

chai.use(require("chai-as-promised"))
chai.should()

const sleep = ms => 
  new Promise(res => setTimeout(res, ms))

describe('#request()', () => {
  const identityPayload = 'test'
  const testRequestResult = 'testRequestResult'

  let slave
  beforeEach(() => {
    slave = createSlave('slave.js', { cwd: __dirname })
    slave.onRequest('test', async () => {
      return testRequestResult
    })
  })

  it(`slave.request('identity', ${identityPayload}) should resolve ${identityPayload}`, async () => {
    const result = await slave.request('identity', identityPayload)
    chai.expect(result).to.equal(identityPayload)
  })

  it(`slave.request('test') should resolve '${testRequestResult}'`, async () => {
    const result = await slave.request('test')
    chai.expect(result).to.equal(testRequestResult)
  })

  it(`slave.request('not_defined_fn', null, 0.5) should be rejected`, done => {
    slave.request('not_defined_fn', null, 0.5).should.be.rejected.and.notify(done)
  })

  afterEach(() => slave.kill())
})

describe('#on(), emit(), once()', () => {
  let pongCount = 0
  let wantedPongCount = 2

  let slave
  beforeEach(() => {
    slave = createSlave('slave.js', { cwd: __dirname })
    slave.on('pong', () => {
      pongCount++
    })
    slave.once('oncePong', () => {
      pongCount++
    })
  })

  it(`Pong count should be ${wantedPongCount}`, async () => {
    for(let i = 0; i < wantedPongCount; i++){
      slave.emit('ping')
      await sleep(10)
    }

    await sleep(500)

    chai.expect(pongCount).to.equal(wantedPongCount)
  })

  it(`Pong count should be ${wantedPongCount+1} (once)`, async () => {
    slave.emit('ping', true)
    await sleep(10)
    slave.emit('ping', true)
    await sleep(10)
    slave.emit('ping', true)
    await sleep(500)

    chai.expect(pongCount).to.equal(wantedPongCount+1)
  })

  afterEach(() => slave.kill())
})
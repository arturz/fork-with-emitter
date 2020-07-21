const chai = require('chai')
const { createFork } = require('../dist/index')

chai.use(require("chai-as-promised"))
chai.should()

const sleep = ms => 
  new Promise(res => setTimeout(res, ms))

describe('#request()', () => {
  const identityPayload = 'test'
  const testRequestResult = 'testRequestResult'

  let fork
  beforeEach(() => {
    fork = createFork('fork.js', { cwd: __dirname })
    fork.onRequest('test', async () => {
      return testRequestResult
    })
  })

  it(`fork.request('identity', ${identityPayload}) should resolve ${identityPayload}`, async () => {
    const result = await fork.request('identity', identityPayload)
    chai.expect(result).to.equal(identityPayload)
  })

  it(`fork.request('test') should resolve '${testRequestResult}'`, async () => {
    const result = await fork.request('test')
    chai.expect(result).to.equal(testRequestResult)
  })

  it(`fork.request('throwRejection') should be rejected`, done => {
    fork.request('throwRejection').should.be.rejected.and.notify(done)
  })

  it(`fork.request('not_defined_fn', null, 0.5) should be rejected`, done => {
    fork.request('not_defined_fn', null, 0.5).should.be.rejected.and.notify(done)
  })

  afterEach(() => fork.kill())
})

describe('#on(), emit(), once()', () => {
  let pongCount = 0
  let wantedPongCount = 2

  let fork
  beforeEach(() => {
    fork = createFork('fork.js', { cwd: __dirname })
    fork.on('pong', () => {
      pongCount++
    })
    fork.once('oncePong', () => {
      pongCount++
    })
  })

  it(`Pong count should be ${wantedPongCount}`, async () => {
    for(let i = 0; i < wantedPongCount; i++){
      fork.emit('ping')
      await sleep(10)
    }

    await sleep(500)

    chai.expect(pongCount).to.equal(wantedPongCount)
  })

  it(`Pong count should be ${wantedPongCount+1} (once)`, async () => {
    fork.emit('ping', true)
    await sleep(10)
    fork.emit('ping', true)
    await sleep(10)
    fork.emit('ping', true)
    await sleep(500)

    chai.expect(pongCount).to.equal(wantedPongCount+1)
  })

  afterEach(() => fork.kill())
})
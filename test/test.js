const chai = require('chai')
const { createSlave } = require('../dist/index')

chai.use(require("chai-as-promised"))
chai.should()

describe('#request()', () => {
  const identityPayload = 'test'
  const testRequestResult = 'testRequestResult'

  let slave
  beforeEach(() => {
    slave = createSlave('request.js', { cwd: __dirname })
    slave.on('test', async () => {
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
const chai = require('chai')
const { createSlave } = require('../dist/index')

chai.use(require("chai-as-promised"))
chai.should()

describe('#request()', () => {
  const slave = createSlave('request.js', { cwd: __dirname })

  const text = 'test'
  it(`request('identity', '${text}') should resolve '${text}'`, async () => {
    const result = await slave.request('identity', text)
    chai.expect(result).to.equal(text)
  })

  it(`request('not_defined_fn', null, 0.5) should be rejected`, done => {
    slave.request('not_defined_fn', null, 0.5).should.be.rejected.and.notify(done)
  })

  afterEach(() => slave.kill())
})
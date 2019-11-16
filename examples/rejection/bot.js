const { master } = require('../../dist/index')

master.onRequest('throwRejection', () => {
  throw new Error(`Some error message`)
})
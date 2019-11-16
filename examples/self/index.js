const { createSlave, isSlave } = require('../../dist/index')

if(isSlave){
  console.log(`Hello`)
} else {
  const slave = createSlave('index.js', { cwd: __dirname })
  slave.fork.stdout.pipe(process.stdout)
}
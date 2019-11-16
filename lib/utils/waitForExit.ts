import { ChildProcess } from 'child_process'

export default (childProcess: ChildProcess): Promise<void> => {
  return new Promise(resolve => {
    childProcess.once('exit', resolve)
    childProcess.once('error', resolve)
  })
}
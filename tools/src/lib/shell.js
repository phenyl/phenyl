// @flow
import shell from 'shelljs'
import fs from 'fs'

export type ShellCommandType = 'cd' | 'mkdir' | 'exec' | 'ln' | 'rm' | 'test' | 'cat' | 'save'

export type ShellCommand = {
  type: ShellCommandType,
  args: Array<string>,
}

export type ShellResult = {
  code: number,
  stdout: string,
  stderr: string,
}

export function run(shellCommand: ShellCommand): ShellResult {
  const { type, args } = shellCommand
  if (type === 'save') {
    return save(args[0], args[1])
  }
  let ret = shell[type](...args)

  if (type === 'test') {
    ret = { code: ret ? 0 : 1, stdout: '', stderr: '' }
  }
  return ret
}

function save(content: string, file: string): ShellResult {
  fs.writeFileSync(file, content)
  return {
    code: 0,
    stdout: '',
    stderr: '',
  }
}

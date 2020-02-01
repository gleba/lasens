import { executeCommand, info, rm } from './helpers'
import * as path from "path"
import { copyFileSync } from 'fs'
import { removeSync } from 'fs-extra'
const {log} = console
const chalk = require('chalk')
export const tsc = async () => {
  info('compiling typescript packages...')
  rm('lib')
  const tsconfig = path.join('packages', 'tsconfig.json')
  copyFileSync('tsconfig.json', tsconfig)
  await executeCommand(
    'node ' + path.resolve('node_modules/typescript/lib/tsc'),
    path.resolve('packages'),
  )
  rm(tsconfig)
  log(chalk.grey('typescript compiled'))
}
tsc()

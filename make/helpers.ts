import { existsSync } from 'fs-extra'
import { mkdirSync, rmdirSync } from 'fs'
import { exec } from 'child_process'
import * as path from 'path'

const chalk = require('chalk')
const { log } = console


export const info = text => log(chalk.green.bold(text))
export const log0 = (...text) => log(chalk.grey(...text))

export const prepare = async path => {
  if (existsSync(path)) rm(path)
  mkdirSync(path)
}

export const rm = name =>
  rmdirSync(name, {
    recursive: true,
  })

export const executeCommand = (command, cwd = path.resolve(__dirname)) =>
  new Promise(async done => {
    exec(command, { cwd: cwd }, (error, stdout) => {
      if (error) {
        log(chalk.grey('Error:'), chalk.yellow(cwd))
        log(chalk.redBright(error))
        // process.exit()
      }
      log(chalk.gray(stdout))
      log(chalk.green('done'), chalk.grey(command))
      done(stdout)
    })
  })

import {
  rmdir,
  existsSync,
  mkdirpSync,
  readJSON,
  writeJSON,
  writeJSONSync,
  readJSONSync,
} from 'fs-extra'
import * as path from 'path'
import { exec, execSync, fork } from 'child_process'
import { mkdirSync, readdirSync, renameSync, rmdirSync } from 'fs'
const chalk = require('chalk')
const { log } = console
const info = text => log(chalk.green.bold(text))
const log0 = (...text) => log(chalk.grey(...text))

const executeCommand = (command, cwd) =>
  new Promise(async done => {
    exec(command, { cwd: cwd }, (error, stdout) => {
      if (error) {
        log(chalk.grey('Error:'), chalk.yellow(cwd))
        log(chalk.redBright(error))
        process.exit()
      }
      // log(chalk.gray(stdout))
      log(chalk.green('done'), chalk.grey(command))
      done()
    })
  })

const prepare = async path => {
  if (existsSync(path))
    rm(path)
  mkdirSync(path)
}
const rm = name =>
  rmdirSync(name, {
    recursive: true,
  })
const dirName = 'TEMPleDocs'
const homeDir = path.resolve('.')
const workDir = path.resolve('TEMPleDocs')
const extractor = 'extractor'
const documenter = 'documenter'
const cfgFile = 'api-extractor.json'

const getModuleStartPath = name => `node_modules/@microsoft/api-${name}/lib/start.js`
async function checkModule(name) {
  const modulePath = getModuleStartPath(name)
  if (!existsSync(modulePath)) {
    info(`installing ${name}...`)
    await executeCommand(`npm i @microsoft/api-${name}`, homeDir)
  } else {
    log0(`${name} found`)
  }
}

async function extractApi(name) {
  const cwd = path.join(workDir, name)
  prepare(cwd)
  const config = readJSONSync(path.join(homeDir, 'scripts', cfgFile))
  const outFilePath = `../input/${name}.api.json`
  config.mainEntryPointFilePath = `../../lib/${name}/index.d.ts`
  config.docModel.apiJsonFilePath = outFilePath
  writeJSONSync(path.join(cwd, cfgFile), config)
  log0(`extract ${name} api..`)
  await executeCommand(`node ../../${getModuleStartPath(extractor)} run -c ${cfgFile}`, cwd)
  const api = readJSONSync(path.join(cwd, outFilePath))
  api.name = name
  writeJSONSync(path.join(cwd, outFilePath), api)
  log0(`api ready `+ name)
}


const tsc = async () => {
  info('compiling typescript packages...')
  await executeCommand(
    'node ' + path.resolve('node_modules/typescript/lib/tsc'),
    path.resolve('packages'),
  )
  log(chalk.grey('typescript compiled'))
}

async function make() {
  rm('lib')
  await tsc()
  info("prepare...")
  prepare(workDir)
  await Promise.all([checkModule(extractor), checkModule(documenter)])
  info('extract api...')
  await Promise.all([extractApi('core'), extractApi('react'), extractApi('vue')])
  info('making documentation...')
  await executeCommand(`node ../${getModuleStartPath(documenter)} markdown`, workDir)
  log0('cleaning working directory')
  rm('docs')
  renameSync(path.resolve(workDir, 'markdown'), 'docs')
  rm(workDir)
  info('documentation ready')
}
make()

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
import { mkdirSync, renameSync, rmdirSync } from 'fs'
const chalk = require('chalk')
const { log } = console

const executeCommand = (command, cwd) =>
  new Promise(async done => {
    exec(command, { cwd: cwd }, (error, stdout) => {
      if (error) {
        log(chalk.grey('Error:'), chalk.yellow(cwd))
        log(chalk.redBright(error))
        process.exit()
      }
      log(stdout)
      log(chalk.grey('done '), chalk.gray(command))
      done()
    })
  })

const prepare = async name => {
  existsSync(name) && rm(name)
  mkdirSync(name)
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
    log(chalk.grey('installing '), name)
    await executeCommand(`npm i @microsoft/api-${name}`, homeDir)
  } else {
    log(chalk.grey(`module ${name} found`))
  }
}

async function extractApi(name) {
  log(chalk.grey(`extract api`), name + '...')
  const cwd = path.join(workDir, name)
  mkdirSync(cwd)
  const config = readJSONSync(path.join(homeDir, 'scripts', cfgFile))
  const outFilePath = `../input/${name}.api.json`
  config.mainEntryPointFilePath = `../../lib/${name}/index.d.ts`
  config.docModel.apiJsonFilePath = outFilePath
  writeJSONSync(path.join(cwd, cfgFile), config)
  log(chalk.grey(`config ready`), name)
  await executeCommand(`node ../../${getModuleStartPath(extractor)} run -c ${cfgFile}`, cwd)
  log(chalk.grey(`api ready`), path.join(cwd, outFilePath))
  const api = readJSONSync(path.join(cwd, outFilePath))
  api.name = name
  writeJSONSync(path.join(cwd, outFilePath), api)
  log(chalk.grey(`complete`), name)
}

const info = text => log(chalk.green.bold(text))
const tsc = async () => {
  info('compiling typescript packages')
  await executeCommand(
    'node ' + path.resolve('node_modules/typescript/lib/tsc'),
    path.resolve('packages'),
  )
  log('typescript compiled')
}

async function make() {
  rm('lib')
  rm('docs')
  await Promise.all([tsc(), prepare(workDir)])
  await Promise.all([checkModule(extractor), checkModule(documenter)])
  await Promise.all([extractApi('core'), extractApi('react'), extractApi('vue')])
  log('making documentation...')
  await executeCommand(`node ../${getModuleStartPath(documenter)} markdown`, workDir)
  log('cleaning working directory')
  renameSync(path.resolve(workDir, 'markdown'), 'docs')
  renameSync('docs/index.md', 'docs/readme.md')
  rm(workDir)
}
make()

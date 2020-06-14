import { executeCommand, info, rm } from './helpers'
// import * as path from 'path'
// import { copyFileSync } from 'fs'
import { removeSync } from 'fs-extra'
import * as path from 'path'
const chalk = require('chalk')

import { readdirSync, readFileSync, stat, statSync, writeFileSync } from 'fs'
const { log } = console

const distPath = path.resolve('dist')

export const makeLib = async (packageName?) => {
  info('compiling typescript packages...')
  rm(distPath)
  await executeCommand(
    'node ' + path.resolve('node_modules/typescript/lib/tsc'),
    path.resolve('.')
  ).catch(e => {
    console.warn(e)
  })

  let globalTDS = readFileSync(path.resolve('packages/global.d.ts')).toString()
  const defPacks = {}
  const readDef = (p, name) => {
    let fp = path.join(p, name)
    let stat = statSync(fp)
    if (stat.isDirectory()) {
      readdirSync(fp).forEach(f => readDef(fp, f))
    } else {
      if (name.slice(-5) === '.d.ts') {
        let pakName = p.split(`dist${path.sep}packages`)[1].split(path.sep)[1]
        if (packageName && packageName != pakName) {
          console.log({ packageName }, pakName)
          rm(fp)
          return
        }
        if (!defPacks[pakName]) defPacks[pakName] = []
        defPacks[pakName].push(readFileSync(fp).toString())
        console.log('+/-', pakName, name)
        rm(fp)
      }
    }
  }
  readdirSync(distPath).forEach(f => readDef(distPath, f))
  for (let key in defPacks) {
    let defs = defPacks[key]
    let indexDTS = readFileSync(
      path.resolve(`packages/${key}/index.d.ts`)
    ).toString()

    writeFileSync(
      path.join(distPath, 'packages', key, 'global.d.ts'),
      globalTDS + indexDTS
    )
    let locDTS = `/// <reference path="global.d.ts" />" {`
    defs.forEach(d => {
      // d = d.replace(/export declare /g, "export ")
      locDTS = locDTS + '\n' + d
    })

    writeFileSync(path.join(distPath, 'packages', key, 'index.d.ts'), locDTS)
    console.log(`defs for ${key} are ready`)
  }
}

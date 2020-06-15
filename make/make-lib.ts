import { executeCommand, info, rm } from './helpers'
// import * as path from 'path'
// import { copyFileSync } from 'fs'

import * as path from 'path'
import { moveSync } from 'fs-extra'
const chalk = require('chalk')

import {
  existsSync,
  readdirSync,
  readFileSync,
  stat,
  statSync,
  writeFileSync,
} from 'fs'
import { doc } from 'prettier'
import join = doc.builders.join
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
      if (name.indexOf('__test') >= 0) {
        rm(fp)
        return
      }
      readdirSync(fp).forEach(f => readDef(fp, f))
    } else {
      let pakName = p.split(`dist${path.sep}packages`)[1].split(path.sep)[1]
      if (packageName && packageName != pakName) {
        return
      }
      if (name.slice(-5) === '.d.ts') {
        if (!defPacks[pakName]) defPacks[pakName] = []
        let content = readFileSync(fp).toString()
        if (content.indexOf(' * @internal-all') >= 0) {
          rm(fp)
          console.log('-', name)
          return
          // } else {
          //   defPacks[pakName].push()
        }
      }

      let parts = p.split(path.sep)
      parts.pop()
      moveSync(fp, path.join(parts.join(path.sep), name))
      console.log('+', name)
    }
  }
  readdirSync(distPath).forEach(f => readDef(distPath, f))

  function makeDefs(name) {
    let locDTS = readFileSync(
      path.resolve(`packages/${name}/index.d.ts`)
    ).toString()
    writeFileSync(
      path.join(distPath, 'packages', name, 'global.d.ts'),
      globalTDS + locDTS
    )
    console.log('++ global.d.ts')
    let outIndexPath = path.join(distPath, 'packages', name, 'index.d.ts')

    let outIndexContent = readFileSync(outIndexPath).toString()
    const outParts = outIndexContent.split('\n')
    console.log('index.d.ts lines:', outParts.length)
    outParts[0] = `/// <reference path="global.d.ts" />"`
    outIndexContent = outParts.join('\n')
    // console.log('++ index.d.ts lines:')
    writeFileSync(outIndexPath, outIndexContent)
    console.log('++ index.d.ts')
    // console.log(`defs for ${name} are ready`)
  }
  makeDefs(packageName)
}

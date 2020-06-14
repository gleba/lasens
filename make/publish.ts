import { readFileSync, readSync, writeFileSync } from 'fs'
import { executeCommand } from './helpers'
import { makeLib } from './make-lib'

export async function publish(name) {
  const sourcePath = `./packages/${name}/package.json`
  const packageJSON = JSON.parse(readFileSync(sourcePath, 'utf-8'))
  let v = await executeCommand(`npm show ${packageJSON.name} version`)
  const remoteVer = v.toString().split('\n').shift()
  const newVerParts = remoteVer.split('.')
  let step = newVerParts.length - 1
  newVerParts[step] = (parseInt(newVerParts[step]) + 1).toString()
  const newVer = newVerParts.join('.')
  if (packageJSON.version != newVer) {
    packageJSON.version = newVer
    writeFileSync(sourcePath, JSON.stringify(packageJSON, null, 4))
  }

  await makeLib()
  writeFileSync(
    `./dist/packages/${name}/package.json`,
    JSON.stringify(packageJSON, null, 2)
  )
  await executeCommand('npm publish', `./dist/packages/${name}`)
}

export async function link(name) {
  const sourcePath = `./packages/${name}/package.json`
  const packageJSON = JSON.parse(readFileSync(sourcePath, 'utf-8'))
  const newVerParts = packageJSON.version.split('.')
  let step = newVerParts.length - 1
  newVerParts[step] = (parseInt(newVerParts[step]) + 1).toString()
  const newVer = newVerParts.join('.')
  if (packageJSON.version != newVer) {
    packageJSON.version = newVer
    writeFileSync(sourcePath, JSON.stringify(packageJSON, null, 4))
  }
  await makeLib(name)
  writeFileSync(
    `./dist/packages/${name}/package.json`,
    JSON.stringify(packageJSON, null, 2)
  )
  await executeCommand('npm link', `./dist/packages/${name}`)
}

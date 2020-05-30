import { readFileSync, readSync, writeFileSync } from 'fs'
import { executeCommand } from './helpers'
import { makeLib } from './make-lib'

export async function publish(name) {
  // console.log('____', name)
  const packageJSON = JSON.parse(
    readFileSync(`./packages/${name}/package.json`, 'utf-8')
  )

  if (packageJSON.version) {
    await makeLib()
    packageJSON.version
  } else {
    throw 'wrong name in package.json'
  }

  const versionParts = packageJSON.version.split('.')
  versionParts.push(parseInt(versionParts.pop()) + 1)
  packageJSON.version = versionParts.join('.')
  writeFileSync(
    `./dist/packages/${name}/package.json`,
    JSON.stringify(packageJSON, null, 2)
  )
  await executeCommand('npm publish', `./dist/packages/${name}`)
}

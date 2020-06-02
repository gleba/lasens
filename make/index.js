require('ts-node').register()

const { executeCommand } = require('./helpers')
const chokidar = require('chokidar')
const path = require('path')

const task = process.argv[2]
const cwd = path.resolve(".")

console.log('make', task)
console.log({cwd})

let t
switch (task) {
  case 'docs':
    require('./make-docs')
    break
  case 'dev':
    chokidar.watch(['./packages', './make/']).on('all', (event, path) => {
      clearInterval(t)
      t = setTimeout(() => {
        console.log('\n\n\n\n')
        console.clear()
        console.log('--------------------------------------------')
        console.log(Date.now())
        executeCommand('node make play', cwd)
      }, 100)
    })
    break
  case 'play':
    require('./playground')
    break
  case 'dev-script':
    console.log('dev script')
    chokidar.watch('./make/').on('all', (event, path) => {
      clearInterval(t)
      t = setTimeout(() => {
        executeCommand('node make publish sens', cwd)
      }, 100)
    })
    break
  case 'link':
    require('./publish').link(process.argv[3])
    break
  case 'publish':
    require('./publish').publish(process.argv[3])
    break
  default:
    require('./make-lib')
}

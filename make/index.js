require('ts-node').register()

const { executeCommand } = require('./helpers')
const chokidar = require('chokidar')

const task = process.argv[2]

console.log('make', task)

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
        executeCommand('node make play')
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
        executeCommand('node make')
      }, 100)
    })
    require('./make/dev-script')
    break
  default:
    require('./make-lib')
}

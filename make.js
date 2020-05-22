


require('ts-node').register()

const task = process.argv[2]




const { executeCommand } = require('./scripts/helpers')
const chokidar = require('chokidar')

switch (task) {
  case 'docs':
    require('./scripts/make-docs')
    break
  case 'dev-script':
    let t
    console.log("dev script");
    chokidar.watch('./scripts/').on('all', (event, path) => {
      clearInterval(t)
      t = setTimeout(()=>{
        executeCommand('node make')
      }, 100)
    });
    require('./scripts/dev-script')
    break
  default:
    require('./scripts/make-lib')
}

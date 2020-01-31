require('ts-node').register({
  compilerOptions: {
    baseUrl: '.',
    lib: ['ES2017', 'DOM'],
    module: 'commonjs',
    target: 'es6',
    experimentalDecorators: true,
    noImplicitAny: false,
  },
})

const task = process.argv[3]
//
//ts.register({
//  fast:true,
//  cacheDirectory:"./tmp"
//})
require('./scripts/make-docs')
//

/* eslint-env node */
const path = require('path')
const babelrcPath = path.join(__dirname, '..', '..', '.babelrc')
const babelrc = JSON.parse(require('fs').readFileSync(babelrcPath, 'utf8'))

// https://babeljs.io/docs/en/babel-register#babel-cache-path
process.env.BABEL_CACHE_PATH =
  process.env.BABEL_CACHE_PATH ||
  path.resolve(
    __dirname,
    '..',
    '..',
    'node_modules',
    '.cache',
    'babel-register-cache.json',
  )

require('babel-register')({
  ...babelrc,
  extensions: ['.jsx', '.js', '.ts', '.tsx'],
  cache: true,
})

import pkg from './package.json';
import plugins from './build/plugins';
import path from 'path';
import rimraf from 'rimraf';

const input = path.join(__dirname, './src/index.ts');
const dir = path.join(__dirname,'./lib');
const name = 'layout';
const banner =
  '/*!\n' +
  ` * table by ant-design-vue v${pkg.version}\n`+
  ' */'

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

const buildType = [
  'es',
  'cjs'
];

try {
  ['./lib', './es'].forEach(item => {
    rimraf.sync(item);
  });
} catch(e) {
  console.error('clean error-->', e)
}

console.log('clean successfully!')

const allBuilds = [];

buildType.forEach(type => {
  let output = {
    file: `${type === 'cjs' ? dir : type}/index.js`,
    format: type,
    name,
    banner,
    sourcemap: true
  }
  let config = {
    input,
    output,
    plugins,
    external,
  }
  allBuilds.push(config)
});
export default allBuilds;
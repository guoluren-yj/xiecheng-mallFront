const child = require('child_process');
const fs = require('fs');

// 升级1.x.x中版本
child.execSync(`git pull  && npm version ${process.env.VERSION_ENV}`);

// 再读取版本号
const packageInfo = require('../package.json');

const newVersion = packageInfo.version
  .match(/\d+/g)
  .slice(0, 3)
  .join('.');

try {
  // 主模块同步版本号
  child.execSync(`lerna exec --scope mall-front npm version ${newVersion}`);
} catch {
  //
}

fs.writeFileSync(
  './tag.txt',
  `${fs.readFileSync('./tag.txt', 'utf-8')}\r\n# ${newVersion} - ${new Date().toLocaleString()}`,
  'utf-8'
);
child.execSync(
  `git add . && git commit -m "feat: tag - v${newVersion} - ${new Date().toLocaleString()}" && git push`
);

// 打tag
child.execSync(`git tag ${newVersion} && git push origin ${newVersion}`);

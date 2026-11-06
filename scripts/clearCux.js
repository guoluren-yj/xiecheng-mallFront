// 清理二开包
const fs = require('fs');
const readline = require('readline');

// 删除文件夹
function deleteDir(path) {
  if (fs.existsSync(path)) {
    const files = fs.readdirSync(path);
    files.forEach(file => {
      const filePath = `${path}/${file}`;
      if (fs.statSync(filePath).isDirectory()) {
        deleteDir(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    });
    fs.rmdirSync(path);
  }
}

(function clearCux() {
  new Promise(async resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('请输入需要保留的二开文件夹名称或二开租户tenantNum:(全部清除直接回车)', inputStr => {
      rl.close();
      // 判断是否为文件夹名称
      const input = inputStr.trim();
      const isDir = input.includes('mall-front-cux-');
      const dirName = isDir ? input : `mall-front-cux-${input.replace('SRM-', '').toLowerCase()}`;
      resolve(dirName);
    });
  }).then(dirName => {
    if (fs.existsSync('./packages')) {
      const packages = fs.readdirSync('./packages');
      packages.forEach(package => {
        const packagePath = `./packages/${package}`;
        const packageIsCux = package.includes('mall-front-cux-');
        const packageIsDir = fs.statSync(packagePath).isDirectory();
        if (package !== dirName && packageIsCux && packageIsDir) {
          deleteDir(packagePath);
        }
      });
    }
  });
})();

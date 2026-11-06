const fs = require('fs');
const readline = require('readline');

(async function() {
  try {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      const tenantNum = await new Promise((resolve, reject) => {
        rl.question('请输入租户编码tenantNum(SRM-XXX):', (answer) => {
          if (!answer || !answer.startsWith('SRM-')) {
            reject(answer);
            rl.close();
          } else {
            const inputNum = answer.trim();
            resolve(inputNum);
          }
        });
      });
      const tenantName = await new Promise((resolve) => {
        rl.question('请输入租户名称tenantName:', (answer) => {
          const inputName = answer.trim() || '';
          resolve(inputName);
        });
      });
    const buffer = `export default {
  '${tenantNum}': {
      tenantName: '${tenantName}',
      functions: {},
      components: {},
      routers: [],
  },
};`;
    const dirName = `mall-front-cux-${tenantNum.replace('SRM-', '').toLowerCase()}`;
    // node版本v16.7.0以上支持
    fs.cp('./packages/mall-front-cux-code', `./packages/${dirName}`, { recursive: true }, (err) => {
      if (err) {
        console.log(`创建二开失败！！！`);
        return;
      }
      const defaultData = fs.readFileSync(`./packages/${dirName}/package.json`, 'utf-8');
      const data = JSON.parse(defaultData);
      data.name = dirName;
      data.description = dirName;
      data.version = '0.0.1';
      fs.writeFileSync(`./packages/${dirName}/src/cux-config.js`, buffer.trim());
      fs.writeFileSync(`./packages/${dirName}/package.json`, JSON.stringify(data, null, 2));
      console.log(`成功创建二开租户${tenantNum}-${tenantName}！！！`);
      process.exit(0);
    });
  } catch (err) {
    console.log(err);
    console.log('请输入正确租户编码tenantNum！！！');
  }
})();

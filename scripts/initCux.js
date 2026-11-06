const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 复制文件
function copyFile(srcPath, tarPath, cb) {
  const rs = fs.createReadStream(srcPath);
  const ws = fs.createWriteStream(tarPath);
  rs.pipe(ws);
}

// 复制文件夹所有
function copyDir(srcDir, tarDir, cb) {
  if (fs.existsSync(tarDir)) {
    fs.readdir(srcDir, (_, files) => {
      files.forEach(file => {
        const srcPath = path.join(srcDir, file);
        const tarPath = path.join(tarDir, file);
        fs.stat(srcPath, (_, stats) => {
          if (stats.isDirectory()) {
            fs.mkdir(tarPath, err => {
              if (err) {
                console.log(err);
                return;
              }
              copyDir(srcPath, tarPath);
            });
          } else {
            copyFile(srcPath, tarPath);
          }
        });
      });
    });
  } else {
    fs.mkdir(tarDir, function(err) {
      if (err) {
        console.log(err);
        return;
      }
      console.log('正在创建二开包:', tarDir);
      copyDir(srcDir, tarDir, cb);
    });
  }
}

// copyDir('./packages/mall-front-cux-code', './packages/mall-front-cux-demo');

function initCuxFile() {
  const tips = '请输入租户tenantNum:';
  return new Promise(async resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const cb = answer => {
      rl.close();
      const input = answer.trim() || 'SRM-XXX';
      resolve(input);
    };

    rl.question(tips, cb);
  }).then(async res => {
    const writeFileRecursive = (dirName, buffer, callback) => {
      fs.writeFile(`./packages/${dirName}/src/cux-config.js`, buffer, error => {
        if (error) return callback(error);
				const defaultData = fs.readFileSync(`./packages/${dirName}/package.json`, 'utf-8');
				const data = JSON.parse(defaultData);
				data.name = dirName;
				data.description = dirName;
        data.version = '0.0.1';
				fs.writeFile(`./packages/${dirName}/package.json`, JSON.stringify(data, null, 2), error => {
					if (error) return callback(error);
					return callback(null);
				});
      });
			
    };

    const buffer = `
export default {
	'${res}': {
			functions: {},
			components: {},
			routers: [],
	}
};`;
    const dirName = `mall-front-cux-${res.replace('SRM-', '').toLowerCase()}`;
    copyDir('./packages/mall-front-cux-code', `./packages/${dirName}`);
    setTimeout(() => {
      writeFileRecursive(dirName, buffer, err => {
        if (err) console.log(err);
        console.log(`租户：${res}创建成功`);
      });
    }, 2000);
  });
}

initCuxFile();

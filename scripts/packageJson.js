const fs = require('fs');
const path = require('path');

const defaultPath = './packages/mall-front-cux-code/package.json';
const defaultData = fs.readFileSync(defaultPath, 'utf-8');

function setPackageJson(filename) {
  if (filename.startsWith('mall') && filename !== 'mall-front') {
    const data = JSON.parse(defaultData);
    data.name = filename;
    data.description = filename;
    data.version = '0.0.1';
    fs.writeFile(`./packages/${filename}/package.json`, JSON.stringify(data, null, 2), function(
      err
    ) {
      if (err) {
        console.warn(err);
      } else {
        console.log(`${filename}修改成功`);
      }
    });
  }
}

//文件遍历方法
function fileDisplay(filePath) {
  //根据文件路径读取文件，返回文件列表
  fs.readdir(filePath, function(err, files) {
    if (err) {
      console.warn(err);
    } else {
      //遍历读取到的文件列表
      files.forEach(function(filename) {
        //获取当前文件的绝对路径
        const filedir = path.join(filePath, filename);
        //根据文件路径获取文件信息，返回一个fs.Stats对象
        fs.stat(filedir, function(eror, stats) {
          if (eror) {
            console.warn('获取文件stats失败');
          } else {
            setPackageJson(filename);
            // const isFile = stats.isFile();//是文件
            // const isDir = stats.isDirectory();//是文件夹
          }
        });
      });
    }
  });
}

fileDisplay('./packages');

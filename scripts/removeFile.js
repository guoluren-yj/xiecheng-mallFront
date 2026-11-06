const fs = require('fs'); //文件模块
const path = require('path'); //系统路径模块

function deleteFileSync(filePath, findName) {
    // 检测文件是否存在
    if (fs.existsSync(filePath)) {
        // 检测文件是目录
        if (fs.statSync(filePath).isDirectory()) {
            // 获取目录内所有文件名
            const filenames = fs.readdirSync(filePath);
            filenames.forEach((filename) => {
                const currentPath = path.join(filePath, filename);
                if (fs.statSync(currentPath).isDirectory()) {
                    deleteFileSync(currentPath, findName);
                } else if(filename == findName) {
                    fs.unlinkSync(currentPath);
                }
            });
            // fs.rmdirSync(filePath);
        } else {
            fs.unlinkSync(filePath);
        }
    }
}

deleteFileSync('./packages', 'color.less')
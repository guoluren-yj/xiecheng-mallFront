import replacer from 'webpack-theme-color-replacer/client';
// 引入插件方法
import theme from '@/config/theme';
import colors from '@/colors';

function changeColor(code) {
  const newColors = colors[code];
  const options = {
    newColors: Object.values(newColors),
    // 传入的新的主题色
  };

  replacer.changer.changeColor(options, Promise).then(() => {
    // console.log(`Theme colors changed!${code}`);
  });
  // 执行切换主题方法，返回promise
}

// function changeAntdColor(color) {
//   if (window.less.modifyVars) {
//     window.less.modifyVars({
//       '@primary-color': color,
//     });
//   }
// }

export default function changeTheme({ colorCode, dispatch }) {
  // 更换颜色
  const primaryColor = colors[colorCode || 'A']?.['primary-color'];
  changeColor(colorCode || 'A');
  dispatch({
    type: 'global/update',
    payload: {
      theme: {
        ...theme,
        'primary-color': primaryColor, // 主题色
      },
    },
  });
}
// changeColor('#FF3333');
// 用户切换主题色时触发切换方法

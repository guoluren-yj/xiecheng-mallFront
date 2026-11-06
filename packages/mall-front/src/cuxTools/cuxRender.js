import functions from './functions';

export default function cuxRender({
  name, // 二开区域划分name，唯一
  value = {}, // 传递的参数
}) {
  return (children) => {
    const render = functions[name]?.function || functions[name];
    return typeof render === 'function' ? render(value, children) : children;
  };
}

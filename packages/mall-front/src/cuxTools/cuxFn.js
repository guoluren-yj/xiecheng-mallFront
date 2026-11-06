import functions from '@/cuxTools/functions';

const emptyFn = () => {};

export default function CuxFn({
  name, // 二开区域划分name，唯一
  value = {}, // 传递的参数
}) {
  return (defaultFn, fnName, fun) => {
    const fn = functions[name]?.function || functions[name];
    if (!fn) return fnName && fun ? emptyFn : defaultFn || emptyFn;
    if (fnName && fun) {
      // eslint-disable-next-line no-param-reassign
      fun.value = () => fn(value);
    } else if (!defaultFn) {
      return fn(value);
      // 非二开，直接自执行 cuxFn()();
    } else return () => fn(value); // 二开函数，高阶函数的形式包起来，cuxFn({})(e=>e);
  };
}

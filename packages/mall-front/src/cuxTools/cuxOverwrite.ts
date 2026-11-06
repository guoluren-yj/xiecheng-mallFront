/* eslint-disable prefer-rest-params */
/* eslint-disable no-param-reassign */
/* eslint-disable func-names */
/* eslint-disable no-undef */
/**
 * 二开函数的装饰器
 */
import functions from './functions';

interface IProps {
    name: string; // 唯一的name
    value?: any; // 多余的参数
}

const cuxOverwrite = function (props: IProps): MethodDecorator {
    return (_target: Object, _propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
        const { name, value } = props;
        const cuxFn = functions[name]?.function || functions[name];
        if (cuxFn) {
            descriptor.value = function () {
                return cuxFn.apply(this, [...arguments, value]);
            };
        }
    };
};

export default cuxOverwrite;
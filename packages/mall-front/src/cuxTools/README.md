#### PC商城二开
1. 介绍
+ cuxTools --- 二开工具
+ mall-front-cux-xxx --- 二开包

2. 流程
+ 创建二开包
    在父工程下执行 
    ```
    yarn initCux
    ```
    输入租户编码会自动创建对应的二开包


+ 二开组件注册与使用
    > 以组件为单位, 以标准组件路径作为key，使用二开工具cuxComponent
    ```
    import React from 'react';
    import cuxComponent from 'cuxTools/cuxComponent';

    function CataInfo() {
        return <></>;
    }
    export default cuxComponent({ path: 'BeforeCompanyOrder/CataInfo' })(CataInfo);
    ```

    > 二开组件的key 必须与标准组件注册的路径key保持一致，建议通过动态加载引入
    ```
    import dynamicImport from 'utils/dynamicImport';

    export default{
        'SRM-XXX': {
            components: {
                // 有注释
                'BeforeCompanyOrder/CataInfo': {
                    component: dynamicImport('./components/CataInfo'),
                    description: xxxxxxxxx, // 需求描述
                    number: 'srm-xxx', // 需求号
                    version: '2022v0514', // 迭代版本
                },
                // 简易
                'BeforeCompanyOrder/CataInfo': dynamicImport('./components/CataInfo')
            },
        }
    };
    ```

+ 函数的二开使用
    >函数的二开
    1. 新增功能函数（无标准代码块），直接在需要执行的地方自执行，或者命名后执行
    ```
        import CuxFn from '@/cuxTools/cuxFn';

        CuxFn({ name: 'BeforeCompanyOrder-fn-getPayUrl', value: { res } })();
        // 有标准代码块
        const fn=CuxFn({ name: 'BeforeCompanyOrder-fn-getPayUrl', value: { res } });
        fn();
    ```

    2. 二开函数 --- 使用高阶函数的方式
    ```
    import CuxFn from '@/cuxTools/cuxFn';

    const changeOrderData = CuxFn({
            name: 'BeforeCompanyOrder-fn-changeOrderData',
            value: { setOrderData, data: state?.orderData },
        })(
            ()=>{} // 要覆盖的标准函数
        );

        
    // class 组件中可以使用 注解的形式
    @cuxFn({name: 'test})
    test(){

    }
    ```

    3. 用法
    ```
    export default{
        'SRM-XXX': {
            functions: {
                // 有注释
                'BeforeCompanyOrder-fn-changeOrderData': {
                    function: changeOrderData,
                    description: xxxxxxxxx, // 需求描述
                    number: 'srm-xxx', // 需求号
                    version: '2022v0514', // 迭代版本
                },
                // 简易
                'BeforeCompanyOrder-fn-changeOrderData': changeOrderData,
            },
        }
    };
    ```

+ 二开路由
    > 在routes中写上对应的路由(建议写在当前二开包里的路径字符串)以及二开的页面组件会自动覆盖（二开或者新增路由）
    ```
    export default {
        routes: {
            path: '/add-purchase',
            component: () => import('./routes/OMSApplication'),
            description: xxxxxxxxx, // 需求描述
            number: 'srm-xxx', // 需求号
            version: '2022v0514', // 迭代版本
        }
    };
    ```

+ 个性化字段监听
    > 个性化单元作为key, 注册需要监听的字段绑定change的回调函数
    ```
    export default {
        routes: {
            'MALL.BEFORE.ORDER.OMS.CATA.LINE.SUPPLIER': {
                // 有注释
                attributeVarchar11: {
                    function: preOrderlineChangeAttr11,
                    description: xxxxxxxxx, // 需求描述
                    number: 'srm-xxx', // 需求号
                    version: '2022v0514', // 迭代版本
                },
                // 简易
                attributeVarchar11: preOrderlineChangeAttr11,
            },
        }
    };
    ```
        
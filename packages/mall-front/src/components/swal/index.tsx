import React from 'react';
import { Modal, Icon } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import style from './index.less';

type ResolveProps = {
  value?: boolean
}
interface InfoProps{
  message: string,
  modal?: any,
  resolve?: (ResolveProps) => void
}
interface SwalProps {
  msg?: string | SwalProps,
  cancelButtonFlag?: boolean,
  title?: React.ReactNode,
  cancelText?: React.ReactNode,
  confirmText?: React.ReactNode
}
type SwalArray = Array<SwalProps>
type SwalQueue = {
  props: SwalArray,
  resolve: (ResolveProps) => void,
  reject: (ResolveProps) => void,
}

let currentSwal: any;
// 提示队列 存的是接收参数
const swalQueue : Array<SwalQueue> = [];
// 内容区域组件
const Information: React.FC<InfoProps> =(infoProps)=> {
  const { message: infoMsg } = infoProps;

  return (
    <div className={style.info}>
      <span className={style.information}>{infoMsg}</span>
    </div>
  );
};

const swalAlert = (...props: SwalArray) : Promise<any> => {
    const [
        msg = '',
        cancelButtonFlag = false,
        title =
          <>
            <Icon type="error" style={{ color: '#FF9500' }} />
            {intl.get('mallf.common.view.change.warning').d('温馨提示')}
          </>,
        cancelText = intl.get(`mallf.common.button.cancel`).d('取消'),
        confirmText = intl.get(`mallf.common.model.sure`).d('确定'),
    ] = props;
    let message = intl.get(`mallf.common.view.queryErr`).d('查询出错');
    let msgCancelText;
    let msgConfirmText;
    // 异步 关闭时判断队列
    function afterClose(resolve, result){
        currentSwal = null; // 关闭后清除model引用
        resolve(result); // 触发对应的resolve/reject
        if(swalQueue.length){
            // 存在则取队列最前面的内容进行弹窗
          const first = swalQueue.shift();
          if (first) {
            const { props: firstProps, resolve: firstResolve } = first || {};
            swalAlert(...firstProps).then((newResult) => {
              firstResolve(newResult); // 触发对应的resolve/reject
            });
          }
        }
    }

    function onCancel(resolve){
        const result: ResolveProps = { value: false };
        afterClose(resolve, result);
    }

    function onOk(resolve){
        const result: ResolveProps = { value: true };
        afterClose(resolve, result);
    }

    // 处理参数msg
    if (msg && typeof msg === 'string') {
      message = msg;
    } else if (msg && typeof msg === 'object') {
      message = msg.msg;
      msgCancelText = msg.cancelText;
      msgConfirmText = msg.confirmText;
    }

    // 同步 当前存在swal则插入 且中断
    if(currentSwal){
        return new Promise((resolve, reject)=>{ // 支持队列异步resolve
            swalQueue.push({
                props,
                resolve,
                reject,
            });
        });
    }
    const config = (resolve) => ({
      title,
      children: <Information message={message} />,
      cancelButton: cancelButtonFlag,
      okText: msgConfirmText || confirmText,
      cancelText: msgCancelText || cancelText,
      onOk: ()=> onOk(resolve),
      onCancel: ()=> onCancel(resolve),
    });

    return new Promise((resolve) => {
        // 缓存model引用 并 打开弹窗
        currentSwal = Modal.open({
            className: style['modal-tips-name'],
            border: false,
            autoCenter: true,
            ...config(resolve),
        });
    });
  };

  export default swalAlert;
import React from 'react';
import intl from 'utils/intl';
import { Icon, Modal } from 'choerodon-ui/pro';
import style from './index.less';

function Message(props) {
  const { data = [] } = props;
  return data.slice(0, 3).map((n) => {
    return (
      <>
        【
        <span
          style={{
            display: 'inline-block',
            maxWidth: '100px',
            verticalAlign: 'bottom',
          }}
          className="text-overflow"
          title={n}
        >
          {n}
        </span>
        】
      </>
    );
  });
}

export default function openCuxWeakCheckModal(props) {
  const { dataList = [], needMsgFlag = true, tips, ...other } = props;
  return Modal.open({
    destroyOnClose: true,
    mask: true,
    className: style['modal-tips-name'],
    closable: false,
    style: { width: 560 },
    movable: false,
    autoCenter: true,
    border: false,
    title: (() => {
      return (
        <>
          <Icon type="error" style={{ color: '#FF9500' }} />
          {intl.get('mallf.common.view.change.warning').d('温馨提示')}
        </>
      );
    })(),
    children: (
      <>
        <div>
          {/* 需要有具体商品提示 */}
          {needMsgFlag && (
            <>
              {intl.get('mallf.common.view.product').d('商品')}
              <Message data={dataList} />
              {dataList.length > 3 ? intl.get('mallf.common.view.stockMore').d('等') : ''}
            </>
          )}
          {tips}
          <br />
        </div>
      </>
    ),
    ...other,
  });
}

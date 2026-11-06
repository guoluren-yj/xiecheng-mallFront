import React from 'react';
import { Modal, Button } from 'choerodon-ui';
import { Attachment } from 'choerodon-ui/pro';
import Image from 'components/Image';

import intl from 'utils/intl';
import { getPrimaryColor } from 'utils/utils';
import style from './index.less';

const { Sidebar } = Modal;

function CustomModal(props) {
  const { product, costomVisible, setCostomVisible, disabled = false } = props;
  const { customizedProductLineList = [] } = product || {};

  const customLineData = customizedProductLineList[0] || {};

  // 只读组件
  function viewComponent(type) {
    let Component = null;
    switch (type) {
      case 'UPLOAD':
        Component = (prop) => (
          <Attachment
            readOnly
            labelLayout="float"
            showHistory
            viewMode="list"
            bucketName="private-bucket"
            bucketDirectory="mall-front"
            onChange={(e) => e}
            {...prop}
          />
        );
        break;
      case 'IMAGE':
        Component = (prop) => (
          <>
            <div className={`${prop?.required ? 'custom-upload-label' : ''}`}>{prop.label}:</div>
            <Image {...prop} width={80} height={80} />
          </>
        );
        break;
      default:
        Component = (prop) => (
          <div style={{ display: 'flex' }}>
            <div style={{ width: '90px', marginRight: '10px' }}>{prop.label}: </div>
            <div style={{ width: 210 }}>
              {['LOV', 'SELECT'].includes(type) ? prop.valueName : prop.value}
            </div>
          </div>
        );
    }
    return (options) => Component(options);
  }

  const footerProps = {
    [disabled && 'footer']: [
      <Button
        style={{ width: 58, height: 32, background: getPrimaryColor(), color: '#fff' }}
        key="back"
        onClick={() => setCostomVisible(false)}
      >
        {intl.get('mallf.orderDetail.button.close').d('关闭')}
      </Button>,
    ],
  };

  return (
    <Sidebar
      closable
      width={380}
      destroyOnClose
      className={style['custom-modal']}
      title={intl.get('mallf.orderDetail.view.customInfo').d('规格定制')}
      visible={costomVisible}
      okText={intl.get(`mallf.orderDetail.model.confirm`).d('确认')}
      cancelText={intl.get(`mallf.orderDetail.button.cancel`).d('取消')}
      onCancel={() => setCostomVisible(false)}
      maskClosable={false}
      {...footerProps}
    >
      {customLineData.customizedProductValueList?.map((custom) => {
        const { componentName, cpDetailId, cpValue, cpValueName } = custom;
        const componentType =
          custom.componentType === 'IMAGE' && custom.inputMethod === 'MANUAL'
            ? 'UPLOAD'
            : custom.componentType;
        return (
          <div className="custom-item">
            {viewComponent(componentType)({
              name: `${cpDetailId}`,
              label: componentName,
              value: cpValue || cpValueName,
              valueName: cpValueName,
              style: {
                width: '100%',
              },
            })}
          </div>
        );
      })}
    </Sidebar>
  );
}

export default CustomModal;

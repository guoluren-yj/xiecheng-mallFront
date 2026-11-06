import React from 'react';
import { Modal, Button, Spin } from 'choerodon-ui';
import { Attachment } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getPrimaryColor } from 'utils/utils';
import style from './index.less';

const { Sidebar } = Modal;
export default function AssociatedDoc(props) {
  const { visible, toggleModal, product } = props;
  const {
    skuName,
    productName,
    allocationInfoList = [],
    customizedProductLineList = [],
    customFlag,
  } = product;
  const { customizedProductValueList = [] } = customizedProductLineList[0] || {};
  const infoList = allocationInfoList?.[0] || {};

  // 只读组件
  function viewComponent(type) {
    let Component = null;
    switch (type) {
      case 'UPLOAD':
      case 'IMAGE':
        Component = (prop) => {
          return (
            <Attachment
              readOnly
              labelLayout="float"
              showHistory
              viewMode="popup"
              bucketName="private-bucket"
              bucketDirectory="mall-front"
              onChange={(e) => e}
              showValidation="newLine"
              {...prop}
            />
          );
        };
        break;
      default:
        Component = (prop) => <span className="line-item-info">{prop?.value}</span>;
    }
    return (options) => Component(options);
  }

  return (
    <>
      <Sidebar
        title={intl.get('mallf.common.view.costAllocation').d('费用分配')}
        className={style.content}
        visible={visible}
        onCancel={toggleModal}
        width={380}
        footer={[
          <Button
            style={{ width: 58, height: 32, background: getPrimaryColor(), color: '#fff' }}
            key="back"
            onClick={toggleModal}
          >
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>,
        ]}
        closable
      >
        <Spin spinning={false}>
          <p className="content-title">{skuName || productName}</p>
          <p className="line-item">
            <span className="line-item-label">
              {intl.get('mallf.common.view.cost.shopping.address').d('费用承担写字楼/店铺')}:
            </span>
            <span className="line-item-info">
              {infoList.costShopCode}
              {infoList.costShopName}
            </span>
          </p>
          <p className="line-item">
            <span className="line-item-label">
              {intl.get('mallf.common.view.cost.shopping.bumen').d('费用承担部门')}:
            </span>
            <span className="line-item-info">{infoList.costDepartmentName}</span>
          </p>
          <p className="line-item">
            <span className="line-item-label">
              {intl.get('mallf.common.view.cost.shopping.shouhuocang').d('仓转店收货仓')}:
            </span>
            <span className="line-item-info">{infoList.receiveWarehouseName}</span>
          </p>
          <p className="line-item">
            <span className="line-item-label">
              {intl.get('mallf.common.view.cost.shopping.project').d('费用项目')}:
            </span>
            <span className="line-item-info">{infoList?.projectCostName}</span>
          </p>
          {/* <p className="line-item">
            <span className="line-item-label">
              {intl.get('mallf.common.view.cost.shopping.child.catalog').d('费用项目子分类')}:
            </span>
            <span className="line-item-info">{infoList?.projectCostSubcategoryName}</span>
          </p> */}
          {customFlag === 1 &&
            customizedProductValueList.map((custom) => {
              return (
                <p className="line-item">
                  <span className="line-item-label">{custom?.componentName}:</span>
                  {viewComponent(custom.componentType)({
                    value: custom?.cpValue,
                    style: {
                      width: '100%',
                    },
                  })}
                </p>
              );
            })}
        </Spin>
      </Sidebar>
    </>
  );
}

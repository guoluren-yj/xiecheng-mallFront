import React, { useState, useEffect } from 'react';
import { Modal } from 'choerodon-ui';
import { Button, Form } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
// import { getPrimaryColor } from 'utils/utils';
import OverflowTip from 'components/OverflowTip';
import styles from './index.less';
import ProductAllocationInfo from './ProductAllocationInfo';

const { Sidebar } = Modal;
function FillInfo(props) {
  const {
    dataSource = {},
    unitConfig = {},
    code,
    className,
    style,
    cSupply,
    headerCustomizedList,
    lineCustomizedList,
    fillCode,
    dataSet,
    isReceive,
  } = props;
  const { fields = [] } = unitConfig?.[code] || {};
  const { fields: fillFields = [] } = unitConfig?.[fillCode] || {};
  const { skuName, productName } = dataSource;
  const [visible, setVisible] = useState(false);
  const toggleModal = () => {
    setVisible((p) => !p);
  };
  useEffect(() => {
    if (dataSet) {
      dataSet.create();
    }
  }, [dataSource]);

  useEffect(() => {
    if (visible) {
      dataSet.current.set(dataSource);
    }
  }, [visible]);

  return (
    <>
      {((fields?.some((p) => p.visible === 1) && fields?.some((p) => dataSource[p?.fieldCode])) ||
        (fillFields?.some((p) => p.visible === 1) &&
          fillFields?.some((p) => dataSource[p?.fieldCode])) ||
        !isEmpty(headerCustomizedList) ||
        !isEmpty(lineCustomizedList)) && (
        <>
          <div className={`${className} primary-color`} style={style} onClick={toggleModal}>
            <OverflowTip>{intl.get('mallf.common.view.fill.info').d('补充信息')}</OverflowTip>
          </div>
          <Sidebar
            title={intl.get('mallf.common.view.fill.info').d('补充信息')}
            className={styles.content}
            visible={visible}
            onCancel={toggleModal}
            width={380}
            footer={[
              <Button
                wait={1000}
                color="primary"
                // style={{ width: 58, height: 32, background: getPrimaryColor(), color: '#fff' }}
                key="back"
                onClick={toggleModal}
              >
                {intl.get('hzero.common.button.close').d('关闭')}
              </Button>,
            ]}
            closable
          >
            {(skuName || productName) && <p className="content-title">{skuName || productName}</p>}
            <>
              {cSupply(
                { code, dataSet, readOnly: true },
                <Form
                  className="c7n-pro-vertical-form-display"
                  record={dataSet.current}
                  style={{ marginBottom: 15 }}
                  columns={1}
                />
              )}
              {!isReceive &&
                fillCode &&
                cSupply(
                  { code: fillCode, dataSet, readOnly: true, showVisible: true },
                  <Form
                    className="c7n-pro-vertical-form-display"
                    record={dataSet.current}
                    style={{ marginBottom: 15 }}
                    columns={1}
                  />
                )}
            </>
            {(!isEmpty(headerCustomizedList) || !isEmpty(lineCustomizedList)) && (
              <ProductAllocationInfo
                headerCustomizedList={headerCustomizedList}
                lineCustomizedList={lineCustomizedList}
              />
            )}
          </Sidebar>
        </>
      )}
    </>
  );
}

export default FillInfo;

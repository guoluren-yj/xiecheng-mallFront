import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from 'choerodon-ui';
import { Button, Form, DataSet, Output } from 'choerodon-ui/pro';

import UploadFile from 'components/CommonUpload';
import intl from 'utils/intl';
import styles from './index.less';

const { Sidebar } = Modal;
function FillInfo(props) {
  const { dataSource = {}, unitConfig = {}, code, className, style } = props;
  const { fields = [] } = unitConfig?.[code] || {};
  const { skuName, productName } = dataSource;
  const [visible, setVisible] = useState(false);
  const toggleModal = () => {
    setVisible((p) => !p);
  };
  const showAttribute11Flag = useMemo(() => {
    return dataSource.attributeVarchar30 !== '1' && dataSource.attributeVarchar20 !== '1';
  }, [dataSource]);

  const formDs = useMemo(() => {
    return new DataSet({
      fields: [
        {
          name: 'attributeVarchar11',
          label: intl.get('mallf.common.view.juecai.num').d('决裁号'),
          defaultValue: 'NA',
        },
        {
          name: 'attributeVarchar12',
          label: intl.get('mallf.common.view.juecai.num').d('决裁号'),
        },
        {
          name: 'attributeVarchar1',
          label: intl.get('mallf.common.view.supplier.remark').d('供应商备注'),
        },
        {
          name: 'attributeDate1',
          label: intl.get('mallf.myMall.model.requestDate').d('需求日期'),
        },
      ],
    });
  }, []);

  useEffect(() => {
    formDs.loadData([dataSource]);
  }, [dataSource]);

  return (
    <>
      {fields?.some((p) => p.visible === 1) && fields?.some((p) => dataSource[p?.fieldCode]) && (
        <>
          <div className={`${className} primary-color`} style={style} onClick={toggleModal}>
            {intl.get('mallf.common.view.fill.info').d('补充信息')}
          </div>
          <Sidebar
            title={intl.get('mallf.common.view.fill.info').d('补充信息')}
            className={styles.content}
            visible={visible}
            onCancel={toggleModal}
            width={380}
            footer={[
              <Button wait={1000} color="primary" key="back" onClick={toggleModal}>
                {intl.get('hzero.common.button.close').d('关闭')}
              </Button>,
            ]}
            closable
          >
            {(skuName || productName) && <p className="content-title">{skuName || productName}</p>}
            <Form
              dataSet={formDs}
              columns={1}
              className="c7n-pro-vertical-form-display"
              labelLayout="horizontal"
            >
              <Output r-if={showAttribute11Flag} name="attributeVarchar11" />
              <Output r-if={!showAttribute11Flag} name="attributeVarchar12" />
              <Output name="attributeVarchar1" />
              <Output name="attributeDate1" />
            </Form>
            {dataSource?.attachmentUuid && (
              <UploadFile
                maxSize={5}
                bucketName="private-bucket"
                directory="mall-front"
                disabled
                attachmentUuid={dataSource?.attachmentUuid}
              />
            )}
          </Sidebar>
        </>
      )}
    </>
  );
}

export default FillInfo;

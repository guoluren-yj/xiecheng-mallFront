import React, { useMemo, useEffect } from 'react';
import { isEmpty } from 'lodash';

import { Form, Output, DataSet, Modal, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';

function ProductAllocationInfoModal(props) {
  const { lineCustomizedList = [], headerCustomizedList = [] } = props;

  const { skuName, productName } = props?.product;
  const list = [
    ...headerCustomizedList?.filter((f) => (f.fxDisplayFlag || f.displayFlag) === 1),
    ...lineCustomizedList?.filter((f) => (f.fxDisplayFlag || f.displayFlag) === 1),
  ];
  const formDs = useMemo(() => {
    return new DataSet({
      fields: list.map((field) => ({
        name: `${field.lineNum ? 'line' : 'head'}${field.dimensionCode}`,
        label: field.dimensionName,
      })),
    });
  }, []);

  useEffect(() => {
    const obj = {};
    list.forEach((field) => {
      obj[`${field.lineNum ? 'line' : 'head'}${field.dimensionCode}`] =
        field.valueName || field.value;
    });
    formDs.create(obj);
  }, []);

  return (
    <>
      {(skuName || productName) && (
        <p
          style={{
            fontSize: 14,
            color: '#191919',
            lineHeight: '22px',
            marginBottom: 20,
            fontWeight: 500,
          }}
        >
          {skuName || productName}
        </p>
      )}
      <Form
        dataSet={formDs}
        columns={1}
        className="c7n-pro-vertical-form-display"
        labelLayout="horizontal"
      >
        {list.map((field) => (
          <Output name={`${field.lineNum ? 'line' : 'head'}${field.dimensionCode}`} />
        ))}
      </Form>
    </>
  );
}

export default function ProductAllocationInfo({
  style = {},
  headerCustomizedList = [],
  lineCustomizedList = [],
  product,
}) {
  function openModal() {
    const modal = Modal.open({
      destroyOnClose: true,
      title: intl.get('mallf.common.button.AllocationInfo').d('分配信息'),
      mask: true,
      closable: true,
      style: { width: 380 },
      drawer: true,
      children: (
        <ProductAllocationInfoModal
          product={product}
          headerCustomizedList={headerCustomizedList}
          lineCustomizedList={lineCustomizedList}
        />
      ),
      footer: [
        <Button onClick={() => modal.close()} color="primary">
          {intl.get('hzero.common.button.close').d('关闭')}
        </Button>,
      ],
    });
  }
  return (
    <>
      {(!isEmpty(headerCustomizedList) || !isEmpty(lineCustomizedList)) && (
        <a style={style} className="primary-color" onClick={() => openModal()}>
          {intl.get('mallf.common.button.AllocationInfo').d('分配信息')}
        </a>
      )}
    </>
  );
}

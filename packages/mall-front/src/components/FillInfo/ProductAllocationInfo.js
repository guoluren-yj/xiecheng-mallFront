import React, { useMemo, useEffect } from 'react';

import { Form, Output, DataSet, Attachment } from 'choerodon-ui/pro';

export default function ProductAllocationInfoModal(props) {
  const { lineCustomizedList = [], headerCustomizedList = [] } = props;

  const list = [
    ...headerCustomizedList?.filter((f) => (f.fxDisplayFlag || f.displayFlag) === 1),
    ...lineCustomizedList?.filter((f) => (f.fxDisplayFlag || f.displayFlag) === 1),
  ];
  const formDs = useMemo(() => {
    return new DataSet({
      fields: list.map((field) => ({
        name: `${field.lineNum ? 'line' : 'head'}${field.dimensionCode}`,
        label: field.dimensionName,
        type: field.componentType === 'UPLOAD' ? 'attachment' : 'string',
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

  const attProps = {
    readOnly: true,
    bucketName: 'private-bucket',
    bucketDirectory: 'mall-front',
    viewMode: 'list',
  };

  return (
    <>
      <Form
        dataSet={formDs}
        columns={1}
        className="c7n-pro-vertical-form-display"
        labelLayout="horizontal"
      >
        {list.map((field) =>
          field.componentType === 'UPLOAD' ? (
            <Attachment
              name={`${field.lineNum ? 'line' : 'head'}${field.dimensionCode}`}
              {...attProps}
            />
          ) : (
            <Output name={`${field.lineNum ? 'line' : 'head'}${field.dimensionCode}`} />
          )
        )}
      </Form>
    </>
  );
}

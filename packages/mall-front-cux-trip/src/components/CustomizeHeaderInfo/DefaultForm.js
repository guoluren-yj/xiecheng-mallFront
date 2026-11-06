import React, { useEffect } from 'react';
import { Form, Lov, Modal } from 'choerodon-ui/pro';
import customizes from 'cuxTools/customizes';

function DefaultForm({ customizeForm, code, form, order }) {
  const changeList = customizes[code] || {};

  useEffect(() => {
    handleDS();
  }, [order.DS]);

  const handleDS = () => {
    debugger;
    const optionsProps = {
      paging: 'server',
      idField: 'categoryId',
      parentField: 'parentCategoryId',
      record: {
        dynamicProps: {
          selectable: (record) => record.get('isCheck') !== false,
        },
      },
    };
    const fieldConfig = order.DS?.current?.getField?.('attributeVarchar1Lov');
    if (!fieldConfig) {
      order.DS.addField('attributeVarchar1Lov', {
        label: '采购项目品类',
        name: 'attributeVarchar1Lov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
        optionsProps,
      });
    } else {
      fieldConfig.set('optionsProps', optionsProps);
    }
  };

  const handleChange = (value) => {
    const {
      categoryId,
      categoryName,
      attributeVarchar3,
      attributeVarchar3Meaning,
      attributeVarchar2,
      attributeVarchar2Meaning,
    } = value || {};
    const copyData = {
      attributeVarchar1: categoryId,
      attributeVarchar1Meaning: categoryName,
      attributeVarchar4: attributeVarchar3,
      attributeVarchar4Meaning: attributeVarchar3Meaning,
      attributeVarchar3: attributeVarchar2,
      attributeVarchar3Meaning: attributeVarchar2Meaning,
    };
    if (order.DS.current) {
      order.DS.current.set(copyData);
    } else if (order.DS) {
      order.DS.create(copyData);
    }
  };

  return (
    <>
      {order.DS &&
        customizeForm(
          { code, form, changeList, changeParams: { order } },
          <Form dataSet={order.DS} labelLayout="float" columns={3}>
            <Lov
              name="attributeVarchar1Lov"
              searchable={false}
              tableProps={{
                mode: 'tree',
                onRow: (row) => {
                  const handleSelect = ({ dataSet, record: _record }) => {
                    if (dataSet && _record) {
                      dataSet.select(_record);
                    }
                  };
                  return {
                    onClick: () => handleSelect(row),
                    onDoubleClick: () => {
                      if (row?.record?.selectable) {
                        handleSelect(row);
                        handleChange(row?.record?.toData());
                        Modal.destroyAll();
                      }
                    },
                  };
                },
                selectionMode: 'rowbox',
                virtual: true,
                style: { maxHeight: '500px' },
              }}
              onChange={handleChange}
            />
          </Form>
        )}
    </>
  );
}

export default DefaultForm;

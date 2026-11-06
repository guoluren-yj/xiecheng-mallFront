import React, { useState, useMemo, useEffect } from 'react';
import {
  Form,
  DataSet,
  TextField,
  NumberField,
  Select,
  Lov,
  Attachment,
  Output,
  Spin,
} from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import Image from 'components/Image';

import { accept, imageAccept, DEFAULT_MAX } from 'utils/constants';
import intl from 'utils/intl';
import { getPrecision } from 'utils/utils';
import { fetchCustom } from 'services/cartService';

export default function Attrs(props) {
  const { modal, skuId, customList, onOk, readOnly, disabled } = props;

  const [loading, setLoading] = useState(false);

  const cache = useMemo(() => new Map(), []);

  const dataSet = useMemo(
    () =>
      new DataSet({
        paging: false,
      }),
    []
  );

  useEffect(() => {
    fetchGroups();
  }, []);

  async function fetchGroups() {
    try {
      setLoading(true);
      const res = await fetchCustom(skuId);
      if (res) {
        res.forEach((group) => {
          if (!isEmpty(group.customDetailList)) {
            group.customDetailList.forEach((f) => {
              cache.set(f.detailId, f);
            });
          }
        });
      }
    } finally {
      registerFields();
      setLoading(false);
    }
  }

  // 根据cpDetailId获取完整字段信息
  function getCustomAttr(f) {
    const componentType =
      f.componentType === 'IMAGE' && f.inputMethod === 'MANUAL' ? 'UPLOADIMAGE' : f.componentType;
    return { ...(cache.get(f.cpDetailId) || {}), ...f, componentType };
  }

  // 字段注册、数据创建
  function registerFields() {
    const customData = {};
    customList.forEach((f) => {
      const {
        cpValueId,
        cpValue,
        cpValueName,
        lovCode,
        lovView,
        componentType,
        componentName,
        requiredFlag,
        pricingFlag,
        inputMethod,
        componentPrecision,
      } = getCustomAttr(f);
      let fieldName = `custom_${cpValueId}`;
      let fieldValue = cpValue;
      let fieldProps = {};
      switch (componentType) {
        case 'INPUT_NUMBER':
          fieldProps = {
            min: componentPrecision ? getPrecision(componentPrecision) : 1,
            max: DEFAULT_MAX,
            step: getPrecision(componentPrecision),
          };
          break;
        case 'SELECT':
          fieldProps = {
            lookupCode: lovCode,
          };
          dataSet.addField(`${fieldName}_name`); // 值集name字段
          customData[`${fieldName}_name`] = cpValueName;
          break;
        case 'LOV':
          fieldProps = {
            lovCode,
            type: 'object',
          };
          if (lovView) {
            const lastFieldName = fieldName; // 记录标准name,方便取值
            fieldName = `${lastFieldName}_lov`;
            dataSet.addField(lastFieldName, {
              bind: `${fieldName}.${lovView.valueField}`,
            });
            dataSet.addField(`${lastFieldName}_name`, {
              bind: `${fieldName}.${lovView.displayField}`,
            });
            fieldValue = { [lovView.valueField]: cpValue, [lovView.displayField]: cpValueName };
          }

          break;
        case 'UPLOAD':
        case 'UPLOADIMAGE':
          fieldProps = {
            type: 'attachment',
          };
          break;
        default:
          break;
      }
      dataSet.addField(fieldName, {
        label: componentName,
        required: !!requiredFlag,
        disabled: disabled || !!pricingFlag || inputMethod === 'SYSTEM',
        ...fieldProps,
      });
      customData[fieldName] = fieldValue;
    });
    dataSet.create(customData);
  }

  modal.handleOk(() => handleOk());

  async function handleOk() {
    if (readOnly) return true;
    const flag = await dataSet.validate();
    if (flag) {
      const newCustomList = customList.map((m) => {
        const { cpValueId } = m;
        const cpValue = dataSet.current.get(`custom_${cpValueId}`);
        const cpValueName = dataSet.current.get(`custom_${cpValueId}_name`);
        return { ...m, cpValue, cpValueName };
      });

      return onOk(newCustomList);
    }
    return false;
  }

  function getAttachmentProps(acept = accept) {
    const maxSize = '5M';
    return {
      sortable: true,
      readOnly,
      bucketName: 'private-bucket',
      bucketDirectory: 'mall-front',
      viewMode: 'list',
      style: { paddingLeft: 0 },
      accept: acept,
      help: intl
        .get('mallf.common.view.attProps.help', { accept: acept, maxSize })
        .d(`支持${acept.join(',')}格式，且不能大于${maxSize}`),
      fileSize: 1024 * 1024 * 5,
      showValidation: 'newLine',
    };
  }

  function fieldRender(attr) {
    const { componentType, remark, cpValueId } = getCustomAttr(attr);
    const fieldName = componentType === 'Lov' ? `custom_${cpValueId}_lov` : `custom_${cpValueId}`;
    const fieldMap = {
      INPUT: {
        FormField: readOnly ? Output : TextField,
      },
      INPUT_NUMBER: {
        FormField: readOnly ? Output : NumberField,
      },
      SELECT: {
        FormField: readOnly ? Output : Select,
        props: {
          onChange: (value) => {
            const text = value ? dataSet.getField(fieldName).getLookupText(value) : '';
            dataSet.current.set(`custom_${cpValueId}_name`, text);
          },
        },
      },
      LOV: {
        FormField: readOnly ? Output : Lov,
      },
      IMAGE: {
        FormField: Output,
        props: {
          renderer: (val) => <Image value={val} width={80} height={80} />,
        },
      },
      UPLOAD: {
        FormField: Attachment,
        props: getAttachmentProps(),
      },
      UPLOADIMAGE: {
        FormField: Attachment,
        props: {
          ...getAttachmentProps(imageAccept),
          max: 1,
          listType: 'picture-card',
        },
      },
    };
    const { FormField = Output, props: fieldProps = {} } = fieldMap[componentType] || {};
    return <FormField name={fieldName} showHelp="tooltip" help={remark} {...fieldProps} />;
  }

  return (
    <Spin spinning={loading}>
      <Form dataSet={dataSet} labelLayout="float" columns={1}>
        {customList.map(fieldRender)}
      </Form>
    </Spin>
  );
}

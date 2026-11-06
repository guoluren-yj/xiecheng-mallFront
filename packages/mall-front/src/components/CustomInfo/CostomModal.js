import React, { useEffect, useState, useRef } from 'react';
import { Modal, Spin, Button, Tooltip } from 'choerodon-ui';
import { Form, DataSet, TextField, NumberField, Select, Lov, Attachment } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import Image from 'components/Image';
import uuid from 'uuid/v4';

import { accept, imageAccept, DEFAULT_MAX } from 'utils/constants';
import intl from 'utils/intl';
import { getPrimaryColor, awaitWrap, getUserConfigInfo, getPrecision } from 'utils/utils';
import { fetchCustom, fetchCustomData, saveCustom } from 'services/cartService';
import dataSet from './FormDs';
import style from './index.less';

const { Sidebar } = Modal;
function CustomModal(props) {
  const { product, costomVisible, setCostomVisible, onCustomOk, disabled = false } = props;
  const { productId, cartId, latestPrice, quantity } = product;
  const { isNewCart } = getUserConfigInfo();

  const [state, setState] = useState({
    tableLoading: false,
  });
  const { tableLoading } = state;
  const [customGroup, setCustomGroup] = useState([]); // 定制品组
  const [customItemList, setCustomItemList] = useState([]); // 定制品列维度
  const [customizedProductLineList, setCustomizedProductLineList] = useState(
    product?.customizedProductLineList || []
  ); // 定制品行数据
  const formDs = useRef(new DataSet(dataSet())).current;
  const customLineData = customizedProductLineList[0] || {};

  useEffect(() => {
    handleFetchCustom(); // 定制品属性维度查询
    if (!disabled && cartId && !isNewCart) handleFetchCustomData(); // 通过cartId关联查询定制品数据
  }, []);

  useEffect(() => {
    // 定制品
    if (product?.customFlag === 1) {
      const customData = {};
      // eslint-disable-next-line no-unused-expressions
      if (!isEmpty(customLineData.customizedProductValueList)) {
        // eslint-disable-next-line no-unused-expressions
        customLineData.customizedProductValueList?.forEach(async (c) => {
          const { lovView = {}, inputMethod, customAttrValue } =
            customItemList?.find((n) => n.detailId === c.cpDetailId) || {};
          const getDefault = (d) => {
            return inputMethod === 'SYSTEM' ? customAttrValue : d;
          };
          // eslint-disable-next-line no-param-reassign
          if (c.componentType === 'LOV') {
            const { displayField, valueField } = lovView;
            // lov值
            customData[`${c.cpDetailId}Lov`] = {
              [displayField]: c.cpValueName,
              [valueField]: c.cpValue,
            };
            customData[`${c.cpDetailId}Name`] = c.cpValueName; // 值集绑定name值
          }
          if (c.componentType === 'SELECT') {
            customData[`${c.cpDetailId}Name`] = c.cpValueName;
          }
          // ds字段绑定value值 // SYSTEM系统录入
          customData[c.cpDetailId] = getDefault(c.cpValue);
        });
        formDs.loadData([{ ...customData, ...customLineData, customItemList }]);
      } else if (customItemList?.some((n) => n.inputMethod === 'SYSTEM')) {
        customItemList
          .filter((n) => n.inputMethod === 'SYSTEM')
          .forEach((c) => {
            customData[c.detailId] = c.customAttrValue;
          });
        formDs.loadData([{ ...customData, ...customLineData, customItemList }]);
      } else {
        // 定制品初始化ds
        formDs.loadData([{ customItemList }]);
      }
    }
  }, [customItemList, customizedProductLineList, customGroup]);

  // 定制品维度查询
  function handleFetchCustom() {
    setState({
      ...state,
      tableLoading: true,
    });
    fetchCustom(productId)
      .then((res) => {
        if (res) {
          let newCustomItemList = [];
          res.forEach((n) => {
            const { pricingFlag, shipper, shipperFlag, shipperId, shipperCode } = n;
            const newCustomDetailList = n.customDetailList.map((m) => ({
              ...m,
              pricingFlag,
              shipper,
              shipperFlag,
              shipperId,
              shipperCode,
            }));
            newCustomItemList = [...newCustomItemList, ...newCustomDetailList];
          });
          // ds遍历添加field
          newCustomItemList.forEach((m) => {
            const {
              componentName,
              detailId,
              requiredFlag,
              lovCode,
              lovView = {},
              componentPrecision,
            } = m;
            const componentType =
              m.componentType === 'IMAGE' && m.inputMethod === 'MANUAL'
                ? 'UPLOADIMAGE'
                : m.componentType;
            let componentProps = {};
            switch (componentType) {
              case 'INPUT_NUMBER':
                componentProps = {
                  min: componentPrecision ? getPrecision(componentPrecision) : 1,
                  max: DEFAULT_MAX,
                  step: getPrecision(componentPrecision),
                  required: !!requiredFlag,
                };
                break;
              case 'SELECT':
                componentProps = {
                  lookupCode: lovCode,
                  required: !!requiredFlag,
                };
                formDs.addField(`${detailId}Name`); // 值集name字段
                break;
              case 'LOV':
                componentProps = {
                  lovCode,
                  type: 'object',
                  required: !!requiredFlag,
                };
                formDs.addField(`${detailId}`, {
                  bind: `${detailId}Lov.${lovView.valueField}`,
                });
                formDs.addField(`${detailId}Name`, {
                  bind: `${detailId}Lov.${lovView.displayField}`,
                });
                break;
              case 'UPLOAD':
              case 'UPLOADIMAGE':
                componentProps = {
                  type: 'attachment',
                  required: !!requiredFlag,
                };
                formDs.addField(`${detailId}`);
                break;
              default:
                componentProps = { required: !!requiredFlag };
            }
            formDs.addField(componentType === 'LOV' ? `${detailId}Lov` : `${detailId}`, {
              label: componentName,
              ...componentProps,
            });
          });
          setCustomGroup(res);
          setCustomItemList(newCustomItemList);
        }
      })
      .finally(() => {
        setState({
          ...state,
          tableLoading: false,
        });
      });
  }

  // 定制品数据查询
  function handleFetchCustomData() {
    fetchCustomData(product).then((res) => {
      if (res) setCustomizedProductLineList(res);
    });
  }

  // 处理定制品数据
  function handleCustomizedProductLineList() {
    const { shipper = null, shipperFlag = 0, shipperId, shipperCode } =
      customItemList.find((n) => n.pricingFlag === 1) || {};
    return formDs.toData().map((item) => {
      const { quantity: cpQuantity } = item;
      const { productId: skuId, companyId, sellPrice } = product;
      return {
        ...item,
        shipper,
        shipperId,
        shipperCode,
        shipperFlag,
        skuId,
        companyId,
        cartId,
        latestPrice: latestPrice || sellPrice,
        cpQuantity,
        customizedProductValueList: customItemList.map((n) => {
          const customItem =
            (item.customizedProductValueList || []).find((c) => c.cpDetailId === n.detailId) || {};
          return {
            ...n,
            ...customItem,
            cpGroupId: n.groupId,
            cpDetailId: n.detailId,
            cpValue: item[`${n.detailId}`],
            cpValueName: item[`${n.detailId}Name`], // 值集/lov需要name展示
          };
        }),
      };
    });
  }

  // 保存
  async function handleOK() {
    const customLineList = handleCustomizedProductLineList();
    formDs.forEach((record) => {
      // eslint-disable-next-line no-param-reassign
      record.status = 'update';
    });
    const flag = await formDs.validate();
    if (flag) {
      // 保存到缓存
      if (!cartId) {
        onCustomOk(customLineList);
      } else if (cartId && !disabled) {
        setState({
          ...state,
          tableLoading: true,
        });
        if (isNewCart) {
          onCustomOk({
            ...product,
            customizedProductLineList: customLineList,
          });
          setCostomVisible(false);
          return;
        }
        const params = [
          {
            ...customLineList[0],
            cartId,
            latestPrice,
            cpQuantity: quantity,
          },
        ];
        const [, res] = await awaitWrap(saveCustom(params));
        onCustomOk({
          ...product,
          customizedProductLineList: res,
          updateOrganizationFlag: 1,
        });
      }
      setState({
        ...state,
        tableLoading: false,
      });
      setCostomVisible(false);
    }
  }

  // 可编辑组件
  function getComponent(type, extra) {
    let Component = null;
    switch (type) {
      case 'EMPTY':
        Component = () => <div />;
        break;
      case 'INPUT':
        Component = (prop) => {
          return <TextField {...prop} showHelp="tooltip" help={prop?.remark} />;
        };
        break;
      case 'INPUT_NUMBER':
        Component = (prop) => <NumberField {...prop} showHelp="tooltip" help={prop?.remark} />;
        break;
      case 'SELECT':
        Component = (prop) => <Select {...prop} showHelp="tooltip" help={prop?.remark} />;
        break;
      case 'LOV':
        Component = (prop) => <Lov {...prop} showHelp="tooltip" help={prop?.remark} />;
        break;
      case 'IMAGE':
        Component = (prop) => (
          <>
            <div className={`${prop?.required ? 'custom-upload-label' : ''}`}>{prop.label}:</div>
            <Image {...prop} width={80} height={80} />
          </>
        );
        break;
      case 'UPLOAD':
        Component = (prop) => {
          const maxSize = '5M';
          const attProps = {
            sortable: true,
            bucketName: 'private-bucket',
            bucketDirectory: 'mall-front',
            viewMode: 'list',
            attachmentUUID: prop.value || uuid(),
            value: prop.value || uuid(),
            style: { paddingLeft: 0 },
            accept,
            help: intl
              .get('mallf.common.view.attProps.help', { accept, maxSize })
              .d(`支持${accept.join(',')}格式，且不能大于${maxSize}`),
            fileSize: 1024 * 1024 * 5,
            showValidation: 'newLine',
            ...prop,
          };
          return (
            <>
              <Attachment {...attProps} />
            </>
          );
        };
        break;
      case 'UPLOADIMAGE':
        Component = (prop) => {
          const maxSize = '5M';
          const attProps = {
            sortable: true,
            bucketName: 'private-bucket',
            bucketDirectory: 'mall-front',
            max: 1,
            listType: 'picture-card',
            attachmentUUID: prop.value || uuid(),
            value: prop.value || uuid(),
            style: { paddingLeft: 0 },
            accept: imageAccept,
            help: intl
              .get('mallf.common.view.attProps.help', { accept: imageAccept, maxSize })
              .d(`支持${imageAccept.join(',')}格式，且不能大于${maxSize}`),
            fileSize: 1024 * 1024 * 5,
            showValidation: 'newLine',
            ...prop,
          };
          return (
            <>
              <Attachment {...attProps} />
            </>
          );
        };
        break;
      default:
        Component = (prop) => <TextField {...prop} />;
    }
    return (options) => Component(options, extra);
  }

  // 只读组件
  function viewComponent(type) {
    let Component = null;
    switch (type) {
      case 'LOV':
        Component = (prop) => {
          return (
            <div style={{ display: 'flex' }}>
              <div style={{ width: '90px', marginRight: '10px' }}>{prop.label}: </div>
              <div style={{ flex: 1 }}>{formDs.toData()[0]?.[`${prop.name}Name`]}</div>
            </div>
          );
        };
        break;
      case 'SELECT':
        Component = (prop) => {
          return (
            <div style={{ display: 'flex' }}>
              <div style={{ width: '90px', marginRight: '10px' }}>{prop.label}: </div>
              <div style={{ flex: 1 }}>{formDs.toData()[0]?.[`${prop.name}Name`]}</div>
            </div>
          );
        };
        break;
      case 'IMAGE':
        Component = (prop) => (
          <>
            <div className={`${prop?.required ? 'custom-upload-label' : ''}`}>{prop.label}:</div>
            <Image {...prop} width={80} height={80} />
          </>
        );
        break;
      case 'UPLOAD':
      case 'UPLOADIMAGE':
        Component = (prop) => {
          return (
            <Attachment
              readOnly
              labelLayout="float"
              max={1}
              listType="text"
              viewMode="list"
              bucketName="private-bucket"
              bucketDirectory="mall-front"
              showValidation="newLine"
              {...prop}
            />
          );
        };
        break;
      default:
        Component = (prop) => (
          <div style={{ display: 'flex' }}>
            <div style={{ width: '90px', marginRight: '10px' }}>{prop.label}: </div>
            <div style={{ flex: 1 }}>{formDs.toData()[0]?.[prop.name]}</div>
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
        {intl.get('hzero.common.button.close').d('关闭')}
      </Button>,
    ],
  };

  return (
    <Sidebar
      closable
      width={380}
      destroyOnClose
      className={style['custom-modal']}
      title={intl.get('mallf.common.view.customInfo').d('规格定制')}
      visible={costomVisible}
      okText={intl.get(`mallf.common.model.confirm`).d('确认')}
      cancelText={intl.get(`mallf.common.button.cancel`).d('取消')}
      onCancel={() => setCostomVisible(false)}
      onOk={handleOK}
      confirmLoading={tableLoading}
      maskClosable={false}
      {...footerProps}
    >
      <Spin spinning={tableLoading}>
        <Form dataSet={formDs} labelLayout="float" columns={1}>
          {customGroup.map((item) => {
            const { attrGroupName, customDetailList, shipperFlag, shipper } = item;
            return (
              <>
                <div className="custom-group-title">
                  {attrGroupName}
                  <Tooltip title={intl.get('mallf.common.view.custom.shipper').d('辅助单位')}>
                    <span>{!!shipperFlag && `(${shipper})`}</span>
                  </Tooltip>
                </div>
                {customDetailList.map((custom) => {
                  const {
                    componentName,
                    detailId,
                    customAttrValue,
                    requiredFlag,
                    inputMethod,
                    remark,
                  } = custom;
                  const componentType =
                    custom.componentType === 'IMAGE' && custom.inputMethod === 'MANUAL'
                      ? 'UPLOADIMAGE'
                      : custom.componentType;
                  return (
                    <div className="custom-item">
                      {disabled
                        ? viewComponent(componentType)({
                            name: `${detailId}`,
                            label: componentName,
                            value: customAttrValue,
                            style: {
                              width: '100%',
                            },
                          })
                        : getComponent(componentType)({
                            name: componentType === 'LOV' ? `${detailId}Lov` : `${detailId}`,
                            label: componentName,
                            required: !!requiredFlag,
                            disabled: inputMethod === 'SYSTEM',
                            value: customAttrValue,
                            type: custom.componentType,
                            remark,
                            style: {
                              width: '100%',
                            },
                          })}
                    </div>
                  );
                })}
              </>
            );
          })}
        </Form>
      </Spin>
    </Sidebar>
  );
}

export default CustomModal;

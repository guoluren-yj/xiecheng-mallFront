import React, { useMemo } from 'react';
import { Tooltip, Icon } from 'choerodon-ui';
import {
  Table,
  Form,
  TextField,
  NumberField,
  Select,
  Lov,
  Button,
  DatePicker,
  Switch,
  TextArea,
  Output,
  Attachment,
} from 'choerodon-ui/pro';
import { isNil, debounce } from 'lodash';
import { observer } from 'mobx-react-lite';

import { DEFAULT_MAX, accept } from 'utils/constants';
import intl from 'utils/intl';
import { precisionEditor } from 'utils/precision';
import { getPrimaryColor, calcValidatePack } from 'utils/utils';
import { getOpenCartFlag } from 'utils/configUtils';
import CuxFn from '@/cuxTools/cuxFn';

import AddressLov from 'components/AddressLov';
import ChooseUnit from './ChooseUnit';
import { buttonRender } from './renderUtils';

const HeaderForm = observer(
  ({
    ds,
    readOnly,
    headerDisplayDimension,
    headerEnabledDimension,
    headerDsObj,
    headerIndex,
    getComponent,
  }) => {
    return (
      <Form
        dataSet={ds}
        labelLayout={readOnly ? 'horizontal' : 'float'}
        className={readOnly ? 'c7n-pro-vertical-form-display' : ''}
        labelAlign="left"
        columns={3}
      >
        {headerDisplayDimension.map((header) => {
          const { dimension, dimensionComponent } = header;
          const { dimensionCode, dimensionName, editFlag, annotation } = dimension;
          const { componentType } = dimensionComponent;
          const fxDisplayFlag = ds?.current?.data[`${dimensionCode}fxDisplayFlag`];
          if (fxDisplayFlag === 0) {
            return null;
          }
          if (dimensionCode === 'unitId') {
            return readOnly ? (
              <Output
                name="unitId"
                renderer={({ record }) => record.data.unitName}
                help={annotation}
                showHelp="label"
                label={intl.get('mallf.common.view.label.organization').d('组织')}
              />
            ) : (
              <ChooseUnit
                headerDimension={headerEnabledDimension}
                dimension={dimension}
                dataSet={headerDsObj[headerIndex]}
              />
            );
          } else {
            return getComponent(
              componentType,
              dimension,
              ds
            )({
              name: componentType === 'LOV' ? `${dimensionCode}Lov` : `${dimensionCode}`,
              label: dimensionName,
              type: componentType,
              disabled: !editFlag,
              style: {
                width: '100%',
              },
              help: annotation,
              showHelp: 'tooltip',
            });
          }
        })}
      </Form>
    );
  }
);

const LineTable = observer(
  ({
    ds,
    headerIndex,
    noCreateFlag,
    noFetchFlag,
    showBuyNow,
    manualFlag,
    handleCreate,
    handleCopy,
    allocationData,
    getColumns,
    templateId,
  }) => {
    return (
      <Table
        parityRow={false}
        virtualCell={false}
        dataSet={ds}
        columns={getColumns({ ds })}
        buttons={buttonRender({
          ds,
          headerIndex,
          noCreateFlag,
          noFetchFlag,
          showBuyNow,
          manualFlag,
          handleCreate,
          handleCopy,
        })}
        autoValidationLocate
        customizedCode={
          allocationData.length < 20 ? `MALL.NEWCART.ALLOCATION.TABLE${templateId}` : null
        }
      />
    );
  }
);

export default function AllocationItem({
  allocation,
  index,
  allocationData,
  lineDsObj,
  readOnly = true,
  showBuyNow,
  manualFlag,
  noCreateFlag,
  noFetchFlag,
  noAction,
  headerDsObj,
  headerDisplayDimension,
  headerEnabledDimension,
  lineDisplayDimension,
  product = {},
  templateId,
  singleLineFlag,
  handleCreate = (e) => e,
  handleCopy = (e) => e,
  handleDelete = (e) => e,
  handleCopyAllocation = (e) => e,
}) {
  const {
    shipperFlag,
    cartId,
    ladderPriceFlag,
    punchoutFlag,
    linkType,
    centralizedStatus,
  } = product;
  const {
    headerIndex,
    headerNum,
    _status,
    success: oldSuccess,
    errorMsg,
    ladderPriceList,
    currencySymbol,
    uomName,
  } = allocation;
  const noDeleteFlag = allocationData.filter((n) => n._status !== 'add')?.length === 1;
  const taxIncludedPrice = lineDsObj[headerIndex]?.current?.get('taxIncludedPrice');
  const success = useMemo(() => (centralizedStatus === 'SUBMITTED' ? 1 : oldSuccess), [
    oldSuccess,
    centralizedStatus,
  ]); // 已加入拼单商品不报错
  // 阶梯价最低价最高价
  const [ladderMinPrice, ladderMaxPrice] = useMemo(() => {
    const priceList = (ladderPriceList || []).map((n) => +n.salePrice || 0);
    const min = Math.min(...priceList);
    const max = Math.max(...priceList);
    return [min, max];
  }, [ladderPriceList]);

  // 可编辑组件
  function getComponent(type, extra, ds) {
    let Component = null;
    if (readOnly && type !== 'UPLOAD') {
      Component = (prop) => <Output className="text-overflow" {...prop} showHelp="label" />;
      return (options) => Component(options, extra);
    }
    switch (type) {
      case 'INPUT':
        Component = (prop) => {
          return <TextField {...prop} />;
        };
        break;
      case 'INPUT_NUMBER':
        Component = (prop) => <NumberField {...prop} />;
        break;
      case 'SELECT':
        Component = (prop) => <Select {...prop} />;
        break;
      case 'LOV':
        Component = (prop, { treeSelectFlag }) => {
          return prop.name === 'addressIdLov' ? (
            <AddressLov
              noCache
              dataSet={ds}
              {...prop}
              onBeforeSelect={(record) => !(treeSelectFlag && +record?.get('hasChild'))}
              tableProps={{
                onRow: ({ record }) => {
                  return {
                    onClick: () => {
                      Object.assign(record, { isExpanded: !record.isExpanded });
                    },
                  };
                },
              }}
            />
          ) : (
            <Lov
              noCache
              {...prop}
              onBeforeSelect={(record) => !(treeSelectFlag && +record?.get('hasChild'))}
              tableProps={{
                onRow: ({ record }) => {
                  return {
                    onClick: () => {
                      Object.assign(record, { isExpanded: !record.isExpanded });
                    },
                  };
                },
              }}
            />
          );
          // );
        };
        break;
      case 'DATE_PICKER':
        Component = (prop) => <DatePicker {...prop} />;
        break;
      case 'SWITCH':
        Component = (prop) => (
          <div>
            <span>{prop.label}</span>
            <Switch {...prop} style={{ width: 50 }} showHelp="newLine" />
          </div>
        );
        break;
      case 'TEXT_AREA':
        Component = (prop) => <TextArea {...prop} rows={1} resize="both" showHelp="newLine" />;
        break;
      case 'UPLOAD':
        Component = (prop) => {
          const maxSize = '5M';
          const attProps = {
            sortable: true,
            readOnly,
            viewMode: 'list',
            style: { paddingLeft: 0 },
            accept,
            fileSize: 1024 * 1024 * 5,
            showValidation: 'newLine',
            ...prop,
            help: (
              <div>
                <div r-if={prop.help}>{prop.help}</div>
                <div r-if={!readOnly}>
                  {intl
                    .get('mallf.common.view.attProps.help', { accept, maxSize })
                    .d(`支持${accept.join(',')}格式，且不能大于${maxSize}`)}
                </div>
              </div>
            ),
            showHelp: 'newLine',
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

  const getColumns = ({ ds }) => {
    const lineColumns = lineDisplayDimension.map((item) => {
      const { dimension, dimensionComponent } = item;
      const {
        dimensionCode,
        dimensionName,
        editFlag,
        width,
        treeSelectFlag,
        annotation,
      } = dimension;
      const { componentType } = dimensionComponent;
      const {
        [`${dimensionCode}fxDisplayFlag`]: fxDisplayFlag,
        // [`${dimensionCode}fxEditFlag`]: fxEditFlag,
      } = ds?.data?.[0]?.data || {};
      const getEditFlag = (record) =>
        [1, 0].includes(record.get(`${dimensionCode}fxEditFlag`))
          ? !!record.get(`${dimensionCode}fxEditFlag`)
          : !!editFlag;
      if (fxDisplayFlag === 0) {
        return null;
      }
      if (dimensionCode === 'quantity') {
        return {
          name: dimensionCode,
          width: width || 120,
          align: 'left',
          help: annotation,
          header: (dataSet) => {
            const {
              minPackageQuantity,
              minPurchaseQuantity,
              purchaseQuantityLimit,
              totalCqNum,
              uomPrecision,
            } = dataSet.data?.[0]?.data || {};
            const minLimit = minPurchaseQuantity || 1;
            // 购物车静态提示
            const handleProductComfirmInfo = () => {
              return (
                <>
                  {shipperFlag === 1 && totalCqNum && (
                    <>
                      <span>{intl.get('mallf.common.view.customNumber').d('定制品数量')}：</span>
                      {totalCqNum}
                    </>
                  )}
                  {minLimit > 1 && (
                    <div>
                      {intl
                        .get(`mallf.common.model.minPurchaseNumber`, {
                          value: minLimit,
                        })
                        .d(`最小购买量为${minLimit}`)}
                    </div>
                  )}
                  {minPackageQuantity > 1 && calcValidatePack(uomPrecision, minPackageQuantity) && (
                    <div>
                      {`${intl
                        .get('mallf.common.view.errorMinPackageQuantity')
                        .d('最小包装量为')}${minPackageQuantity}`}
                    </div>
                  )}
                  {!isNil(purchaseQuantityLimit) && purchaseQuantityLimit < DEFAULT_MAX && (
                    <div>
                      {intl
                        .get('mallf.common.model.maxPurchaseNumbers', {
                          value: purchaseQuantityLimit,
                        })
                        .d(`最大购买量为${purchaseQuantityLimit}`)}
                    </div>
                  )}
                </>
              );
            };
            return (
              <>
                <span>{dimensionName}</span>
                <Tooltip title={handleProductComfirmInfo()}>
                  {((shipperFlag === 1 && totalCqNum) ||
                    minLimit > 1 ||
                    (minPackageQuantity > 1 && !uomPrecision) ||
                    (!isNil(purchaseQuantityLimit) && purchaseQuantityLimit < DEFAULT_MAX)) && (
                    <Icon
                      type="error"
                      style={{
                        color: '#FCA000',
                        marginLeft: '5px',
                        fontSize: 14,
                        fontWeight: 100,
                      }}
                    />
                  )}
                </Tooltip>
              </>
            );
          },
          editor: (record) => {
            return !readOnly && getEditFlag(record);
          },
        };
      }
      // 处理单价精度
      if (dimensionCode === 'taxIncludedPrice') {
        return {
          name: dimensionCode,
          width: width || 120,
          help: annotation,
          editor: (record) => {
            return precisionEditor({
              record,
              name: 'taxIncludedPrice',
              precision: headerDsObj[headerIndex]?.current?.get('defaultPrecision') || 0,
            });
          },
        };
      }
      if (dimensionCode === 'taxIncludedAmount') {
        return {
          name: dimensionCode,
          width: width || 120,
          align: 'right',
          help: annotation,
          renderer: ({ value }) => (
            <span style={{ color: '#FA6400' }}>
              {headerDsObj[headerIndex]?.current?.get('currencySymbol') || currencySymbol}
              {value}
            </span>
          ),
        };
      }
      if (componentType === 'SWITCH') {
        return {
          name: dimensionCode,
          width: width || 120,
          help: annotation,
          editor: () => {
            return <Switch readOnly={readOnly} />;
          },
        };
      }
      if (componentType === 'TEXT_AREA') {
        return {
          name: dimensionCode,
          width: width || 120,
          help: annotation,
          editor: (record) => {
            return !readOnly && getEditFlag(record) && <TextArea rows={1} />;
          },
        };
      }
      if (componentType === 'LOV') {
        return {
          name: `${dimensionCode}Lov`,
          width: width || 120,
          help: annotation,
          editor: (r) => {
            return (
              !readOnly &&
              getEditFlag(r) && (
                <Lov
                  onBeforeSelect={(record) => !(treeSelectFlag && +record?.get('hasChild'))}
                  tableProps={{
                    onRow: ({ record }) => {
                      return {
                        onClick: () => {
                          Object.assign(record, { isExpanded: !record.isExpanded });
                        },
                      };
                    },
                  }}
                />
              )
            );
          },
        };
      }
      return {
        name: dimensionCode,
        width: width || 120,
        help: annotation,
        editor: (record) => {
          return !readOnly && getEditFlag(record);
        },
      };
    });
    const cuxColumns = CuxFn({
      name: 'CartProCopy-fn-cuxColumns',
      value: {
        ds,
        columns: lineColumns,
        headerDs: headerDsObj[headerIndex],
        allocationItemData: allocationData[headerIndex - 1],
      },
    })(() => [])();
    const columns = [
      {
        name: 'orderSeq',
        width: 60,
        renderer: ({ record }) => record.index + 1,
      },
      ...lineColumns,
      ...cuxColumns,
      !readOnly &&
        !noAction && {
          name: 'action',
          width: 100,
          renderer: ({ record }) => {
            const { _status: status, lineNum } = record.data;
            // 只有一条已保存的行信息不允许删除
            const deleteDisabled =
              lineDsObj[headerIndex].toData().filter((n) => n._status !== 'add')?.length === 1;
            return status === 'add' || allocationData[headerIndex - 1]?._status === 'add' ? (
              <a
                disabled={lineDsObj[headerIndex].data.length === 1}
                onClick={() => lineDsObj[headerIndex].remove(record, true)}
              >
                {intl.get('hzero.common.btn.cancel').d('取消')}
              </a>
            ) : (
              <a
                disabled={deleteDisabled}
                style={{ color: !deleteDisabled && getPrimaryColor() }}
                onClick={() =>
                  handleDelete({ deleteType: 'line', cartId, headerIndex, headerNum, lineNum })
                }
              >
                {intl.get('hzero.common.btn.delete').d('删除')}
              </a>
            );
          },
        },
    ];
    return columns.filter((n) => !!n);
  };

  // 阶梯价
  function ladderPriceRender() {
    return (
      <div style={{ padding: '5px', width: '125px' }}>
        <div style={{ marginBottom: '10px' }}>
          {intl.get(`mallf.cart.view.cart.rangPrice`).d('阶梯价格')}
        </div>
        {(ladderPriceList || []).map((item) => {
          const { ladderFrom, ladderTo, salePrice } = item;
          return (
            <div style={{ marginBottom: '5px', color: '#fff' }}>
              <span>{ladderTo ? `${ladderFrom}-${ladderTo}` : `>=${ladderFrom}`}</span>
              <span style={{ float: 'right' }}>{salePrice}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // 防止一直点复制
  const copyAllocation = debounce(() => {
    handleCopyAllocation(allocation);
  }, [500]);

  const CuxBudgetWarn = CuxFn({
    name: 'newCart-fn-cuxBudgetWarn',
  });

  const CuxAppendBtn = CuxFn({
    name: 'newCart-fn-cuxAppendBtn',
    value: {
      manualFlag,
      noFetchFlag,
      headerDs: headerDsObj[headerIndex],
      lineDs: lineDsObj[headerIndex],
    },
  });

  const headerProps = {
    ds: headerDsObj[headerIndex],
    readOnly,
    headerDisplayDimension,
    headerEnabledDimension,
    headerDsObj,
    headerIndex,
    getComponent,
  };

  const lineProps = {
    ds: lineDsObj[headerIndex],
    headerIndex,
    noCreateFlag,
    noFetchFlag,
    showBuyNow,
    manualFlag,
    handleCreate,
    handleCopy,
    allocationData,
    getColumns,
    templateId,
  };

  return (
    <div id={index} className={`aollocation-item ${success === 0 ? 'aollocation-item-error' : ''}`}>
      <div className="item-title">
        <div className="item-title-left">
          {success === 0 ? (
            errorMsg
          ) : singleLineFlag ? (
            <span className="item-title-price">{product.productName}</span>
          ) : (
            <>
              {index + 1 < 10 ? `0${index + 1}` : index + 1}
              {_status !== 'add' && (
                <span r-if={!manualFlag}>
                  <span style={{ margin: '0 12px' }}>|</span>
                  <span className="item-title-price">
                    {intl.get(`mallf.common.model.unitPrice`).d('单价(含税)')}：
                    {currencySymbol || product.currencySymbol}
                    {ladderPriceFlag && getOpenCartFlag(linkType)
                      ? ladderMinPrice
                      : `${taxIncludedPrice}/${uomName || product.uomName}`}
                  </span>
                  <span
                    r-if={ladderPriceFlag && getOpenCartFlag(linkType)}
                    className="item-title-price"
                  >
                    &nbsp;-&nbsp;
                    {currencySymbol}
                    {ladderMaxPrice}
                  </span>
                </span>
              )}
            </>
          )}
        </div>
        <div className="item-title-right">
          {!!ladderPriceFlag && (
            <Tooltip placement="left" title={ladderPriceRender()}>
              <Button icon="find_in_page" funcType="flat" color="primary">
                {intl.get(`mallf.cart.view.cart.rangPrice`).d('阶梯价格')}
              </Button>
            </Tooltip>
          )}
          {!punchoutFlag && !showBuyNow && !noAction && (
            <Button
              icon="baseline-file_copy"
              funcType="flat"
              color="primary"
              disabled={success === 0}
              onClick={() => copyAllocation()}
            >
              {intl.get('mallf.common.view.copy').d('复制')}
            </Button>
          )}
          {/* 仅有一条时不允许删除 */}
          {((noDeleteFlag && _status === 'add') || !noDeleteFlag) && !showBuyNow && !noAction && (
            <Button
              icon="delete"
              funcType="flat"
              color="primary"
              onClick={() => handleDelete({ deleteType: 'head', cartId, headerIndex, headerNum })}
            >
              {intl.get('hzero.common.btn.delete').d('删除')}
            </Button>
          )}
          {CuxAppendBtn()}
        </div>
      </div>
      <div className="item-header">
        <HeaderForm {...headerProps} />
      </div>
      {CuxBudgetWarn()}
      <div className="item-line">
        <LineTable {...lineProps} />
      </div>
    </div>
  );
}

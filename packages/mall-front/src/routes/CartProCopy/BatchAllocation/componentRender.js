import React from 'react';
import { Table, Form, Button } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';
import { isNil } from 'lodash';
import classNames from 'classnames';

import Image from 'components/Image';
import intl from 'utils/intl';
import { convertImg, priceNumberRender } from 'utils/utils';
import { precisionEditor } from 'utils/precision';
import { PermissionButton } from 'components/Permission';

import CuxFn from 'cuxTools/cuxFn';
import AddressLov from 'components/AddressLov';
import { getComponent, getColumns } from './func';
import ChooseUnit from './ChooseUnit';
import { getMamanualRequestImg } from '../EmptyImages';

export const headerFormRender = ({
  headerDisplayDimension,
  headerEnabledDimension,
  headerDs: record,
}) => {
  return (
    <Form record={record} labelLayout="float" columns={3}>
      {headerDisplayDimension.map((header) => {
        const { dimension, dimensionComponent } = header;
        const { dimensionCode, dimensionName, editFlag, annotation } = dimension;
        const { componentType } = dimensionComponent;
        const fxDisplayFlag = record.get(`${dimensionCode}fxDisplayFlag`);
        if (fxDisplayFlag === 0) {
          return null;
        }
        if (dimensionCode === 'unitId') {
          return (
            <ChooseUnit
              headerDimension={headerEnabledDimension}
              dimension={dimension}
              record={record}
            />
          );
        } else if (dimensionCode === 'addressId') {
          return <AddressLov dataSet={record} />;
        } else {
          return (
            <div className="header-component">
              {getComponent(componentType)({
                name: componentType === 'LOV' ? `${dimensionCode}Lov` : `${dimensionCode}`,
                label: dimensionName,
                type: componentType,
                disabled: !editFlag,
                style: {
                  width: '100%',
                },
                help: annotation,
                showHelp: 'tooltip',
              })}
            </div>
          );
        }
      })}
    </Form>
  );
};

const expandedRowRender = (
  { record: partentRecord },
  { openProductListModal = (e) => e, alloctionDs, headerDs }
) => {
  const oldChildColumns = [
    {
      name: 'productInfo',
      width: 290,
      tooltip: 'none',
      className: 'product-info',
      visabled: !alloctionDs.hasManulFlag,
      renderer: ({ record: r }) => {
        const { productName, imagePath, productSource } = r.get([
          'productName',
          'imagePath',
          'productSource',
        ]);
        return (
          <div className="product-info">
            <div className="goods-img">
              <div r-if={productSource === 'MANUAL'}>
                {getMamanualRequestImg({ width: '41px', height: '41px' })}
              </div>
              <Image
                r-if={productSource !== 'MANUAL'}
                value={convertImg(imagePath, 1, productSource)}
                width={41}
                height={41}
              />
            </div>
            <div r-title className="goods-product-name text-overflow">
              {productName}
            </div>
          </div>
        );
      },
    },
    {
      name: 'productName',
      width: 150,
      visabled: alloctionDs.hasManulFlag,
      editor: true,
    },
    {
      name: 'taxIncludedPrice',
      width: 150,
      align: 'right',
      editor: (record) => {
        return (
          alloctionDs.hasManulFlag &&
          precisionEditor({
            record,
            name: 'taxIncludedPrice',
            precision: headerDs.get('defaultPrecision') || 0,
          })
        );
      },
      renderer: ({ record: r }) => {
        const { taxIncludedPrice, uomName, taxIncludedPriceMeaning, currencySymbol } = r.get([
          'taxIncludedPrice',
          'uomName',
          'taxIncludedPriceMeaning',
          'currencySymbol',
        ]);
        return (
          <>
            {currencySymbol || ''}
            {alloctionDs.hasManulFlag
              ? taxIncludedPrice
              : taxIncludedPriceMeaning || taxIncludedPrice}
            {uomName ? `/${uomName}` : ''}
          </>
        );
      },
    },
    {
      name: 'quantity',
      width: 180,
      editor: () => !alloctionDs.hasPunchoutFlag,
    },
    {
      name: 'totalPrice',
      width: 150,
      header: (
        <p style={{ maxWidth: 300, textAlign: 'right', margin: 0 }}>
          {intl.get(`mallf.common.view.subtotal`).d('小计')}
        </p>
      ),
      renderer: ({ record: r }) => {
        const {
          taxIncludedPrice,
          quantity,
          financialPrecision,
          currencySymbol,
          priceBatchQuantity,
          taxIncludedAmountMeaning,
        } = r.get([
          'taxIncludedPrice',
          'quantity',
          'financialPrecision',
          'currencySymbol',
          'priceBatchQuantity', // 价格批量
          'taxIncludedAmountMeaning',
        ]);
        // 价格批量的前端不计算小计
        const totalPrice = isNil(priceBatchQuantity)
          ? priceNumberRender(math.multipliedBy(taxIncludedPrice, quantity), financialPrecision)
          : taxIncludedAmountMeaning;
        return (
          <p
            className="price-color text-overflow"
            style={{ maxWidth: 300, textAlign: 'right', margin: 0 }}
          >
            {currencySymbol}
            {totalPrice}
          </p>
        );
      },
    },
    {
      name: 'action',
      visabled: !alloctionDs.hasManulFlag,
      renderer: ({ record, dataSet }) => {
        const getDisableFlag = CuxFn({
          name: 'BatchAllocation-fn-getDisableFlag',
          value: { partentRecord },
        })(() => {
          return dataSet.length === 1;
        })();
        return (
          <Button
            // disabled={dataSet.length === 1}
            disabled={getDisableFlag}
            funcType="link"
            color="primary"
            onClick={() => dataSet.remove(record, true)}
          >
            {intl.get('hzero.common.btn.delete').d('删除')}
          </Button>
        );
      },
    },
  ].filter((n) => n.visabled !== false);
  const childColumns = CuxFn({
    name: 'BatchAllocation-fn-childColumns',
    value: {
      columns: oldChildColumns,
      alloctionDs,
      headerDs,
      partentRecord,
    },
  })(() => oldChildColumns)();
  return (
    <>
      {CuxFn({
        name: 'BatchAllocation-fn-renderAssignedTable',
        value: { partentRecord, childColumns },
      })(() => <></>)()}
      <Table
        parityRow={false}
        dataSet={partentRecord.childrenDs}
        columns={childColumns}
        customizedCode="MALL.CARTPRO.BATCH.ALLOCATION.EXPANEDDTABLE"
        onRow={({ record }) => ({
          className: classNames({
            'cart-pro-item-new': record.get('newestFlag'),
          }),
        })}
      />
      <PermissionButton
        permissionList={[
          {
            code: `srm.mall.tenant.going-buy.cart.button.batch-add-product`,
            type: 'button',
            meaning: '批量分配新建商品',
          },
        ]}
        r-if={!alloctionDs.noCreateFlag}
        funcType="flat"
        icon="playlist_add"
        size="small"
        color="primary"
        onClick={() => openProductListModal()}
        style={{ marginTop: 10 }}
      >
        {intl.get(`mallf.common.button.addProduct`).d('新建商品')}
      </PermissionButton>
    </>
  );
};

export const lineTableRender = ({
  lineDisplayDimension,
  headerDs,
  alloctionDs,
  openProductListModal = (e) => e,
}) => {
  const FIXED_CODE = ['quantity', 'taxIncludedAmount']; // 固定需要展示的字段
  // 除固定展示的字段外 存着是批量且展示的行字段
  const noLineCusFlag =
    !lineDisplayDimension.some(
      (n) =>
        n.dimension.batchFlag === 1 &&
        n.dimension.displayFlag === 1 &&
        !FIXED_CODE.includes(n.dimension.dimensionCode)
    ) && !alloctionDs.hasManulFlag;
  // 新建表格行
  const AddButton = (
    <Button
      funcType="flat"
      icon="playlist_add"
      size="small"
      color="primary"
      onClick={() => headerDs.lineDs.addLine(headerDs)}
    >
      {intl.get(`mallf.common.button.addLine`).d('新建行')}
    </Button>
  );

  const getButtons = CuxFn({
    name: 'BatchAllocation-fn-getButtons',
    value: { alloctionDs },
  })(() => (alloctionDs.noCreateFlag ? [] : [AddButton]));

  return noLineCusFlag ? (
    expandedRowRender(
      { record: headerDs.lineDs.current },
      { openProductListModal, alloctionDs, headerDs }
    )
  ) : (
    <Table
      virtualCell={false}
      parityRow={false}
      dataSet={headerDs.lineDs}
      columns={getColumns({ ds: headerDs.lineDs, lineDisplayDimension, alloctionDs })}
      buttons={getButtons()}
      expandedRowRenderer={(r) =>
        expandedRowRender(r, { openProductListModal, alloctionDs, headerDs })
      }
      customizedCode="MALL.CARTPRO.BATCH.ALLOCATION.TABLE"
    />
  );
};

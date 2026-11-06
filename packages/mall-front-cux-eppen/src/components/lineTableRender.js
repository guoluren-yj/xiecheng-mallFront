import React, { Table, Image } from 'react';
import { Button } from 'choerodon-ui/pro';
import { isNil } from 'lodash';
import intl from 'utils/intl';
import { convertImg, priceNumberRender } from 'utils/utils';
import { getColumns } from 'mall-front/lib/routes/CartProCopy/BatchAllocation/func';
import { getMamanualRequestImg } from 'mall-front/lib/routes/CartProCopy/EmptyImages';
import { precisionEditor } from 'utils/precision';
import { math } from 'choerodon-ui/dataset';
import classNames from 'classnames';

const expandedRowRender = (
  { record: partentRecord },
  { openProductListModal = (e) => e, alloctionDs, headerDs }
) => {
  const childColumns = [
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
        return (
          <Button
            disabled={dataSet.length === 1}
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
  return (
    <>
      <Table
        parityRow={false}
        dataSet={partentRecord.childrenDs}
        columns={childColumns}
        onRow={({ record }) => ({
          className: classNames({
            'cart-pro-item-new': record.get('newestFlag'),
          }),
        })}
      />
      <Button
        r-if={!alloctionDs.noCreateFlag}
        funcType="flat"
        icon="playlist_add"
        size="small"
        color="primary"
        onClick={() => openProductListModal()}
        style={{ marginTop: 10 }}
      >
        {intl.get(`mallf.common.button.addProduct`).d('新建商品')}
      </Button>
    </>
  );
};
export const lineTableRender = ({
  lineDisplayDimension,
  headerDs,
  alloctionDs,
  openProductListModal = (e) => e,
}) => {
  // 无自定义行维度
  const noLineCusFlag =
    lineDisplayDimension.every((n) => n.dimension.dimensionType === 'LINE_FIXED') &&
    !alloctionDs.hasManulFlag;
  // 新建表格行
  // const AddButton = (
  //   <Button
  //     funcType="flat"
  //     icon="playlist_add"
  //     size="small"
  //     color="primary"
  //     onClick={() => headerDs.lineDs.addLine(headerDs)}
  //   >
  //     {intl.get(`mallf.common.button.addLine`).d('新建行')}
  //   </Button>
  // );
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
      // buttons={alloctionDs.noCreateFlag ? [] : [AddButton]}
      expandedRowRenderer={(r) =>
        expandedRowRender(r, { openProductListModal, alloctionDs, headerDs })
      }
      customizedCode="MALL.CARTPRO.BATCH.ALLOCATION.TABLE"
    />
  );
};

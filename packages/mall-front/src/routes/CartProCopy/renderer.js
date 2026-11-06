// 渲染购物车区域
import React from 'react';
import moment from 'moment';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { isEmpty, isNil } from 'lodash';
import classNames from 'classnames';
import { Popover, Tag } from 'choerodon-ui';
// eslint-disable-next-line import/no-cycle
import { openBasketDetailModal } from './BasketDetailModal';
import { Icon, Tooltip, NumberField } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';
import intl from 'utils/intl';
import { openComfirmModal, openRemarkModal } from 'utils/modals';
import {
  convertImg,
  getPrimaryColor,
  getProductLimit,
  getUserConfigInfo,
  numberRender,
  uomRender,
  calcValidatePack,
  getMinPurchaseQuantity,
} from 'utils/utils';
import cuxComponent from 'cuxTools/cuxComponent';
import { getOpenCartFlag } from 'utils/configUtils';
import { DEFAULT_DATE_FORMAT, SHOW_DEFAULT_MAX } from 'utils/constants';
import { SupplierComponent, ShowCompare, TagRender } from 'utils/renderer';
import Link from 'components/Link';
import Image from 'components/Image';
// import SwalAlert from 'components/swal';
import LabelPreview from 'components/LabelPreview';
import CuxWrapper from 'cuxTools/CuxWrapper';
import PriceDetail from './PriceDetail';
import CompareOrderDetail from './CompareOrderDetail';
import ProductAllocation from './ProductAllocationButton';
import { groupField, groupTypeField, headerGroupTypeFields, cartGroupTypeIcon } from './enum';
import { filterMap, getGroupRecords } from './func';
import styles from './renderer.less';
import GiftItem from './GiftItem';
import { getMamanualRequestImg } from './EmptyImages';
import CustomInfo from './CustomInfo';
import CuxFn from '@/cuxTools/cuxFn';

// 图片usrl跳转
const HandleImgUrl = (code, url) => {
  return code === 'CATA' ? url : convertImg(url, 1, code);
};

// 根据标签数量取maxWidth
const labelWidthMap = {
  1: 250,
  2: 122,
  3: 80,
};

// 分组头渲染
export function groupRenderer({ record, dataSet }) {
  const headerIcon = (
    <Icon className="group-header-icon" type={cartGroupTypeIcon[dataSet.getState('groupType')]} />
  );
  const rendererMap = {
    [groupTypeField.po]:
      dataSet.getState('cartViewType') !== 1 ? (
        <div className={classNames(['text-overflow', styles['render-group-header-easy']])}>
          punchout
        </div>
      ) : (
        <div className={styles['po-header-wrapper']}>
          <p className="po-header-source">
            {headerIcon}
            <span className="po-header-label">
              {intl.get('mallf.common.view.Ec.sourceFrom').d('来源电商')}：
            </span>
            <span className="po-header-value">{record.get('ecPlatformName')}</span>
          </p>
          <p className="po-header-receiver">
            <CuxWrapper
              path="CartProCopy/renderPunchoutAdress/punchoutAdress"
              value={{ record, dataSet, getGroupRecords }}
            >
              <p className="po-header-address-content">
                <span className="po-header-label">
                  {intl.get(`mallf.common.view.address`).d('地址')}：
                </span>
                <span className="po-header-name">{record.get('contactName')}</span>
                <span className="po-header-address" title={record.get('fullAddress')}>
                  {record.get('fullAddress')}
                </span>
              </p>
              <a
                style={{ marginLeft: 4 }}
                className="po-header-address-update"
                onClick={() => {
                  const groupRecords = getGroupRecords({ record, dataSet });
                  dataSet.setUpdatePoRecords(groupRecords);
                  dataSet.openAddressModal();
                }}
              >
                <Icon type="mode_edit" style={{ color: getPrimaryColor(), fontSize: 12 }} />
              </a>
            </CuxWrapper>
          </p>
          <p className="po-header-num">
            <span className="po-header-label">
              {intl.get('mallf.common.view.qtHeaderNo').d('报价单号')}：
            </span>
            <span className="po-header-value">{record.get('qtHeaderNo')}</span>
          </p>
          <p className="po-header-date">
            <span className="po-header-label">
              {intl.get('mallf.common.view.qtEndDate').d('报价有效期')}：
            </span>
            <span className="po-header-value">
              {moment(record.get('effectiveToDate')).format(DEFAULT_DATE_FORMAT)}
            </span>
          </p>
        </div>
      ),
    [groupTypeField.other]:
      dataSet.getState('cartViewType') !== 1 ? (
        <div>{intl.get('mallf.cart.view.other').d('其他')}</div>
      ) : (
        <div className={styles['group-header-wrapper']}>
          {headerIcon}
          <span className="group-header-text">{intl.get('mallf.cart.view.other').d('其他')}</span>
        </div>
      ),
    [groupTypeField.centralized]: (
      <div className={classNames(['text-overflow', styles['centralize-header-wrapper']])}>
        <span className="template-name" r-title>
          {record.get('centralizedTemplateName')}
        </span>
        <TagRender
          r-if={typeof record.get('centralizedBetweenDay') === 'number'}
          type={record.get('centralizedBetweenDay') <= 7 ? 'warning' : 'success'}
          style={{ position: 'relative' }}
          text={
            <Tooltip
              title={`${intl.get('mallf.common.view.countDown').d('倒计时')}：${record.get(
                'centralizedBetweenDay'
              )}${intl.get('hzero.common.date.unit.day').d('天')}`}
            >
              <Icon
                type="update"
                style={{ fontSize: '14px', marginRight: 5, marginTop: -2, fontWeight: 400 }}
              />
              {`${record.get('centralizedBetweenDay')}${intl
                .get('hzero.common.date.unit.day')
                .d('天')}`}
            </Tooltip>
          }
        />
      </div>
    ),
    ...Object.keys(headerGroupTypeFields).reduce(
      (pre, cur) => ({
        ...pre,
        [cur]: (
          <div className={styles['group-header-wrapper']}>
            <Icon className="group-header-icon" type={cartGroupTypeIcon[cur]} />
            <span className="group-header-text">{record.get(cur)}</span>
          </div>
        ),
      }),
      {}
    ),
  };
  return rendererMap[record.get(groupField.groupType)];
}

// 定制品
const CartCustom = ({ record, dataSet }) => {
  const centralizeDisabled =
    dataSet.basketType === 'demander' &&
    !['SUBMIT', 'RETURNED'].includes(record.get('centralizedStatus'));
  const customProps = {
    disabled: centralizeDisabled,
    product: record.toData(),
    onCustomOk: dataSet.updateCustom,
  };
  return (
    <div className="sku-custom">
      <CustomInfo {...customProps} />
    </div>
  );
};

// 底部错误提示
const RenderErrorMsger = observer(({ record, dataSet }) => {
  const { errorMessage, invalidFlag, centralizedStatus } = record.get([
    'errorMessage',
    'invalidFlag',
    'centralizedStatus',
  ]);
  if (
    isEmpty(errorMessage) ||
    (centralizedStatus === 'SUBMITTED' && dataSet.basketType === 'demander')
  ) {
    return <></>;
  }
  return (
    <div
      className={classNames({
        'sku-message-cart': true,
        'sku-message-error': !invalidFlag,
        'sku-message-warn': invalidFlag,
      })}
    >
      <Tooltip title={errorMessage} placement="bottomLeft">
        <Icon type="error" size={13} style={{ marginRight: 5 }} />
        <span className="text-overflow">{errorMessage}</span>
      </Tooltip>
    </div>
  );
});

export const RenderErrorMsg = cuxComponent({ path: 'CartProCopy/renderer/RenderErrorMsg' })(
  RenderErrorMsger
);

// 商品来源
export function renderProductSource({
  itemCode,
  supplierCompanyName,
  manualFlag,
  punchoutFlag,
  productSource,
  receiveFlag,
  record,
}) {
  return (
    <div className={styles['sku-product-source']}>
      <div className="product-source-box text-overflow" style={!itemCode ? { maxWidth: 250 } : {}}>
        <span r-if={+manualFlag === 1} className="product-source">
          {intl.get('mallf.cart.view.manual').d('手工')}
        </span>
        <span r-if={+receiveFlag === 1} className="product-source">
          {intl.get('mallf.cart.view.receive').d('领用')}
        </span>
        <span r-if={+punchoutFlag === 1} className="product-source">
          punchout
        </span>
        <span
          r-if={productSource === 'CATA' && !punchoutFlag && !receiveFlag && !manualFlag}
          className="product-source"
        >
          {intl.get('mallf.common.view.common.CATA').d('目录化')}
        </span>
        <span
          r-if={productSource !== 'CATA' && !punchoutFlag && !receiveFlag && !manualFlag}
          className="product-source"
        >
          {intl.get('mallf.cart.view.order.E-commerce').d('电商')}
        </span>
        <SupplierComponent>
          <span r-if={supplierCompanyName} className="product-supplier">
            <Tooltip
              placement="top"
              title={`${intl
                .get('mallf.common.view.supplier')
                .d('供应商')} : ${supplierCompanyName}`}
            >
              {supplierCompanyName}
            </Tooltip>
          </span>
        </SupplierComponent>
      </div>
      <div r-if={itemCode} className="product-item-code text-overflow">
        <CuxWrapper
          path="CartProCopy/renderItemCode"
          value={{ itemCode, itemName: record?.get('itemName') }}
        >
          <Tooltip
            placement="top"
            title={`${intl.get('mallf.common.view.item.code').d('物料编码')} : ${itemCode}`}
          >
            {itemCode}
          </Tooltip>
        </CuxWrapper>
      </div>
    </div>
  );
}

// 商品信息渲染
export function skuInfoRenderer({
  record,
  dataSet,
  showCustomFlag = true,
  imageWidth = 64,
  imageHeight = 64,
  labelShowFlag = true,
}) {
  const {
    productId,
    imagePath,
    itemCode,
    labelList,
    customFlag,
    invalidFlag,
    productName,
    productSource,
    productAttributeDTOList: attrs,
    supplierCompanyName,
    agreementBusinessType,
    manualFlag,
    punchoutFlag,
    receiveFlag,
    centralizedFlag,
    centralizedTemplateName,
    productCompareList,
  } = record.get([
    'productId',
    'imagePath',
    'productSource',
    'productName',
    'itemCode',
    'customFlag',
    'invalidFlag',
    'labelList',
    'supplierCompanyName',
    'agreementBusinessType',
    'manualFlag',
    'punchoutFlag',
    'receiveFlag',
    'sourceFrom',
    'productAttributeDTOList',
    'centralizedFlag',
    'centralizedTemplateName',
    'productCompareList',
  ]);
  // 比价单
  const isCompare = !isEmpty(productCompareList);
  // 有且仅有一个会为1
  const {
    showLowerAssignPriceFlag, // 售价最低
    showLowerPriceFlag, // 价格最低
    showLowerSkuPriceFlag, // 折算价最低
  } = isCompare && productCompareList[0];
  // 是否显示比价低价标签
  const ShowCompareTag =
    isCompare &&
    productCompareList.length === 1 &&
    [showLowerAssignPriceFlag, showLowerPriceFlag, showLowerSkuPriceFlag].includes(1);
  // 商品标签
  const newLabelList = (labelList || []).slice(0, isCompare ? 2 : 3);
  const linkUrl = `/product-detail?productId=${productId}&sourceFrom=${productSource}`;
  if (record.get(groupField.groupType) === groupTypeField.po || +manualFlag === 1) {
    return (
      <div className={styles['sku-info-wrapper']}>
        <div className="sku-content">
          <a disabled>
            {+manualFlag === 1 ? (
              <>{getMamanualRequestImg({ width: imageWidth, height: imageHeight })}</>
            ) : (
              <Image
                className="sku-image"
                value={HandleImgUrl(productSource, imagePath)}
                width={imageWidth}
                height={imageHeight}
                imgInfo={record?.toData()} // 购物车-商品信息
              />
            )}
          </a>
          <div className="sku-detail">
            <a disabled>
              <div className="sku-name" title={`${productName}`}>
                {productName}
              </div>
            </a>
            {renderProductSource({
              itemCode,
              supplierCompanyName,
              manualFlag,
              punchoutFlag,
              record,
            })}
          </div>
        </div>
        <RenderErrorMsg record={record} dataSet={dataSet} />
      </div>
    );
  }

  return (
    <div className={styles['sku-info-wrapper']}>
      <div className="sku-content">
        <div className="sku-image-wrapper">
          <Link to={linkUrl}>
            <Image
              className="sku-image"
              value={HandleImgUrl(productSource, imagePath)}
              width={imageWidth}
              height={imageHeight}
              imgInfo={record?.toData()} // 购物车-商品信息
            />
          </Link>
          <div
            r-if={centralizedFlag && centralizedTemplateName}
            className="sku-centralize-template"
          >
            <div className="text-overflow" style={{ transform: 'scale(0.8)' }} r-title>
              {centralizedTemplateName}
            </div>
          </div>
        </div>
        <div className="sku-detail">
          <Link to={linkUrl}>
            <div className="sku-name" title={`${productName}`}>
              {productName}
            </div>
          </Link>
          {renderProductSource({
            itemCode,
            supplierCompanyName,
            receiveFlag,
            productSource,
            record,
          })}
          {/* 商品标签和积分商品 */}
          {(newLabelList.length > 0 || agreementBusinessType === 'POINTS' || ShowCompareTag) &&
            labelShowFlag && (
              <div className="sku-labels">
                <Tag
                  r-if={ShowCompareTag}
                  color={
                    showLowerAssignPriceFlag === 1 || showLowerPriceFlag === 1
                      ? '#00B377'
                      : '#1770E6'
                  }
                  className="sku-label-compare"
                >
                  {showLowerAssignPriceFlag === 1 &&
                    intl.get('mallf.common.view.minUnitPrice').d('售价最低')}
                  {showLowerPriceFlag === 1 && intl.get('mallf.common.view.minPrice').d('价格最低')}
                  {showLowerSkuPriceFlag === 1 &&
                    intl.get('mallf.common.view.minSkuPrice').d('折算价最低')}
                </Tag>
                {newLabelList.map((n) => (
                  <LabelPreview
                    cursor="grab"
                    code={n.labelColorCode}
                    value={n.labelName}
                    maxWidth={labelWidthMap[newLabelList.length] || 80}
                  />
                ))}
              </div>
            )}
        </div>
        <div
          r-if={showCustomFlag && dataSet.basketType !== 'order'}
          className={classNames([
            'sku-custom-attr',
            { 'sku-custom-attr-detail-view': dataSet.getState('cartViewType') !== 1 },
          ])}
        >
          {((+customFlag === 1 && +invalidFlag === 1) || !isEmpty(attrs)) && (
            <CartCustom record={record} dataSet={dataSet} />
          )}
        </div>
      </div>
      <GiftItem r-if={invalidFlag} giftData={record.toData()} />
      <RenderErrorMsg record={record} dataSet={dataSet} />
    </div>
  );
}

// 阶梯价
function ladderPriceRender({ record, dataSet }) {
  let totalQuantity = record.get('totalQuantity');
  const ladderPriceList = record.get('ladderPriceList') || [];
  // 当需要合并单价的时候，数量需要按头来计算
  if (record.get(groupField.firstHeaderLineLength) > 1) {
    const currentCart = dataSet.cartData.find((cart) => cart.cartId === record.get('cartId')) || {};
    const currentHeaderDimCartList =
      currentCart.cartColumnValueList?.filter((p) => p.headerNum === record.get('headerNum')) || [];
    let newTotalQuality = 0;
    currentHeaderDimCartList.forEach((p) => {
      newTotalQuality = math.plus(
        newTotalQuality,
        p.cartDimValueList.find((d) => d.dimensionCode === 'quantity')?.value
      );
    });
    totalQuantity = newTotalQuality;
  }
  return (
    <div style={{ padding: '5px', width: '125px' }}>
      <div style={{ marginBottom: '10px' }}>
        {intl.get(`mallf.cart.view.cart.rangPrice`).d('阶梯价格')}
      </div>
      {ladderPriceList.map((ladderPrice) => {
        const { ladderFrom, ladderTo, salePrice } = ladderPrice;
        const activeColor =
          (totalQuantity < ladderTo || !ladderTo) && totalQuantity >= ladderFrom
            ? getPrimaryColor()
            : '#fff';
        return (
          <div style={{ marginBottom: '5px', color: activeColor }}>
            <span>{ladderTo ? `${ladderFrom}-${ladderTo}` : `>=${ladderFrom}`}</span>
            <span style={{ float: 'right' }}>{salePrice}</span>
          </div>
        );
      })}
    </div>
  );
}

// 单价渲染
export function unitPriceRenderer({ record, dataSet }) {
  const {
    cartId,
    shipper,
    uomName,
    sourceFrom,
    shipperFlag,
    invalidFlag,
    multipleFlag,
    ladderPriceFlag,
    currencySymbol,
    taxIncludedPrice,
    taxIncludedPriceMeaning,
    priceDetailShowFlag,
    linkType,
  } = record.get([
    'cartId',
    'linkType',
    'shipper',
    'uomName',
    'sourceFrom',
    'shipperFlag',
    'invalidFlag',
    'multipleFlag',
    'currencySymbol',
    'priceDetailShowFlag',
    'taxIncludedPrice',
    'ladderPriceFlag',
    'taxIncludedPriceMeaning',
  ]);
  const viewPriceCount = record.getState('viewPriceCount') || 0;
  // const uomText = shipperFlag && sourceFrom !== 'CATA' ? shipper :uomRender(uomName);
  let taxPrice = taxIncludedPriceMeaning || taxIncludedPrice;
  if (dataSet.getState('cartViewType') !== 1) {
    taxPrice = numberRender(dataSet.getDimValue(record, 'taxIncludedPrice')?.value);
  }

  // 申请模式+多分配行
  const hiddenPrice = getOpenCartFlag(linkType) && +multipleFlag;
  // 聚合视图下，阶梯价格+申请模式+多分配行隐藏价格
  if (dataSet.getState('cartViewType') === 1 && hiddenPrice && !!ladderPriceFlag) {
    return <div>-</div>;
  }

  if (isNil(taxIncludedPrice) && dataSet.basketType === 'order') {
    return <div>-</div>;
  }

  const priceText = `${currencySymbol || ''}${taxPrice}`;
  return priceDetailShowFlag !== 1 || dataSet.getState('cartViewType') !== 1 ? (
    <div className={styles['sku-pirce-wrapper']}>
      <div className="text-overflow" r-title>
        {priceText}
        {shipperFlag && sourceFrom !== 'CATA' ? shipper : uomRender(uomName)}
      </div>
      {!!ladderPriceFlag && !!invalidFlag && (
        <Tooltip placement="left" title={ladderPriceRender({ record, dataSet })}>
          <span style={{ color: '#666666' }}>
            {intl.get(`mallf.cart.view.cart.rangPrice`).d('阶梯价格')}
          </span>
          <Icon
            style={{
              fontSize: 14,
              marginLeft: 3,
              cursor: 'pointer',
              color: '#666666',
            }}
            type="find_in_page"
          />
        </Tooltip>
      )}
    </div>
  ) : !hiddenPrice ? (
    <Popover
      content={<PriceDetail cartId={cartId} count={viewPriceCount} />}
      placement="bottom"
      trigger="click"
      overlayClassName="price-detail-popver"
      overlayStyle={{ width: 600 }}
      onClick={() => record.setState('viewPriceCount', viewPriceCount + 1)}
    >
      <div className="cart-body-price-detail">
        <div>-</div>
        <div>
          {intl.get('mallf.common.view.newCart.priceDetail').d('价格明细')}
          <Icon style={{ fontSize: 14, marginLeft: 3, cursor: 'pointer' }} type="find_in_page" />
        </div>
      </div>
    </Popover>
  ) : (
    <div>-</div>
  );
}

// 数量框后缀显示
const renderAddonAfter = ({ record, minLimit, maxLimit, dataSet }) => {
  const {
    totalCqNum,
    shipperFlag,
    uomPrecision,
    minPackageQuantity,
    centralizedFlag,
  } = record.get([
    'multipleFlag',
    'uomPrecision',
    'totalCqNum',
    'shipperFlag',
    'minPackageQuantity',
    'centralizedFlag',
  ]);
  // 判断tip
  const minFlag =
    math.gt(minLimit, 1) && (centralizedFlag !== 1 || dataSet.basketType !== 'demander'); // 拼单提需人不展示起订量
  const maxFlag = math.lte(+maxLimit, SHOW_DEFAULT_MAX);
  const packFlag =
    math.gt(minPackageQuantity, 1) && calcValidatePack(uomPrecision, minPackageQuantity);
  const tips = [
    {
      flag: +shipperFlag === 1 && totalCqNum,
      message: (
        <>
          <span>{intl.get('mallf.common.view.customNumber').d('定制品数量')}：</span>
          {totalCqNum}
        </>
      ),
    },
    {
      flag: minFlag,
      message: intl
        .get(`mallf.common.model.minPurchaseNumber`, {
          value: minLimit,
        })
        .d(`最小购买量为${minLimit}`),
    },
    {
      flag: packFlag,
      message: `${intl
        .get('mallf.common.view.errorMinPackageQuantity')
        .d('最小包装量为')}${minPackageQuantity}`,
    },
    {
      flag: maxFlag,
      message: intl
        .get('mallf.common.model.maxPurchaseNumbers', { value: maxLimit })
        .d(`最大购买量为${maxLimit}`),
    },
  ];
  if (tips.some((s) => s.flag)) {
    const errorTip = filterMap(
      tips,
      (tip) => tip.flag,
      (tip) => <div>{tip.message}</div>
    );
    return (
      <Tooltip title={errorTip}>
        <Icon type="error" style={{ color: '#FCA000' }} />
      </Tooltip>
    );
  }
  return null;
};

// 数量渲染
export function quantityRenderer({ name, record, dataSet }) {
  const {
    cartId,
    shipper,
    uomName,
    qtHeaderNo,
    shipperFlag,
    invalidFlag,
    multipleFlag,
    uomPrecision,
    productSource,
    taxIncludedPrice,
    minPurchaseQuantity,
    maxPurchaseQuantity,
    purchaseQuantityLimit,
    ladderPriceList,
    minPackageQuantity,
    centralizedStatus,
    receiveFlag,
  } = record.get([
    'cartId',
    'shipper',
    'uomName',
    'qtHeaderNo',
    'shipperFlag',
    'uomPrecision',
    'invalidFlag',
    'multipleFlag',
    'productSource',
    'taxIncludedPrice',
    'minPurchaseQuantity',
    'maxPurchaseQuantity',
    'purchaseQuantityLimit',
    'ladderPriceList',
    'minPackageQuantity',
    'centralizedStatus',
    'receiveFlag',
  ]);
  const quantityChangeCartId = dataSet.getState('quantityChangeCartId');
  const [minLimit, maxLimit] = getProductLimit({
    sourceFrom: productSource,
    minPurchaseQuantity: getMinPurchaseQuantity({
      minPurchaseQuantity,
      isReceive: !!receiveFlag,
      uomPrecision,
    }),
    maxPurchaseQuantity,
    purchaseQuantityLimit,
    price: taxIncludedPrice,
    ladderPriceLimit: toJS(ladderPriceList),
  });
  // 存在其他商品正在进行数量变更请求
  const readOnly = quantityChangeCartId && quantityChangeCartId !== cartId;
  // 拼单禁用
  const centralizeDisabled =
    dataSet.basketType === 'demander' && !['SUBMIT', 'RETURNED'].includes(centralizedStatus);
  return (
    <div className={styles['sku-number-wrapper']}>
      <div style={{ width: 100 }}>
        <NumberField
          name="totalQuantity"
          record={record}
          readOnly={readOnly}
          disabled={
            !invalidFlag ||
            (dataSet.getState('cartViewType') === 1 ? +multipleFlag : false) ||
            qtHeaderNo ||
            centralizeDisabled
          }
          addonAfter={renderAddonAfter({ record, minLimit, maxLimit, dataSet })}
          onChange={(value, oldValue) =>
            dataSet.updateCartQuantity({ name, value, oldValue, minLimit, maxLimit, record })
          }
          nonStrictStep
          step={minPackageQuantity || 1}
          precision={uomPrecision || 0}
          formatter={(value) => {
            if (!math.isNaN(+value) && math.toString(value)?.endsWith('0')) {
              return +value;
            } else {
              return value;
            }
          }}
        />
      </div>
      {+shipperFlag === 1 && (
        <span className="sku-shipper" title={shipper}>
          {productSource === 'CATA' ? shipper : uomName}
        </span>
      )}
    </div>
  );
}

// 比价单Icon
const CompareIcon = cuxComponent({ path: 'CartProCopy/renderer/CompareIcon' })(({ lowerFlag }) => {
  return (
    <Icon
      style={{
        fontSize: 14,
        marginLeft: 5,
        marginTop: -2,
        cursor: 'pointer',
        color: lowerFlag ? getUserConfigInfo().theme[`warning-color`] : '#888',
      }}
      type={lowerFlag ? 'error' : 'find_in_page'}
    />
  );
});

// 渲染比价
function renderCompare({ record, dataSet }) {
  const { invalidFlag, productCompareList } = record.get(['invalidFlag', 'productCompareList']);
  if (!invalidFlag || isEmpty(productCompareList)) return null;
  const lowerFlag = productCompareList.some((n) => +n.lowerFlag === 1);
  const compareLoading = record.getState('compareLoading');
  const compareVisible = record.getState('compareVisible');
  const setCompareVisible = (visible) => record.setState('compareVisible', visible);
  // 二开隐藏删除比价单按钮
  const DeleteCompare = CuxFn({
    name: 'hide-delete-compare-fn',
  })(() => {
    // 存在手动比价的则可以删除
    const compareList = dataSet.getCurrentCompareData(record.toJSONData()) || [];
    const canDeleteFlag = compareList?.some((s) => +s.autoFlag !== 1);
    if (!canDeleteFlag) {
      return <></>;
    }
    return (
      <div className="delete-compare" onClick={() => dataSet.deleteCompare({ record })}>
        {intl.get(`mallf.common.button.delete`).d('删除')}
      </div>
    );
  });

  return (
    <ShowCompare r-if={!isEmpty(dataSet.getCurrentCompareData(record.toData()))}>
      <Popover
        content={
          <CompareOrderDetail
            compareLoading={!!compareLoading}
            cartViewType={dataSet.getState('cartViewType')}
            cartItem={record.toJSONData()}
            setCompareVisible={setCompareVisible}
            onCompareOk={(compareSku, productId) =>
              dataSet.replaceCompare({ record, compareSku, productId })
            }
            dataSet={dataSet}
          />
        }
        placement="bottom"
        overlayClassName="compare-detail-popver"
        overlayStyle={{ width: 400, height: 500 }}
        trigger="click"
        visible={!!compareVisible}
        onVisibleChange={(vis) => setCompareVisible(vis)}
      >
        <div className="compare-content">
          <div>
            {intl.get(`mallf.common.model.compareOrder`).d(`比价单`)}
            <CompareIcon lowerFlag={lowerFlag} />
          </div>
        </div>
      </Popover>
      <DeleteCompare />
    </ShowCompare>
  );
}

// 总金额渲染
export function totalAmountRenderer({ record, dataSet }) {
  const { currencySymbol, currencyName, taxIncludedAmount, taxIncludedAmountMeaning } = record.get([
    'currencyName',
    'currencySymbol',
    'totalPointPrice',
    'taxIncludedAmount',
    'taxIncludedAmountMeaning',
  ]);
  let totalPrice = taxIncludedAmountMeaning || taxIncludedAmount;
  if (dataSet.getState('cartViewType') !== 1) {
    totalPrice = dataSet.getDimValue(record, 'taxIncludedAmount')?.value;
  }
  const tooltip = `${totalPrice}${currencyName || ''}`;
  return (
    <div className={styles['sku-amount-wrapper']}>
      <Tooltip title={tooltip}>
        <div className="sku-amount-text">
          {currencySymbol}
          {totalPrice}
        </div>
      </Tooltip>
      {renderCompare({ record, dataSet })}
    </div>
  );
}

// 操作列渲染
function optionsRender({ record, dataSet }) {
  const qtHeaderNo = record.get('qtHeaderNo');
  const invalidFlag = record.get('invalidFlag');
  const manualFlag = record.get('manualFlag');
  const templateUpdateFlag = record.get('templateUpdateFlag');
  return (
    <div className={styles['sku-options-wrapper']}>
      <a
        r-if={!!invalidFlag && !qtHeaderNo && !manualFlag}
        className="option-btn"
        onClick={() => dataSet.collectCartSku({ record })}
      >
        {intl.get(`mallf.cart.view.add.favorites`).d('加入收藏')}
      </a>
      <a
        className="option-btn"
        onClick={() => {
          openComfirmModal({
            title: intl.get('mallf.common.view.confirmDeleteTitle').d('确认删除'),
            border: false,
            children: (
              <span>
                {intl.get(`mallf.cart.model.confirm.deleteProduct`).d('确认删除该商品？')}
              </span>
            ),
            onOk: () => {
              dataSet.deleteCartRecords([record], true);
            },
          });
        }}
      >
        {intl.get(`mallf.cart.view.cart.delete.product`).d('删除商品')}
      </a>
      {!!invalidFlag && (
        <ProductAllocation
          callBack={() =>
            templateUpdateFlag ? dataSet.queryCartData() : dataSet.fetchSingleCart(record)
          }
          product={record.toJSONData()}
          noAction={record.get('manualFlag') || record.get('templateUpdateFlag')}
        />
      )}
    </div>
  );
}

export const optionsRenderer = cuxComponent({ path: 'CartProCopy/renderer/optionsRender' })(
  optionsRender
);

export const centralizeStatusRender = cuxComponent({
  path: 'CartProCopy/renderer/centralizeStatusRenderer',
})(centralizeStatusRenderer);

// 购物篮状态列渲染
function centralizeStatusRenderer({ record, value }) {
  const { centralizedRemark, centralizedStatusMeaning } = record.get([
    'centralizedStatusMeaning',
    'centralizedRemark',
  ]);
  const typeMap = {
    SUBMIT: 'warning',
    SUBMITTED: 'success',
    RETURNED: 'danger',
    CANCELLED: 'failure',
    INVALID: 'failure',
  };

  const icon =
    value === 'RETURNED' && centralizedRemark ? (
      <Tooltip title={centralizedRemark}>
        <Icon
          style={{
            fontSize: '14px',
            marginLeft: '5px',
            fontWeight: 400,
            verticalAlign: 'text-bottom',
          }}
          type="info"
          size={14}
        />
      </Tooltip>
    ) : null;

  const type = typeMap[value] || 'warning';
  return <TagRender type={type} text={centralizedStatusMeaning} icon={icon} />;
}

// 购物篮状态列渲染
export function basketOptionsRender({ record, dataSet }) {
  const { invalidFlag, templateUpdateFlag, centralizedStatus, productName } = record.get([
    'invalidFlag',
    'templateUpdateFlag',
    'centralizedStatus',
    'productName',
  ]);
  return (
    <div className={styles['sku-options-wrapper']}>
      {dataSet.basketType === 'demander' ? (
        <>
          <a
            className="option-btn"
            r-if={centralizedStatus !== 'SUBMITTED'}
            onClick={() => {
              openComfirmModal({
                title: intl.get('mallf.common.view.confirmDeleteTitle').d('确认删除'),
                border: false,
                children: (
                  <span>
                    {intl.get(`mallf.cart.model.confirm.deleteProduct`).d('确认删除该商品？')}
                  </span>
                ),
                onOk: () => {
                  dataSet.deleteCartRecords([record]);
                },
              });
            }}
          >
            {intl.get(`mallf.cart.view.cart.delete.product`).d('删除商品')}
          </a>
          <ProductAllocation
            r-if={!!invalidFlag && !['INVALID'].includes(centralizedStatus)}
            callBack={() =>
              templateUpdateFlag ? dataSet.queryCartData() : dataSet.fetchSingleCart(record)
            }
            product={record.toJSONData()}
            centralizedUserType={0}
            noAction
            noCreate
            readOnly={['SUBMITTED'].includes(centralizedStatus)}
          />
          <CuxWrapper
            value={{ dataSet, record: record.toJSONData() }}
            path="CartProCopy/basketOrder/appendOptionBtn"
          />
        </>
      ) : (
        <>
          <a
            className="option-btn"
            onClick={() => {
              openRemarkModal({
                title: intl.get(`mallf.common.view.tips`).d('温馨提示'),
                label: intl.get('mallf.cart.view.returnReason').d('驳回原因'),
                maxLength: 200,
                message: intl
                  .get('mallf.cart.model.confirm.returnCentralizeSku1', {
                    productName,
                  })
                  .d(`您确定要驳回商品【${productName}】的所有拼单吗？`),
                onOk: (remark) => {
                  dataSet.returnCentralizedSku(record, remark);
                },
              });
            }}
          >
            {intl.get(`mallf.common.button.returnBasket`).d('驳回拼单')}
          </a>
          <a
            className="option-btn"
            onClick={() =>
              openBasketDetailModal({
                dataSet,
                data: record.toJSONData(),
              })
            }
          >
            {intl.get(`mallf.cart.view.button.orderDetail`).d('拼单明细')}
          </a>
        </>
      )}
    </div>
  );
}

// 数量渲染
export function basketQuantityRenderer({ record, dataSet }) {
  const {
    uomPrecision,
    productSource,
    taxIncludedPrice,
    minPurchaseQuantity,
    maxPurchaseQuantity,
    purchaseQuantityLimit,
    ladderPriceList,
    totalQuantity,
    receiveFlag,
  } = record.get([
    'uomPrecision',
    'productSource',
    'taxIncludedPrice',
    'minPurchaseQuantity',
    'maxPurchaseQuantity',
    'purchaseQuantityLimit',
    'ladderPriceList',
    'totalQuantity',
    'receiveFlag',
  ]);
  const [minLimit, maxLimit] = getProductLimit({
    sourceFrom: productSource,
    minPurchaseQuantity: getMinPurchaseQuantity({
      minPurchaseQuantity,
      isReceive: !!receiveFlag,
      uomPrecision,
    }),
    maxPurchaseQuantity,
    purchaseQuantityLimit,
    price: taxIncludedPrice,
    ladderPriceLimit: toJS(ladderPriceList),
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span>{totalQuantity}</span>
      <span style={{ marginLeft: '4px', marginTop: '-3px' }}>
        {renderAddonAfter({ record, minLimit, maxLimit, dataSet })}
      </span>
    </div>
  );
}

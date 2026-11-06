import React, { useMemo } from 'react';
import { Icon, Tooltip, TextArea, Form } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { convertImg, getPrimaryColor } from 'utils/utils';
import { TagRender } from 'utils/renderer';
import Image from 'components/Image';
import Link from 'components/Link';
import ViewCompareList from 'components/ViewCompareList';
import DocFlow from 'components/DocFlow';
import { renderProductSource } from '@/routes/CartProCopy/renderer';
import { getMamanualRequestImg } from '@/routes/CartProCopy/EmptyImages';
import { requestDocFlow } from 'components/Permission/permissionCode';
import { PermissionWrapper } from 'components/Permission';
import CuxWrapper from 'cuxTools/CuxWrapper';
import { status } from './ListHeader';
import OperateRender from './OperateRender';
import CuxFn from '@/cuxTools/cuxFn';

// 图片usrl跳转
const HandleImgUrl = (code, url) => {
  return code === 'CATA' ? url : convertImg(url, 1, code);
};

// 是否为无源执行中且已完成转单(且可关闭数量必须大于0(这个时候状态可能也是执行中))
const isManualCancel = (line) =>
  line.sourceType === 'MANUAL' &&
  line.lineStatus === 'CONVERSION_PROCESSING' &&
  line.canCloseQuantity > 0 &&
  line.canCloseQuantity < line.quantity;

function ListContent({ item = {}, dataSet }) {
  // 取消行申请
  const handleCancelLine = (line) => {
    const tips = isManualCancel(line)
      ? intl
          .get('mallf.myRequest.view.cancelManualRequestLine.title', {
            lineStatus: line.lineStatusMeaning,
            num: line.canCloseQuantity,
          })
          .d(
            `当前申请行状态为【${line.lineStatusMeaning}】，仅支持取消未执行部分的申请，未执行部分数量为【${line.canCloseQuantity}】，您确定要取消吗？`
          )
      : intl
          .get('mallf.myRequest.view.cancelRequestLine.title', {
            value: line.skuName,
          })
          .d(`您确定要取消商品【${line.skuName}】吗？`);

    const children = (
      <>
        <p style={{ fontSize: '14px', marginBottom: '20px' }}>{tips}</p>
        <Form labelLayout="float">
          <TextArea
            label={intl.get('mallf.myRequest.view.edit.cancelReason').d('取消原因')}
            id="requestCancelReason"
            rows={3}
            style={{ width: '100%', fontSize: 12 }}
          />
        </Form>
      </>
    );
    dataSet.handleCancelRequest({
      line,
      item,
      children,
      type: 'line',
    });
  };

  const ProductList = useMemo(() => {
    const { mallRequestEntryViewVOList = [] } = item || {};
    return mallRequestEntryViewVOList.map((product) => {
      const {
        skuName,
        skuId,
        manual,
        unitPrice,
        unitPriceMeaning,
        quantity,
        sourceBusinessType,
        primaryUrl,
        itemCode,
        supplierCompanyName,
        agreementBusinessType,
        lineType,
        productCompareDTO,
        requestEntryId,
        per, // 价格批量
        skuType,
      } = product || {};
      const linkUrl = `/product-detail?productId=${skuId}&sourceFrom=${sourceBusinessType}`;
      // 是否赠品
      const isGift = ['ATTACHMENT', 'GIFT'].includes(skuType);
      // punch out跟运费不可点击
      const disabled = sourceBusinessType === 'PUNCHOUT' || lineType === 'EXTRA_COST' || isGift;
      // 卓见二开：单据流展示控制
      const DocFlowRender = CuxFn({
        name: 'OpenCartMyRequest-listContent-fn-docFlowRender',
        value: { requestEntryId },
      })(() => (
        <PermissionWrapper permissionList={[requestDocFlow]}>
          <DocFlow
            tableName="s2ful_mall_request_entry"
            tablePk={requestEntryId}
            style={{
              color: getPrimaryColor(),
            }}
            buttonType="button"
          />
        </PermissionWrapper>
      ))();

      return (
        <div className="product-content">
          <div className="product-wrapper">
            <div className="image-wrapper">
              {manual ? (
                <>{getMamanualRequestImg({ width: '41px', height: '41px' })}</>
              ) : (
                <>
                  <Link r-if={!disabled} disabled={disabled} to={linkUrl}>
                    <Image
                      className="sku-image"
                      value={HandleImgUrl(sourceBusinessType, primaryUrl)}
                      width={41}
                      height={41}
                    />
                  </Link>
                  <Image
                    r-if={disabled}
                    className="sku-image"
                    value={HandleImgUrl(sourceBusinessType, primaryUrl)}
                    width={41}
                    height={41}
                  />
                </>
              )}
            </div>
            <div className="product-name-cotent">
              <div className="text-overflow product-name">
                <span r-title r-if={manual || disabled}>
                  {skuName}
                </span>
                <Link r-if={!(manual || disabled)} to={linkUrl}>
                  <span r-title>{skuName}</span>
                </Link>
              </div>
              <Tooltip
                r-if={skuType === 'GIFT'}
                title={intl.get('mallf.common.view.common.giveaway').d('赠品')}
              >
                <div className="gift-label">
                  {intl.get('mallf.common.view.common.giveaway').d('赠品')}
                </div>
              </Tooltip>
              <Tooltip
                r-if={skuType === 'ATTACHMENT'}
                title={intl.get(`mallf.common.view.common.annex`).d('附件')}
              >
                <div className="gift-label">
                  {intl.get(`mallf.common.view.common.annex`).d('附件')}
                </div>
              </Tooltip>
              {!isGift && (
                <>
                  {renderProductSource({
                    itemCode,
                    supplierCompanyName,
                    productSource: sourceBusinessType,
                    manualFlag: agreementBusinessType !== 'RECEIVE' && manual, // 手工商品转领用不展示手工标签
                    punchoutFlag: sourceBusinessType === 'PUNCHOUT',
                    receiveFlag: agreementBusinessType === 'RECEIVE',
                  })}
                  {/* 二开单据流显示 */}
                  {DocFlowRender}
                  {/* <PermissionWrapper permissionList={[requestDocFlow]}>
                    <DocFlow
                      tableName="s2ful_mall_request_entry"
                      tablePk={requestEntryId}
                      style={{
                        color: getPrimaryColor(),
                      }}
                      buttonType="button"
                    />
                  </PermissionWrapper> */}
                </>
              )}
            </div>
          </div>
          <div className="product-price text-overflow">
            <span r-title>
              {item.currencySymbol}
              {unitPriceMeaning || unitPrice}
              {per > 1 ? `/${per}` : ''}
            </span>
            <ViewCompareList
              r-if={productCompareDTO && !['GIFT', 'ATTACHMENT', 'FREIGHT'].includes(skuType)}
              productCompare={productCompareDTO || {}}
            />
          </div>
          <div className="product-quantity text-overflow">
            <span r-title>x{quantity}</span>
          </div>
        </div>
      );
    });
  }, [item]);

  const StatusRender = useMemo(() => {
    const { mallRequestEntryViewVOList = [] } = item || {};
    return mallRequestEntryViewVOList.map((product) => {
      const { lineStatus, lineStatusMeaning, processErrorInfoList = [] } = product || {};
      const errorList = processErrorInfoList.filter(
        (n) => n.info && n.color === processErrorInfoList?.[0]?.color
      );
      return (
        <div className="request-item-status text-overflow">
          {TagRender({
            text: lineStatusMeaning,
            type: status(lineStatus),
            style: { maxWidth: '100px', marginRight: 0 },
            icon: !isEmpty(errorList) && ( // 申请报错改造为后端控制 - processErrorInfos
              <Tooltip
                title={errorList.map((m) => (
                  <p>{m.info}</p>
                ))}
                placement="top"
              >
                <Icon
                  className="status-error"
                  type="error"
                  style={{
                    fontSize: '14px',
                    marginLeft: '5px',
                    fontWeight: 400,
                    verticalAlign: 'text-bottom',
                  }}
                />
              </Tooltip>
            ),
          })}
          <CuxWrapper
            path="OpenCartMyRequest/RequestList/ListContentStatusAppendBtn"
            value={{ product }}
          />
        </div>
      );
    });
  }, [item]);

  return (
    <div className="list-content-container">
      <div className="product-container">{ProductList}</div>
      <div className="request-createdByName">
        <Icon type="assignment_ind-o" style={{ fontSize: 14, marginTop: -2, marginRight: 5 }} />
        {item.createdByName}
      </div>
      <div className="request-amount text-overflow" r-title>
        {item.currencySymbol}
        {item.requestAmountMeaning || item.requestAmount}
      </div>
      <div className="request-status">{StatusRender}</div>
      <div className="request-operate">
        <OperateRender dataSet={dataSet} item={item} handleCancelLine={handleCancelLine} />
      </div>
    </div>
  );
}

export default ListContent;

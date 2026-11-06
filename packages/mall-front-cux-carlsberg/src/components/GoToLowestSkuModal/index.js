import React, { useState, useEffect } from 'react';
import intl from 'utils/intl';
import Link from 'components/Link';
import { openPage, getResponse } from 'utils/utils';
import { TextArea, Modal } from 'choerodon-ui/pro';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';

// 一键填入选项（可通过值集维护）
// const quickFillOptions = [
//   { value: '供应商更好', meaning: '供应商更好' },
//   { value: '发货更快', meaning: '发货更快' },
// ];

export default function CuxGoToLowestSkuModal(props) {
  const { modalRef, res, onOk, weakFlag, strongFlag, params } = props;
  const [reasonText, setReasonText] = useState('');
  const [reasonRequired, setReasonRequired] = useState(false);
  const [reasonOptions, setReasonOptions] = useState([]);

  const showSameSkuflag = res?.cheapestSkuId
    ? !!res?.cheapestSkuId
    : !!res?.cartList?.[0].cheapestSkuId;
  const { cheapestSkuId, cheapestSkuName, cheapestSourceForm } = res?.cheapestSkuId
    ? res
    : res?.cartList?.[0];

  useEffect(() => {
    // 查询lookup
    const fetchLookupOptions = async () => {
      const result = getResponse(
        await queryMapIdpValue({
          selectExpensiveReasons: 'SCUX_CARLSBERG_MALL_SELECT_EXPENSIVE_REASON',
        })
      );
      if (result) {
        const { selectExpensiveReasons } = result || {};
        setReasonOptions(selectExpensiveReasons || []);
      }
    };
    fetchLookupOptions();
  }, []);

  // 重写 handleOk 来验证必填项
  useEffect(() => {
    if (!modalRef) return;
    modalRef.okCallback = async () => {
      if (weakFlag) {
        // 验证原因说明必填
        if (!reasonText || !reasonText.trim()) {
          setReasonRequired(true);
          return false;
        }
        if (params) {
          params.attributeLongtext1 = reasonText;
        }
        await onOk();
      } else if (showSameSkuflag && strongFlag) {
        openPage(`/product-detail?productId=${cheapestSkuId}&sourceFrom=${cheapestSourceForm}`);
      }
    };
  }, [modalRef, onOk, weakFlag, strongFlag, reasonText]);

  // 一键填入功能：点击标签自动填入文本框
  const handleQuickFill = (value) => {
    setReasonText(value);
    setReasonRequired(false);
  };

  // 手动输入时清除必填提示
  const handleInputChange = (value) => {
    setReasonText(value);
    setReasonRequired(false);
  };

  return (
    <div>
      {strongFlag ? (
        <span
          onClick={() => {
            openPage(`/product-detail?productId=${cheapestSkuId}&sourceFrom=${cheapestSourceForm}`);
            Modal.destroyAll();
            // modal.close();
          }}
          className="lowest-modal-info"
        >
          {intl
            .getHTML('mallf.common.productDetail.view.strongLowsetPriceFlag', {
              value: cheapestSkuName,
            })
            .d(
              <span>
                {intl
                  .get('mallf.common.view.carlsberg.strongLowestPriceFlag')
                  .d('此商品非最低价商品，请选择同款最低价')}
                <b>{cheapestSkuName}</b>
                {intl.get('mallf.common.view.carlsberg.buy').d('购买')}
              </span>
            )}
        </span>
      ) : (
        <>
          <div>
            <span>
              {intl
                .get('mallf.common.view.carlsberg.hasLowerPricePdt')
                .d('存在比该商品更低价格的商品(')}
              <b>
                <Link
                  to={`/product-detail?productId=${cheapestSkuId}&sourceFrom=${cheapestSourceForm}`}
                >
                  {cheapestSkuName}
                </Link>
              </b>
              {intl.get('mallf.common.view.isNextCartBuy').d(')，是否继续加购/下单')}
            </span>
          </div>

          {/* 二开新增部分开始 */}
          <div style={{ marginTop: 20 }}>
            {/* 必填提示 */}
            <div style={{ color: '#d50000', marginBottom: 12 }}>
              <span>*</span>
              {intl
                .get('mallf.common.view.carlsberg.weakLowestPriceFlag')
                .d('若需要继续选购当前商品，请填写选购非最低价商品原因')}
              ：
            </div>

            {/* 一键填入区域：如果有可用内容才显示 */}
            {reasonOptions.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <span style={{ marginRight: 8, color: '#666' }}>
                  {intl.get('mallf.common.view.carlsberg.quickFill').d('一键填入')}：
                </span>
                {reasonOptions.map((option) => (
                  <span
                    key={option.value}
                    onClick={() => handleQuickFill(option.value)}
                    style={{
                      color: '#1890ff',
                      cursor: 'pointer',
                      marginRight: 16,
                      textDecoration: 'underline',
                    }}
                  >
                    {option.meaning}
                  </span>
                ))}
              </div>
            )}

            {/* 原因说明文本框 */}
            <TextArea
              placeholder={intl.get('mallf.common.view.carlsberg.reason').d('原因说明...')}
              value={reasonText}
              onChange={handleInputChange}
              rows={3}
              style={{ width: '100%' }}
            />

            {/* 必填校验提示 */}
            {reasonRequired && (
              <div style={{ color: '#d50000', marginTop: 8, fontSize: 12 }}>
                {intl.get('mallf.common.view.carlsberg.reasonRequired').d('请填写原因说明')}
              </div>
            )}
          </div>
          {/* 二开新增部分结束 */}
        </>
      )}
    </div>
  );
}

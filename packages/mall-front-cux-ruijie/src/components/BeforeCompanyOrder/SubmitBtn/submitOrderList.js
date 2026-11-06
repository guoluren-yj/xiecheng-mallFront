/* eslint-disable no-param-reassign */
import { isEmpty } from 'lodash';
import HmallConfig from 'utils/api-config';
import {
  getUserConfigInfo,
  getOrganizationId,
  getHeader,
  getSprmDetailUrl,
  getSprmListUrl,
} from 'utils/utils';
import { fecthLotNum } from 'services/cartService';
import Swal from 'components/swal';
import intl from 'utils/intl';
import { fetchToPay } from '../../../services';

/**
 * 提交采购预申请
 */
const submitOrderList = (params) => {
  const {
    setOrderData,
    orderData,
    setSubmitLoading,
    headerCode,
    eCLineCode,
    cataLineCode,
    isOMS,
    history,
    hasSiglProduct,
  } = params;
  const {
    redirectToSrm = 0, // 预采购申请跳转配置(0不跳srm，1跳)
    unitId,
    unitName,
    unitCode,
  } = getUserConfigInfo();
  // 提交采购预申请
  // 过滤掉不符合最小下单金额的数据
  const data = orderData.filter((item) => item.minPurchaseFlag !== 0);

  const error = [];
  const validateArr = [];
  const validateIndexArr = [];

  data.forEach((o, headerIndex) => {
    if (o.DS) validateArr.push(o.DS?.validate());
    if (o.DS) validateIndexArr.push({ headerIndex });
    // eslint-disable-next-line no-unused-expressions
    o.shoppingCartDTOList?.forEach((p, lineIndex) => {
      if (p.DS) validateArr.push(p.DS?.validate());
      if (p.DS) validateIndexArr.push({ headerIndex, lineIndex });
    });
  });
  if (data.some((p) => p.remarkRequired === 1) && !data.every((p) => !!p.remark)) {
    Swal(intl.get(`mallf.common.view.remark.required`).d('请填写备注信息'));
    return;
  }
  if (data.some((p) => p.prTypeIdRequired === 1) && !data.every((p) => !!p.prTypeId)) {
    Swal(intl.get(`mallf.common.view.prType.required`).d('请填写采购申请类型'));
    return;
  }

  Promise.all(validateArr).then((arr) => {
    if (arr.every((p) => !!p)) {
      const newOrderData = data.map((item) => {
        const purchaseHeaderForm = item?.purchaseHeaderForm; // 头form
        const productListForm = item?.productListForm; // 头form
        let purchaseHeaderFormValue = {}; // 头form  标准字段value
        if (!isEmpty(purchaseHeaderForm)) {
          purchaseHeaderForm.validateFieldsAndScroll(
            { scroll: { offsetTop: 100 } },
            (err, values) => {
              if (err) {
                item.error = true;
                error.push({ type: 'purchaseHeader', error: true });
              } else {
                item.error = false;
                purchaseHeaderFormValue = values;
              }
            }
          );
        }
        delete purchaseHeaderFormValue.neededDate;
        if (!isEmpty(productListForm)) {
          productListForm.validateFieldsAndScroll({ scroll: { offsetTop: 100 } }, (err) => {
            if (err) {
              item.error = true;
              error.push({ type: 'neededDate', error: true });
            } else {
              item.error = false;
            }
          });
        }
        return {
          ...item,
          purchaseType: 'COMPANY',
          terminalTypeCode: 'PC',
          unitId,
          unitName: `${unitCode}-${unitName}` || '',
          shoppingCartDTOList: item.shoppingCartDTOList.map((p) => {
            return {
              ...p,
              ...(p.DS?.toData() || {}),
              neededDate: p.neededDate,
            };
          }),
          invoiceRemark: item?.innerCompanyInvoiceVO?.invoiceRemark || null,
          ...purchaseHeaderFormValue,
          ...item.DS?.current?.toData(),
          error: item.remarkRequired === 1 && !item.remark ? false : item?.error,
        };
      });
      newOrderData.forEach((o) => {
        if (o.DS) delete o.DS;
        o.shoppingCartDTOList.forEach((s) => {
          if (s.DS) delete s.DS;
        });
      });
      if (isEmpty(error)) {
        setSubmitLoading(true);
        fetch(
          `${HmallConfig.apiGateway}/${
            HmallConfig.serviceName
          }/v1/${getOrganizationId()}/shopping-carts/pre-order?customizeUnitCode=${headerCode},${eCLineCode},${cataLineCode}`,
          {
            method: 'POST',
            headers: getHeader({
              'Content-type': 'application/json;charset=UTF-8',
            }),
            body: JSON.stringify(newOrderData),
          }
        )
          .then((res) => res.json())
          .then((res) => {
            if (res) {
              if (hasSiglProduct && res.paymentOrderNum) {
                fetchToPay({ paymentOrderNum: res.paymentOrderNum }).then((form) => {
                  document.open('text/html', 'replace');
                  document.write(form);
                  document.close();
                });
              } else {
                const resultMsg = {
                  failed: res.failed || false,
                  fieldMsg: res.message || '',
                  lotNum: res.result,
                  ...res,
                };
                if (redirectToSrm === 1 && isOMS && res.result !== undefined) {
                  let num = 0;
                  const clock = setInterval(() => {
                    num++;
                    fecthLotNum(res && res.result).then((resp) => {
                      if (resp?.reqId || resp?.reqLotNum) {
                        clearInterval(clock);
                        const redirectPath = resp.reqId
                          ? getSprmDetailUrl({ prHeaderId: resp.reqId })
                          : getSprmListUrl(resp.reqLotNum);
                        window.location.href = redirectPath;
                      }
                    });
                    if (num >= 10) {
                      const Path = `${HmallConfig.contextPath}/apply-result`;
                      history.push({
                        pathname: Path,
                        resultMsg,
                      });
                      clearInterval(clock);
                    }
                  }, 1000);
                } else {
                  const newPath =
                    redirectToSrm === 1 && !resultMsg.failed
                      ? orderData.length === 1
                        ? getSprmDetailUrl({ prHeaderId: res.prHeaderId })
                        : getSprmListUrl(res.result)
                      : `${HmallConfig.contextPath}/apply-result`;
                  // setProgressStep('100%');
                  setTimeout(() => {
                    if (redirectToSrm === 1 && !resultMsg.failed) {
                      window.location.href = newPath;
                    } else {
                      history.push({
                        pathname: newPath,
                        resultMsg,
                      });
                    }
                  }, 1000);
                }
              }
            }
          })
          .catch(() => {
            setSubmitLoading(false);
            Swal(
              intl
                .get(`mallf.companyOrder.model.companyOrder.createPurchaseErr`)
                .d('生成采购申请失败')
            );
          });
      } else {
        setOrderData(newOrderData);
      }
    } else {
      const newOrderData = [...data];
      arr.forEach((a, i) => {
        if (!a) {
          const { lineIndex, headerIndex } = validateIndexArr[i];
          newOrderData[headerIndex].error = true;
          if (lineIndex === undefined) {
            newOrderData[headerIndex].error = true;
          } else {
            newOrderData[headerIndex].shoppingCartDTOList[lineIndex].error = true;
          }
        }
      });
      setOrderData(newOrderData);

      const { headerIndex, lineIndex } = validateIndexArr[arr.indexOf(false)] || {};
      if (lineIndex !== undefined) {
        const errorsetTop =
          document.getElementsByClassName('BeforeCompanyOrder-ProductList')[headerIndex]
            ?.offsetTop || 0;
        document.documentElement.scrollTop = errorsetTop;
      }
    }
  });
};

export default submitOrderList;

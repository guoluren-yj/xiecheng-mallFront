/* eslint-disable no-unused-expressions */
/* eslint-disable no-param-reassign */
import { isEmpty, isNil } from 'lodash';
import HmallConfig from 'utils/api-config';
import {
  getUserConfigInfo,
  getOrganizationId,
  getHeader,
  getSprmDetailUrl,
  getSprmListUrl,
  gotoPayUrl,
} from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import { fecthLotNum } from 'services/cartService';
import Swal from 'components/swal';
import intl from 'utils/intl';
import CuxFn from '@/cuxTools/cuxFn';
import cuxComponent from 'cuxTools/cuxComponent';

const INVOICE_NULL_CODE = [
  'smodr.special.invoice.need.param',
  'smodr.invoice.info.not.null',
  'smodr.invoicer.info.not.null',
  'smct.check.invoice.fail',
];

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
  } = params;
  const {
    redirectToSrm = 0, // 预采购申请跳转配置(0不跳srm，1跳)
    unitId,
    unitName,
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
  // 校验必填字段
  let requiredError;
  ['remark', 'wholeOrderFlag'].forEach((field) => {
    if (data.some((p) => p[`${field}Required`] === 1 && isNil(p[field]))) {
      const fieldName = data[0]?.[`${field}FieldName`];
      requiredError = true;
      Swal(
        intl
          .get(`mallf.common.view.value.required`, {
            value: fieldName || intl.get('mallf.companyOrder.view.remark.info').d('备注信息'),
          })
          .d(`请填写${fieldName}`)
      );
    }
  });
  if (requiredError) {
    return;
  }

  if (data.some((p) => p.prTypeIdRequired === 1) && !data.every((p) => !!p.prTypeId)) {
    Swal(intl.get(`mallf.companyOrder.view.prType.required`).d('请填写采购申请类型'));
    return;
  }

  const productRemarkError = [];

  data.forEach((o) => {
    o.shoppingCartDTOList.forEach((product) => {
      // // 校验备注信息
      if (product.productRemarkFlag === 1 && !product.remark) {
        product.productErrorFlag = true;
        productRemarkError.push({ error: true });
      } else {
        product.productErrorFlag = false;
      }
    });
  });
  if (!isEmpty(productRemarkError)) {
    setOrderData(data);
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
                purchaseHeaderFormValue.neededDate = values.neededDate?.format(
                  DEFAULT_DATETIME_FORMAT
                );
              }
            }
          );
        }
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
        const headerDSData = item.DS?.current?.toData() || {};
        return {
          ...item,
          returnUrl: `${window.location.origin}/my-mall/my-order`,
          purchaseType: 'COMPANY',
          terminalTypeCode: 'PC',
          unitId,
          unitName,
          invoiceRemark: item?.innerCompanyInvoiceVO?.invoiceRemark || null,
          ...headerDSData,
          ...purchaseHeaderFormValue,
          attachmentUuid: item.attachmentUuid,
          remark: item.remark,
          ...(!!headerDSData?.prTypeId && typeof headerDSData?.prTypeId === 'object'
            ? headerDSData.prTypeId
            : {}), // 处理prTypeId
          ...(!!headerDSData?.prTypeIdLov && typeof headerDSData?.prTypeIdLov === 'object'
            ? headerDSData.prTypeIdLov
            : {}), // 处理prTypeId
          error: item.remarkRequired === 1 && !item.remark ? false : item?.error,
          shoppingCartDTOList: item.shoppingCartDTOList.map((p) => {
            return {
              ...p,
              ...(p.DS?.toData() || {}),
              neededDate: p.neededDate,
            };
          }),
        };
      });
      const toSubmit = () => {
        newOrderData.forEach((o) => {
          if (o.DS) delete o.DS;
          o.shoppingCartDTOList.forEach((s) => {
            if (s.DS) delete s.DS;
          });
        });
        // 处理整单发货字段
        const newOrderDataParams = newOrderData.map((item) => ({
          ...item,
          deliveryMethod: item.wholeOrderFlag,
        }));
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
            body: JSON.stringify(newOrderDataParams),
          }
        )
          .then((res) => res.json())
          .then((res) => {
            if (res) {
              const resultMsg = {
                failed: res.failed || false,
                fieldMsg: res.message || '',
                lotNum: res.result,
                ...res,
              };
              if (res.paymentOrderNum && (res.cashierHtml || res.cashierUri)) {
                gotoPayUrl(res);
              } else if (redirectToSrm === 1 && isOMS && res.result !== undefined) {
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
              } else if (INVOICE_NULL_CODE.includes(res.code)) {
                return Promise.reject(res.message);
              } else {
                CuxFn({ name: 'BeforeCompanyOrder-fn-getPayUrl', value: { res } })();
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
          })
          .catch((err) => {
            setSubmitLoading(false);
            Swal(
              err ||
                intl
                  .get(`mallf.companyOrder.model.companyOrder.createPurchaseErr`)
                  .d('生成采购申请失败')
            );
          });
      };
      if (isEmpty(error)) {
        CuxFn({
          name: 'BeforeCompanyOrder-fn-toSubmit',
          value: { toSubmit, orderData: newOrderData, setOrderData },
        })(toSubmit)();
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
            // const product = newOrderData[headerIndex].shoppingCartDTOList[lineIndex];
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

export default cuxComponent({ path: 'BeforeCompanyOrder/SubmitBtn/submitOrderList', isFn: true })(
  submitOrderList
);

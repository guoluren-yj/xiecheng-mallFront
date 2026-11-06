import { isEmpty, isNil, isPlainObject } from 'lodash';
import HmallConfig from 'utils/api-config';
import {
  getUserConfigInfo,
  getOrganizationId,
  getHeader,
  getSprmDetailUrl,
  getSprmListUrl,
  gotoPayUrl,
} from 'utils/utils';
import { fecthLotNum } from 'services/cartService';
import Swal from 'components/swal';
import intl from 'utils/intl';
import CuxFn from '@/cuxTools/cuxFn';

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
    setPreData,
    orderData,
    setSubmitLoading,
    isOMS,
    history,
    preData,
    orderType,
  } = params;
  const {
    redirectToSrm = 0, // 预采购申请跳转配置(0不跳srm，1跳)
  } = getUserConfigInfo();
  // 提交采购预申请
  // 过滤掉不符合最小下单金额的数据
  const data = orderData.filter((item) => item.minPurchaseFlag !== 0);

  const error = []; // 行表单检验必填字段，包括二开字段
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

  // 校验某些必填字段
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
  // 没校验通过则返回
  if (requiredError) {
    return;
  }

  // 领用不校验
  if (
    data.some((p) => p.prTypeIdRequired === 1) &&
    !data.every((p) => (data.length < 30 ? !!p.prTypeId : !!p.DS?.current?.get('prTypeId'))) &&
    !data.some((n) => n.receiveFlag === 1)
  ) {
    Swal(intl.get(`mallf.common.view.prType.required`).d('请填写采购申请类型'));
    return;
  }

  Promise.all(validateArr).then(async (arr) => {
    if (arr.every((p) => !!p)) {
      orderData.forEach((item, index) => {
        const productListForm = item?.productListForm; // 头form
        if (!isEmpty(productListForm)) {
          productListForm.validateFieldsAndScroll({ scroll: { offsetTop: 100 } }, (err) => {
            if (err) {
              error.push({ type: 'lineForm', error: true });
            }
          });
        }
        const { remark, attachmentUuid } = item;
        const { prTypeId, ...other } = item.DS?.current?.toData() || {};
        const prTypeIdLov = isPlainObject(prTypeId) ? prTypeId : { prTypeId };
        const headerExta = {
          ...item,
          ...preData[index].orderExtraInfo,
          ...prTypeIdLov,
          ...other,
        };
        // 采购申请头信息
        preData[index].orderInfo = {
          ...preData[index].orderInfo,
          address: {
            ...(preData[index].orderInfo.address || {}),
            receiveChannel: 1, // 收货渠道 先默认mobile 可选项 2 email 1 mobile 邮箱 手机
          },
          remark,
          prTypeId: item.prTypeId?.prTypeId || item?.prTypeId,
          prTypeCode: item.prTypeId?.prTypeCode || item?.prTypeCode,
          prTypeName: item.prTypeId?.prTypeName || item?.prTypeName,
          ...prTypeIdLov,
          attachmentUuid,
          outerAttachmentUuid: headerExta.outerAttachmentUuid, // 新增外部附件
          terminalTypeCode: 'PC',
          returnUrl: `${window.location.origin}/my-mall/my-order`,
          deliveryMethod: item.wholeOrderFlag,
        };
        // 发票信息
        const { orderInvoiceInfo } = item;
        // orderInvoiceInfo可能为null
        const newOrderInvoiceInfo = orderInvoiceInfo || {};
        Object.keys(item).forEach((filed) => {
          if (filed.includes('nvoice') || filed.includes('aymentMethod')) {
            newOrderInvoiceInfo[filed] = item[filed];
          }
        });
        preData[index].orderInvoiceInfo = newOrderInvoiceInfo;
        // 删除个性化多余数据
        Object.keys(headerExta).forEach((key) => {
          if (typeof headerExta[key] === 'object') {
            delete headerExta[key];
          }
        });
        // 头个性化信息
        preData[index].orderExtraInfo = headerExta;
        // 行信息
        item.shoppingCartDTOList.forEach((p, pIndex) => {
          const { neededDate, remark: rmk, ...others } = p.DS?.toData() || {};
          // 删除个性化多余数据
          const lineExtra = {
            ...preData[index].orderLineList[pIndex].orderLineExtra,
            ...others,
            neededDate: p.neededDate || neededDate,
            urgentFlag: p.urgentFlag,
            remark: p.remark || rmk,
          };
          Object.keys(lineExtra).forEach((key) => {
            if (typeof lineExtra[key] === 'object') {
              delete lineExtra[key];
            }
          });
          // 行个性化信息
          preData[index].orderLineList[pIndex].orderLineExtra = lineExtra;
          // 行备注/需求日期/申请加急
          preData[index].orderLineList[pIndex].orderLineValue = {
            ...preData[index].orderLineList[pIndex].orderLineValue,
            neededDate: p.neededDate || neededDate,
            urgentFlag: p.urgentFlag,
            remark: p.remark || rmk,
          };
          preData[index].orderLineList[pIndex].orderLineProduct.skuSrmInfo = {
            ...preData[index].orderLineList[pIndex].orderLineProduct.skuSrmInfo,
            itemId: p.itemId,
            itemCode: p.itemCode,
            itemName: p.itemName,
          };
        });
      });
      const submitOrder = () => {
        fetch(
          `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${getOrganizationId()}/${
            orderType === 'centralized' ? 'centralized-relations' : 'carts'
          }/pre-order`,
          {
            method: 'POST',
            headers: getHeader({
              'Content-type': 'application/json;charset=UTF-8',
            }),
            body: JSON.stringify(preData),
          }
        )
          .then((res) => res.json())
          .then((res) => {
            if (res) {
              const resultMsg = {
                failed: res.failed || false,
                fieldMsg: res.message || '',
                lotNum: res.batchNum,
                ...res,
              };
              if (res.paymentOrderNum && (res.cashierHtml || res.cashierUri)) {
                gotoPayUrl(res);
              } else if (redirectToSrm === 1 && isOMS && res.batchNum !== undefined) {
                let num = 0;
                const clock = setInterval(() => {
                  num++;
                  fecthLotNum(res && res.batchNum).then((resp) => {
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
                const newPath =
                  redirectToSrm === 1 && !resultMsg.failed
                    ? orderData.length === 1
                      ? getSprmDetailUrl({ prHeaderId: res.prHeaderId })
                      : getSprmListUrl(res.batchNum)
                    : `${HmallConfig.contextPath}/apply-result`;
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
      const flag = await CuxFn({
        name: 'BeforeCompanyOrder-fn-submitValid',
        value: { params: preData, setSubmitLoading, error, setOrderData, submitOrder },
      })(() => true)();
      if (isEmpty(error) && flag) {
        setSubmitLoading(true);
        submitOrder();
      } else {
        setSubmitLoading(false);
        setOrderData(data);
        setPreData(preData.filter((n) => n.orderInfo?.minPurchaseFlag !== 0));
      }
    } else {
      const newOrderData = [...data];
      arr.forEach((a, i) => {
        if (!a) {
          const { lineIndex, headerIndex } = validateIndexArr[i];
          newOrderData[headerIndex].error = true;
          if (lineIndex !== undefined) {
            newOrderData[headerIndex].shoppingCartDTOList[lineIndex].error = true;
          }
        }
      });
      setOrderData(newOrderData);
      const { headerIndex = 0 } = validateIndexArr[arr.indexOf(false)] || {};
      const errorsetTop =
        document.getElementsByClassName('order-wrapper')[headerIndex]?.offsetTop || 0;
      document.body.scrollTop = errorsetTop;
    }
  });
};

export default submitOrderList;

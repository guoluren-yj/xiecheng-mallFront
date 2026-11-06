/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
export enum InvoiceType {
  VAT_INVOICE = 'VAT_INVOICE', // 增值税普通发票
  SPECIAL_INVOICE = 'SPECIAL_INVOICE', // 增值税专用发票
  DIGITAL_VAT_INVOICE = "DIGITAL_VAT_INVOICE", // 数电普票
  DIGITAL_SPECIAL_INVOICE = "DIGITAL_SPECIAL_INVOICE", // 数电专票
}

export enum InvoiceContent {
  DETAIL = 'DETAIL', // 明细
  CATEGORY = 'CATEGORY', // 大类
  GIFTCARD = 'GIFT_CARD', // 礼品卡
}

export enum InvoiceStatusType {
  success = 'SUCCEED', // 开票成功
  failed = 'FAILED', // 开票失败
  nonInvoice = 'NON_INVOICE', // 未开票
  processing = 'PROCESSING', // 开票中
  partInvoice = 'PART_INVOICE', // 部分开票
};

export enum InvoiceErrorCode {
  nonSupport = 'smodr.order.not.support.invoice.cause.after.sale.processing', // 正在售后
  noQuantity = 'smodr.order.not.support.invoice.cause.return.finish', // 无申请数量
};

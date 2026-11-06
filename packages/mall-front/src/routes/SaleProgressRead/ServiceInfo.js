import React from 'react';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';

export default function ServiceInfo(props) {
  const { detail } = props;
  const { afterSaleItemList = [], afterSaleWaybillList = [] } = detail;
  return (
    <div className="sale-service-body">
      <div className="sale-service">
        <div className="sale-submit-table">
          <div className="sale-table-header">
            {intl.get(`mallf.saleStatus.view.saleStatus.serviceOrderInformation`).d('服务单信息')}
          </div>
          <div className="sale-table-row">
            <span className="sale-table-label">
              {intl.get(`mallf.saleStatus.view.saleStatus.serviceType`).d('服务类型')}
            </span>
            <span className="sale-table-text">
              <span className="sale-table-name" title={detail.afsTypeName}>
                {detail.afsTypeName}
              </span>
            </span>
          </div>
          <div className="sale-table-row">
            <span className="sale-table-label">
              {intl.get('mallf.saleStatus.view.order.srmPoNum').d('商城订单号')}
            </span>
            <span className="sale-table-text">
              <span className="sale-table-name" title={detail.poNum}>
                {detail.poNum}
              </span>
            </span>
          </div>
          {detail.platformCode !== 'CATA' && (
            <>
              <div className="sale-table-row">
                <span className="sale-table-label">
                  {intl.get('mallf.saleStatus.view.order.E-commerceOrderNum').d('电商单号')}
                </span>
                <span className="sale-table-text">
                  <span className="sale-table-name" title={detail.poSubNum}>
                    {detail.poSubNum}
                  </span>
                </span>
              </div>
              <div className="sale-table-row">
                <span className="sale-table-label">
                  {intl.get('mallf.saleStatus.view.order.E-commerce').d('电商')}
                </span>
                <span className="sale-table-text">
                  <span className="sale-table-name" title={detail.platformCode}>
                    {detail.platformCode}
                  </span>
                </span>
              </div>
            </>
          )}
          {detail.platformCode !== 'CATA' && (
            <div className="sale-table-row">
              <span className="sale-table-label">
                {intl.get('mallf.saleStatus.view.yuyue.pickup.time').d('预约取件时间')}
              </span>
              <span className="sale-table-text">
                <span className="sale-table-name" title={detail.reserveTimeBegin}>
                  {`${detail.reserveTimeBegin || ''} - ${detail.reserveTimeEnd || ''}`}
                </span>
              </span>
            </div>
          )}
          <div className="sale-table-row">
            <span className="sale-table-label">
              {intl.get(`mallf.saleStatus.view.pickMethod`).d('退件方式')}
            </span>
            <span className="sale-table-text">{detail.pickWareTypeName}</span>
          </div>
          <div className="sale-table-row">
            <span className="sale-table-label">
              {intl.get(`mallf.saleStatus.view.saleStatus.problemDesc`).d('问题描述')}
            </span>
            <span className="sale-table-text">{afterSaleItemList[0]?.problemDesc}</span>
          </div>
          <div className="sale-table-row sale-image">
            <span className="sale-table-label">
              {intl.get('mallf.saleStatus.view.aftersale.image').d('售后图片')}
            </span>
            <span className="sale-table-text">
              {((afterSaleItemList[0] && afterSaleItemList[0]?.imageList) || []).map((img) => (
                <img alt="" src={img.fileUrl} />
              ))}
            </span>
          </div>
          <div className="contact-info-title">
            {intl.get('mallf.saleStatus.model.contactInfo').d('联系人信息')}
          </div>
          <div className="sale-table-row">
            <span className="sale-table-label">
              {intl.get(`mallf.saleStatus.view.saleStatus.contact`).d('联系人')}
            </span>
            <span className="sale-table-text">{detail.customerContactName}</span>
          </div>
          {detail.customerEmail && (
            <div className="sale-table-row">
              <span className="sale-table-label">
                {intl.get(`mallf.saleAppli.view.email`).d('邮箱')}
              </span>
              <span className="sale-table-text">{detail.customerEmail}</span>
            </div>
          )}
          {detail.customerTel && (
            <div className="sale-table-row">
              <span className="sale-table-label">
                {intl.get('mallf.saleAppli.view.order.contactInformation').d('联系方式')}
              </span>
              <span className="sale-table-text">{detail.customerTel}</span>
            </div>
          )}
          {detail.customerPostCode && (
            <div className="sale-table-row">
              <span className="sale-table-label">
                {intl.get(`mallf.saleAppli.view.zipCode`).d('邮编')}
              </span>
              <span className="sale-table-text">{detail.customerPostCode}</span>
            </div>
          )}
          <div className="sale-table-row">
            <span className="sale-table-label">
              {intl.get(`mallf.saleAppli.view.contactPhone`).d('联系电话')}
            </span>
            <span className="sale-table-text">{detail.customerMobilePhone}</span>
          </div>
          <div className="sale-table-row">
            <span className="sale-table-label">
              {intl.get(`mallf.saleAppli.view.contactAddress`).d('联系人地址')}
            </span>
            <span className="sale-table-text">{detail.pickWareFullAddress}</span>
          </div>
          {!!detail.returnWareFullAddress && (
            <div className="sale-table-row">
              <span className="sale-table-label">
                {intl.get(`mallf.saleAppli.view.saleStatus.returnAddress`).d('返件地址')}
              </span>
              <span className="sale-table-text">{detail.returnWareFullAddress}</span>
            </div>
          )}
          {/* 暂时不展示 */}
          {/* <div className="contact-info-title">{intl.get(`mallf.saleStatus.view.saleStatus.supplierInfo`).d('供应商信息')}</div>
          <div className="sale-table-row">
            <span className="sale-table-label">
              {intl.get(`mallf.saleStatus.view.saleStatus.contact`).d('联系人')}
            </span>
            <span className="sale-table-text">{detail.returnWareContactName}</span>
          </div>
          <div className="sale-table-row">
            <span className="sale-table-label">{intl.get('mallf.common.model.totalApplication').d('联系电话')}</span>
            <span className="sale-table-text">{detail.returnWareTel}</span>
          </div>
          <div className="sale-table-row">
            <span className="sale-table-label">地址</span>
            <span className="sale-table-text">{detail.returnWareTel}</span>
          </div> */}
          {!isEmpty(afterSaleWaybillList) && (
            <>
              <div className="contact-info-title">
                {intl.get(`mallf.saleStatus.view.saleStatus.waybillInformation`).d('运单信息')}
              </div>
              <div className="sale-table-row">
                <span className="sale-table-label">
                  {intl.get(`mallf.saleStatus.view.saleStatus.logisticsCompany`).d('物流公司')}
                </span>
                <span className="sale-table-text">
                  {afterSaleWaybillList[0]?.logisticsCompanyName}
                </span>
              </div>
              <div className="sale-table-row">
                <span className="sale-table-label">
                  {intl.get(`mallf.saleStatus.view.common.shipmentNum`).d('物流单号')}
                </span>
                <span className="sale-table-text">{afterSaleWaybillList[0]?.logisticsNum}</span>
              </div>
              <div className="sale-table-row">
                <span className="sale-table-label">
                  {intl.get(`mallf.saleStatus.view.saleStatus.deliveryTime`).d('发货时间')}
                </span>
                <span className="sale-table-text">{afterSaleWaybillList[0]?.deliverTime}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

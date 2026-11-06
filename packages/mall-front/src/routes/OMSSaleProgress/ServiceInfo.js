import React, { useEffect, useState, useMemo } from 'react';
import { Icon } from 'hzero-ui';
import { Table, DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import ImageViewer from 'components/ImageViewer';
import { searchUuidImage } from 'services/api';
import OverflowTip from 'components/OverflowTip';

const ExecDetail = ({ data }) => {
  const dataSet = useMemo(() => new DataSet({ paging: false, selection: false }), []);
  const columns = useMemo(
    () => [
      {
        name: 'skuCode',
        header: intl.get('mallf.saleStatus.view.productCode').d('商品编码'),
      },
      {
        name: 'skuName',
        header: intl.get('mallf.saleStatus.view.productName').d('商品名称'),
      },
      {
        name: 'skuTypeMeaning',
        header: intl.get('mallf.saleStatus.view.skuType').d('商品类型'),
      },
      {
        name: 'afterSaleTypeMeaning',
        header: intl.get('mallf.saleStatus.view.afsType').d('售后类型'),
      },
      {
        name: 'realityQuantityMeaning',
        header: intl.get('mallf.saleStatus.view.afsQuantity').d('售后数量'),
      },
    ],
    []
  );
  useEffect(() => {
    dataSet.loadData(data);
  }, [dataSet, data]);
  return <Table dataSet={dataSet} columns={columns} />;
};

export default function ServiceInfo(props) {
  const { detail } = props;
  const [file, setFile] = useState([]);
  const [preview, setPreview] = useState({ visible: false, fileList: [], index: 0 });

  useEffect(() => {
    if (detail?.afterSaleEntryList?.[0].attachmentUuid) {
      searchUuidImage(props.detail?.afterSaleEntryList?.[0].attachmentUuid).then((res) => {
        setFile(res);
      });
    }
  }, [detail?.afterSaleEntryList?.[0].attachmentUuid]);
  const {
    afterSaleWaybillList = [],
    afterSaleEntryDetailList = [],
    realityPickWareTypeMeaning,
  } = detail;
  const waybillData = afterSaleWaybillList?.find((p) => p.logisticsType === 'RETURN');

  // 显示实际执行明细表
  const showExecTable = afterSaleEntryDetailList && afterSaleEntryDetailList.length > 0;

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
              <span className="sale-table-name" title={detail.afterSaleTypeMeaning}>
                {detail.afterSaleTypeMeaning}
              </span>
            </span>
          </div>
          <div className="sale-table-row">
            <span className="sale-table-label">
              {intl.get('mallf.saleStatus.view.order.srmPoNum').d('商城订单号')}
            </span>
            <span className="sale-table-text">
              <span className="sale-table-name" title={detail.orderCode}>
                {detail.orderCode}
              </span>
            </span>
          </div>
          {detail.orderTypeCode === 'EC' && (
            <>
              <div className="sale-table-row">
                <span className="sale-table-label">
                  {intl.get('mallf.saleStatus.view.order.E-commerceOrderNum').d('电商单号')}
                </span>
                <span className="sale-table-text">
                  <span className="sale-table-name" title={detail.cecOrderCode}>
                    {detail.cecOrderCode}
                  </span>
                </span>
              </div>
              <div className="sale-table-row">
                <span className="sale-table-label">
                  {intl.get('mallf.saleStatus.view.order.E-commerce').d('电商')}
                </span>
                <span className="sale-table-text">
                  <span className="sale-table-name" title={detail.showCecFromMeaning}>
                    {detail.showCecFromMeaning}
                  </span>
                </span>
              </div>
            </>
          )}
          {/* {detail.cecFromCode !== 'CATA' && (
            <div className="sale-table-row">
              <span className="sale-table-label">
                {intl.get('mallf.myMall.view.yuyue.pickup.time').d('预约取件时间')}
              </span>
              <span className="sale-table-text">
                <span className="sale-table-name" title={detail.reserveTimeBegin}>
                  {`${detail.reserveTimeBegin || ''} - ${detail.reserveTimeEnd || ''}`}
                </span>
              </span>
            </div>
          )} */}
          <div className="sale-table-row">
            <OverflowTip className="sale-table-label">
              {intl.get(`mallf.saleStatus.view.pickMethod`).d('退件方式')}
            </OverflowTip>
            <span className="sale-table-text">{detail.pickWareTypeMeaning}</span>
          </div>
          {(detail?.exchangeReasonMeaning || detail?.returnReasonMeaning) && (
            <div className="sale-table-row">
              <OverflowTip className="sale-table-label">
                {intl.get(`mallf.saleAppli.view.saleAfterReason`).d('售后原因')}
              </OverflowTip>
              <span
                className="sale-table-text"
                title={detail?.exchangeReasonMeaning || detail?.returnReasonMeaning}
              >
                {detail?.exchangeReasonMeaning || detail?.returnReasonMeaning}
              </span>
            </div>
          )}
          <div className="sale-table-row">
            <OverflowTip className="sale-table-label">
              {intl.get(`mallf.saleStatus.view.saleStatus.problemDesc`).d('问题描述')}
            </OverflowTip>
            <span className="sale-table-text" title={detail.reason}>
              {detail.reason}
            </span>
          </div>
          {file.length > 0 && (
            <div className="sale-table-row sale-image">
              <span className="sale-table-label">
                {intl.get('mallf.saleStatus.view.aftersale.image').d('售后图片')}
              </span>
              <span className="sale-table-text">
                {file.map((img, index) => (
                  <span className="pic">
                    <img alt="" src={img.fileUrl} />
                    <p
                      className="mode"
                      onClick={() => setPreview({ visible: true, fileList: file, index })}
                    >
                      <Icon type="eye-o" className="eye" />
                    </p>
                  </span>
                ))}
              </span>
            </div>
          )}
          {preview.visible && (
            <ImageViewer
              closeModal={() => {
                setPreview({ visible: false });
              }}
              imgList={preview.fileList}
              index={preview.index}
            />
          )}
          {detail?.pickWareType === 'PICK_UP' && (
            <>
              <div className="contact-info-title">
                {intl.get('mallf.saleStatus.model.PickInfo').d('取件信息')}
              </div>
              <div className="sale-table-row">
                <span className="sale-table-label">
                  {intl.get(`mallf.saleStatus.view.saleStatus.contactPick`).d('取件联系人')}
                </span>
                <span className="sale-table-text">{detail.pickUpAddress?.contactName}</span>
              </div>
              {detail.pickUpAddress?.postCode && (
                <div className="sale-table-row">
                  <span className="sale-table-label">
                    {intl.get(`mallf.saleAppli.view.zipCode`).d('邮编')}
                  </span>
                  <span className="sale-table-text">{detail.pickUpAddress?.postCode}</span>
                </div>
              )}
              <div className="sale-table-row">
                <span className="sale-table-label">
                  {intl.get(`mallf.saleStatus.view.pickUpPhone`).d('取件联系方式')}
                </span>
                {/* <span className="sale-table-text">{detail.pickUpAddress?.mobilePhone}</span> */}
                <span className="sale-table-text">
                  {detail.pickUpAddress?.internationalTelCode
                    ? `${detail.pickUpAddress?.internationalTelCode} | `
                    : ''}
                  {detail.pickUpAddress?.mobilePhone}
                </span>
              </div>
              <div className="sale-table-row">
                <span className="sale-table-label">
                  {intl.get(`mallf.saleAppli.view.pickupAddress`).d('取件地址')}
                </span>
                <span className="sale-table-text">
                  <OverflowTip>
                    {`${detail.pickUpAddress?.fullAddress || ''}${
                      detail.pickUpAddress?.address || ''
                    }`}
                  </OverflowTip>
                </span>
              </div>
              <div className="sale-table-row">
                <OverflowTip className="sale-table-label">
                  {intl.get(`mallf.saleAppli.view.reserveTime`).d('预约取件时间')}
                </OverflowTip>
                <span
                  className="sale-table-text"
                  title={`${detail.reserveTimeBegin || ''} ～ ${detail.reserveTimeEnd || ''}`}
                >
                  {`${detail.reserveTimeBegin || ''} ～ ${detail.reserveTimeEnd || ''}`}
                </span>
              </div>
            </>
          )}
          <div className="contact-info-title">
            {intl.get('mallf.saleStatus.model.contactInfo').d('联系人信息')}
          </div>
          <div className="sale-table-row">
            <span className="sale-table-label">
              {intl.get(`mallf.saleStatus.view.saleStatus.contact`).d('联系人')}
            </span>
            <span className="sale-table-text">{detail.receiptAddress?.contactName}</span>
          </div>
          {/* {detail.customerEmail && (
            <div className="sale-table-row">
              <span className="sale-table-label">
                {intl.get(`mallf.common.view.email`).d('邮箱')}
              </span>
              <span className="sale-table-text">{detail.customerEmail}</span>
            </div>
          )} */}
          {/* {detail.customerTel && (
            <div className="sale-table-row">
              <span className="sale-table-label">
                {intl.get('mallf.myMall.view.order.contactInformation').d('联系方式')}
              </span>
              <span className="sale-table-text">{detail.receiptAddress?}</span>
            </div>
          )} */}
          {detail.receiptAddress?.postCode && (
            <div className="sale-table-row">
              <span className="sale-table-label">
                {intl.get(`mallf.saleAppli.view.zipCode`).d('邮编')}
              </span>
              <span className="sale-table-text">{detail.receiptAddress?.postCode}</span>
            </div>
          )}
          <div className="sale-table-row">
            <span className="sale-table-label">
              {intl.get(`mallf.saleStatus.view.contactmanPhone`).d('联系人电话')}
            </span>
            {/* <span className="sale-table-text">{detail.pickUpAddress?.mobilePhone}</span> */}
            <span className="sale-table-text">
              {detail.receiptAddress?.internationalTelCode
                ? `${detail.receiptAddress?.internationalTelCode} | `
                : ''}
              {detail.receiptAddress?.mobilePhone}
            </span>
          </div>
          <div className="sale-table-row">
            <span className="sale-table-label">
              {intl.get(`mallf.saleAppli.view.contactAddress`).d('联系人地址')}
            </span>
            <span className="sale-table-text">
              <OverflowTip>
                {detail.receiptAddress?.fullAddress}
                {detail.receiptAddress?.address}
              </OverflowTip>
            </span>
          </div>
          {/* {(detail.afterSaleType === 'EXCHANGE' || detail.afterSaleType === 'REPAIR') &&
            !!detail.receiptAddress?.address && (
              <div className="sale-table-row">
                <span className="sale-table-label">
                  {intl.get(`mallf.saleStatus.view.saleStatus.returnAddress`).d('返件地址')}
                </span>
                <span
                  className="sale-table-text"
                  title={`${detail.receiptAddress?.fullAddress}${detail.receiptAddress?.address}`}
                >
                  {`${detail.receiptAddress?.fullAddress}${detail.receiptAddress?.address}`}
                </span>
              </div>
            )} */}
          {detail?.supplierAddress && (
            <>
              <div className="contact-info-title">
                {intl
                  .get(`mallf.saleStatus.view.saleStatus.supplierAfterAddress`)
                  .d('商家售后地址')}
              </div>
              <div className="sale-table-row">
                <span className="sale-table-label">
                  {intl.get(`mallf.saleStatus.view.saleStatus.contact`).d('联系人')}
                </span>
                <span className="sale-table-text">{detail.supplierAddress?.contactName}</span>
              </div>
              <div className="sale-table-row">
                <span className="sale-table-label">
                  {intl.get(`mallf.saleStatus.view.contactmanPhone`).d('联系人电话')}
                </span>
                <span className="sale-table-text">{detail.supplierAddress?.mobilePhone}</span>
              </div>
              <div className="sale-table-row">
                <span className="sale-table-label">
                  {intl.get(`mallf.saleStatus.view.saleStatus.supplierAddress`).d('售后地址')}
                </span>
                <span className="sale-table-text">
                  <OverflowTip>
                    {`${detail.supplierAddress?.fullAddress}${detail.supplierAddress?.address}`}
                    {detail.supplierAddress?.postCode &&
                      `/${intl.get(`mallf.saleAppli.view.zipCode`).d('邮编')}${
                        detail.supplierAddress?.postCode
                      }`}
                  </OverflowTip>
                </span>
              </div>
            </>
          )}
          {waybillData && (
            <>
              <div className="contact-info-title">
                {intl.get(`mallf.saleStatus.view.saleStatus.waybillInformation`).d('运单信息')}
              </div>
              <div className="sale-table-row">
                <OverflowTip className="sale-table-label">
                  {intl.get(`mallf.saleStatus.view.saleStatus.logisticsCompany`).d('物流公司')}
                </OverflowTip>
                <span className="sale-table-text">{waybillData?.logisticsCompanyName}</span>
              </div>
              <div className="sale-table-row">
                <OverflowTip className="sale-table-label">
                  {intl.get(`mallf.saleStatus.view.saleStatus.shipmentNum`).d('物流单号')}
                </OverflowTip>
                <span className="sale-table-text">{waybillData?.logisticsNum}</span>
              </div>
              {detail.orderTypeCode === 'EC' && (
                <div className="sale-table-row">
                  <span className="sale-table-label">
                    {intl.get(`mallf.saleStatus.view.saleStatus.deliveryTime`).d('发货时间')}
                  </span>
                  <span className="sale-table-text">{waybillData?.deliverTime}</span>
                </div>
              )}
            </>
          )}
          {(showExecTable || realityPickWareTypeMeaning) && (
            <>
              <div className="contact-info-title">
                {intl.get('mallf.saleStatus.model.actualExecDetail').d('实际执行明细')}
              </div>
              <div className="sale-table-row" r-if={realityPickWareTypeMeaning}>
                <span className="sale-table-label">
                  <OverflowTip className="sale-table-label">
                    {intl.get('mallf.saleStatus.view.returnType').d('退件方式')}
                  </OverflowTip>
                </span>
                <span className="sale-table-text">{realityPickWareTypeMeaning}</span>
              </div>
              {showExecTable && <ExecDetail data={afterSaleEntryDetailList} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

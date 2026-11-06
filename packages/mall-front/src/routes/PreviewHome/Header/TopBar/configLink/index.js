import React, { Fragment } from 'react';
import Swal from 'sweetalert2';
import { withRouter } from 'react-router-dom';
import withReactContent from 'sweetalert2-react-content';

import { getUserConfigInfo } from 'utils/utils';
import intl from 'utils/intl';

import PreferenceLink from './preferenceLink';
import styles from './index.less';

const RSwal = withReactContent(Swal);
function ConfigLink(props) {
  const {
    companyName,
    ouName,
    invoiceOrgName,
    purchaseOrgName,
    purchaseTypeConfig,
  } = getUserConfigInfo();
  const purchaseType = purchaseTypeConfig ? getUserConfigInfo().purchaseType : 'COMPANY';
  const handleClose = () => {
    RSwal.close();
    props.history.push(`/`);
    window.location.reload();
  };
  const showPreference = () => {
    RSwal.fire({
      html: (
        <PreferenceLink
          closeModal={() => {
            RSwal.close();
          }}
          handleClose={handleClose}
          // locale={props.intl.locale}
        />
      ),
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      width: 672,
      customContainerClass: 'swal-absolute',
      target: document.querySelector('.gb-wrapper'),
    });
  };

  return (
    <Fragment>
      {purchaseType && purchaseType === 'COMPANY' && (
        <a
          className={styles['preference-link']}
          id="topbar-showPreference"
          onClick={showPreference}
        >
          <span className="link-popup">
            {!companyName
              ? intl.get(`mallf.common.model.companyPurchaseConfig`).d('公司选买设置')
              : purchaseTypeConfig
              ? intl.get(`mallf.common.model.businessPurchase`).d('企业选买')
              : companyName}
          </span>
          <div
            className="preference-pop"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <span className="pop-title">
              {intl.get(`mallf.common.view.company.name`).d('公司名称')}:{' '}
            </span>
            {!companyName ? '' : companyName}
            <br />
            <span className="pop-title">
              {intl.get(`mallf.common.model.businessEntity`).d('业务实体')}:&nbsp;
            </span>
            {!ouName ? '' : ouName}
            <br />
            <span className="pop-title">
              {intl.get(`mallf.common.model.inventoryOrg`).d('库存组织')}:&nbsp;
            </span>
            {!invoiceOrgName ? '' : invoiceOrgName}
            <br />
            <span className="pop-title">
              {intl.get(`mallf.common.model.purchaseOrg`).d('采购组织')}:&nbsp;
            </span>
            {!purchaseOrgName ? '' : purchaseOrgName}
          </div>
        </a>
      )}
      {purchaseType && purchaseType === 'PERSON' && (
        <a
          className={styles['preference-link']}
          id="topbar-showPreference"
          onClick={showPreference}
        >
          <span className="link-popup">
            {!companyName
              ? intl.get(`mallf.common.model.personPurchaseConfig`).d('个人选买设置')
              : intl.get(`mallf.common.model.personPurchase`).d('个人选买')}
          </span>
          <div
            className="preference-pop"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <span className="pop-title">
              {intl.get(`mallf.common.view.company.name`).d('公司名称')}:{' '}
            </span>
            {!companyName ? '' : companyName}
          </div>
        </a>
      )}
      {!purchaseType && (
        <a
          className={styles['preference-link']}
          id="topbar-showPreference"
          onClick={showPreference}
        >
          <span className="link-popup">
            {intl.get(`mallf.common.model.choosePurchaseType`).d('请选择选买类型')}
          </span>
        </a>
      )}
    </Fragment>
  );
}
export default withRouter(ConfigLink);

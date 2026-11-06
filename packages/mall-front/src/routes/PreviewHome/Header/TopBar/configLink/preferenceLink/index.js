import React, { useState } from 'react';

import Image from 'components/Image';
import Icon from 'components/Icon';
import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import company3 from '@/assets/images/company2x.png';
import person3 from '@/assets/images/personal2x.png';

import Preference from './preference';
import style from './index.less';

function PreferenceLink(props) {
  const { closeModal, handleClose } = props;
  const { purchaseTypeConfig } = getUserConfigInfo();
  const [visible, setVisible] = useState(false);
  const [purchaseType, setPurchaseType] = useState(!purchaseTypeConfig ? 'COMPANY' : '');
  const preferenceProps = {
    purchaseType,
    closeAndReturn,
    onClose: handleClose,
  };

  function changeLink(type) {
    setVisible(true);
    setPurchaseType(type);
  }

  function closeAndReturn() {
    setVisible(false);
  }
  return (
    <div className={style['preference-container']}>
      {/* {

      } */}
      <div className="container-modal-header">
        <span>{intl.get(`mallf.common.model.companyPurchaseConfig`).d('公司选买配置')}</span>
        <Icon
          onClick={() => {
            closeModal();
          }}
          className="icon-modal-header-close"
        />
      </div>
      <div className="preference-container-content">
        {!visible && purchaseTypeConfig ? (
          <div className="preference-container-choose">
            <div
              onClick={() => {
                changeLink('COMPANY');
              }}
              className="company-purchase"
            >
              <div className="title">
                {intl.get(`mallf.common.model.businessPurchase`).d('企业选买')}
              </div>
              <p>
                {intl
                  .get(`mallf.header.model.header.businessPurchaseInfo`)
                  .d('与企业内部项目对接，适用于需要在企业内部系统操作的公司选买')}
                。
              </p>
              <div className="choose-span">
                {' '}
                {intl.get(`mallf.header.model.header.chooseBusiness`).d('选择企业')}&gt;{' '}
              </div>
              <div className="company-purchase-image">
                <Image value={company3} />
              </div>
            </div>
            <div
              onClick={() => {
                changeLink('PERSON');
              }}
              className="personal-purchase"
            >
              <div className="title">
                {intl.get(`mallf.common.model.personPurchase`).d('个人选买')}
              </div>
              <p>
                {intl
                  .get(`mallf.header.model.header.personPurchaseInfo`)
                  .d('无需企业内部流程，适用于个人采买或无企业内部系统的公司选买')}
                。
              </p>
              <div className="choose-span">
                {intl.get(`mallf.header.model.header.choosePerson`).d('选择个人')}&gt;
              </div>
              <div className="personal-purchase-image">
                <Image value={person3} />
              </div>
            </div>
          </div>
        ) : (
          <Preference {...preferenceProps} />
        )}
      </div>
    </div>
  );
}

export default PreferenceLink;

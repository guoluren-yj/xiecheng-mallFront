import React, { useState, useMemo, useEffect } from 'react';
import { DataSet, Button } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { Popover } from 'choerodon-ui';

import intl from 'utils/intl';
import { getCurrentUser } from 'utils/utils';
import UnitForm from './UnitForm';
import ds from './ds';
import styles from './index.less';
import { saveConfigInfo, getConfigInfo } from '@/services';

function ChooseUnit(props) {
  const { purchaseUnit } = props;
  const { id, tenantNum } = getCurrentUser();

  const [visible, setVisible] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const formDs = useMemo(() => {
    return new DataSet(ds());
  }, []);

  useEffect(() => {
    formDs.loadData([purchaseUnit]);
  }, []);

  function handleSubmit() {
    formDs.validate().then((flag) => {
      if (flag) {
        const data = formDs.current.toData();
        setSaveLoading(true);
        getConfigInfo({ tenantNum, userId: id }).then((list) => {
          saveConfigInfo({
            ...(list?.[0] || {}),
            userId: id,
            companyId: data.companyId,
            unitId: data.unitId,
          })
            .then(() => {
              window.location.reload();
            })
            .finally(() => {
              setSaveLoading(false);
            });
        });
      }
    });
  }

  return (
    <li className="user-panel-info" style={{ cursor: 'pointer' }}>
      <Popover
        overlayClassName={styles['unit-container']}
        content={
          <div className={styles['unit-info']}>
            <div className="unit-header">
              {' '}
              {intl.get(`mcux.common.view.purchaseOrg.info`).d('采买组织信息')}
            </div>
            <div className="unit-content">
              <UnitForm dataSet={formDs} />
            </div>
            <div className="unit-footer">
              <Button
                color="primary"
                onClick={() => {
                  handleSubmit();
                }}
                loading={saveLoading}
              >
                {intl.get(`mallf.common.button.ok`).d('确定')}
              </Button>
              <Button
                onClick={() => {
                  formDs.reset();
                  setVisible(false);
                }}
              >
                {intl.get(`mallf.common.button.cancel`).d('取消')}
              </Button>
            </div>
          </div>
        }
        placement="top"
        visible={visible}
        trigger={purchaseUnit?.unitName ? 'click' : ''}
      >
        <span
          onClick={() => {
            setVisible(true);
          }}
          className="link-popup"
        >
          {purchaseUnit?.unitName}
        </span>
      </Popover>
    </li>
  );
}

export default connect(({ global }) => ({
  unitList: global.unitList,
  purchaseUnit: global.purchaseUnit,
}))(ChooseUnit);

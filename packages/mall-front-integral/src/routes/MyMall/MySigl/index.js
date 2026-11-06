/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import React, { useEffect } from 'react';
import { Icon } from 'choerodon-ui';
import classNames from 'classnames';
import moment from 'moment';

import SVG_A from 'mall-front/lib/assets/images/myMall/points_all.svg';
import SVG_B from 'mall-front/lib/assets/images/myMall/points_in.svg';
import SVG_C from 'mall-front/lib/assets/images/myMall/points_out.svg';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { siglService } from 'utils/api-config';
import useSetState from 'hooks/useState';
import useRequest from 'hooks/useRequest';
import { getUserConfigInfo, numberRender } from 'utils/utils';
import Loading from 'mall-front/lib/components/loading';
import OverflowTip from 'mall-front/lib/components/OverflowTip';
import styles from './index.less';
import AllTable from './AllTable';
import InTable from './InTable';
import OutTable from './OutTable';

function MyCurrentSigl(props) {
  const { data, siggle } = props;
  const pointName = data.pointsTypeName;
  const [state, setState] = useSetState({
    data,
    currentStatus: 'all',
    integralBalance: 0,
    expirationDate: '',
    toalintegralBalance: 0,
  });

  useEffect(() => {
    const { integralBalance, expirationDate } = data.efficientIntegralDetails?.[0] || {};
    const toalintegralBalance = data.efficientIntegralDetails?.[1]?.integralBalance;
    setState({
      integralBalance,
      expirationDate: moment(expirationDate).format('YYYY/MM-DD').split('/')[1],
      toalintegralBalance,
    });
  }, [data]);
  const { integralBalance, expirationDate, toalintegralBalance, currentStatus } = state;
  return (
    <div className={styles['current-sigl-container']}>
      <p className="sigl-title">
        {siggle
          ? `${intl.get(`mallf.common.view.title.mySigl`).d(`我的积分`)}${
              pointName ? `-${pointName}` : ''
            }`
          : pointName}
        {toalintegralBalance > 0 && (
          <>
            <Icon type="schedule" className="help-icon" />
            <span className="sigl-info">
              {intl.get('mallf.common.model.myMall.sigl.expirationDate.info', {
                value1: integralBalance,
                value2: intl.get('mallf.common.view.sigl.name').d('积分'),
                value3: expirationDate,
                value4: toalintegralBalance,
              }).d(`共${toalintegralBalance}
                ${pointName}将于30天后到期,其中${integralBalance}${pointName}将于
                ${expirationDate}到期`)}
            </span>
          </>
        )}
      </p>
      <div className="sigl-count-list">
        <div
          onClick={() => setState({ currentStatus: 'all' })}
          className={classNames(['count-list-item', { active: currentStatus === 'all' }])}
        >
          <img src={SVG_A} alt="" />
          <div className="count-list-item-content">
            <OverflowTip style={{ width: 156 }}>
              {intl.get('mallf.mySigl.view.siglname.all').d(`剩余可用积分`)}
            </OverflowTip>
            <span>{data?.integralBalance ? numberRender(data?.integralBalance) : 0}</span>
          </div>
        </div>
        <div
          onClick={() => setState({ currentStatus: 'in' })}
          className={classNames(['count-list-item', { active: currentStatus === 'in' }])}
        >
          <img src={SVG_B} alt="" />
          <div className="count-list-item-content">
            <OverflowTip style={{ width: 156 }}>
              {intl.get('mallf.mySigl.view.siglname.in').d(`累计收入积分`)}
            </OverflowTip>
            <span>{data?.integralGrantTotal ? numberRender(data?.integralGrantTotal) : 0}</span>
          </div>
        </div>
        <div
          onClick={() => setState({ currentStatus: 'out' })}
          className={classNames(['count-list-item', { active: currentStatus === 'out' }])}
        >
          <img src={SVG_C} alt="" />
          <div className="count-list-item-content">
            <OverflowTip style={{ width: 156 }}>
              {intl.get('mallf.mySigl.view.siglname.out').d(`累计支出积分`)}
            </OverflowTip>
            <span>{data?.integralUseTotal ? numberRender(data?.integralUseTotal) : 0}</span>
          </div>
        </div>
      </div>
      <div className="sigl-content">
        <AllTable
          currentStatus={currentStatus}
          pointName={pointName}
          pointsTypeId={data.pointsTypeId}
        />
        <InTable
          currentStatus={currentStatus}
          pointName={pointName}
          pointsTypeId={data.pointsTypeId}
        />
        <OutTable
          currentStatus={currentStatus}
          pointName={pointName}
          pointsTypeId={data.pointsTypeId}
        />
      </div>
    </div>
  );
}

const MySigl = () => {
  const { webConfig, organizationId, userId } = getUserConfigInfo();
  const [state, setState] = useSetState({
    currentType: {},
  });
  const { resData: typeList } = useRequest({
    url: `/${siglService}/v1/${organizationId}/points-types/points-type/${userId}`,
    success: (res) =>
      setState({
        currentType: res?.[0] || {},
      }),
  });
  return (
    <>
      {typeList ? (
        <>
          {typeList?.length > 1 ? (
            <div className={styles['sigl-container']}>
              <p className="sigl-title">
                {intl.get(`mallf.common.view.title.mySigl`).d(`我的积分`)}
              </p>
              <div className="sigl-content">
                <div className="sigl-content-left">
                  <ul>
                    {typeList.map((type) => {
                      const {
                        efficientIntegralDetails = [],
                        pointsTypeCode,
                        pointsTypeName,
                        integralBalance,
                      } = type || {};
                      const { integralBalance: effectIntegralBalance } =
                        efficientIntegralDetails?.[0] || {};
                      return (
                        <li
                          className={classNames({
                            active: state.currentType.pointsTypeCode === pointsTypeCode,
                          })}
                          onClick={() => {
                            setState({ currentType: type });
                          }}
                        >
                          <p className="sigl-name text-overflow">
                            {pointsTypeName} {effectIntegralBalance > 0 && <Icon type="schedule" />}
                          </p>
                          <p className="sigl-num text-overflow">
                            {integralBalance ? numberRender(integralBalance) : 0}
                          </p>
                          <img
                            alt=""
                            src={require(`../../../assets/images/myMall/Points_Active_${
                              webConfig?.colorCode || 'A'
                            }.png`)}
                          />
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="sigl-content-right">
                  <MyCurrentSigl data={state.currentType} />
                </div>
              </div>
            </div>
          ) : (
            <MyCurrentSigl data={state.currentType} siggle />
          )}
        </>
      ) : (
        <Loading />
      )}
    </>
  );
};

export default formatterCollections({ code: ['mallf.mySigl'] })(MySigl);

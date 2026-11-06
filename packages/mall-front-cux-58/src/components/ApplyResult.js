import React, { useState, useEffect, useRef, useMemo } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import { withRouter } from 'react-router-dom';
import { isEmpty, compose } from 'lodash';
import { Icon } from 'choerodon-ui';

import { getUserConfigInfo, getPrimaryColor } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import intl from 'utils/intl';
import { accessIsLogin } from 'services/api';

import style from 'mall-front/lib/routes/ApplyResult/index.less';

function ApplyResult(props) {
  const constTime = useMemo(() => {
    const { poReturnTime } = getUserConfigInfo();
    if (poReturnTime && parseInt(poReturnTime, 10) > 0) {
      if (poReturnTime?.includes('s')) {
        return parseInt(poReturnTime, 10);
      } else if (poReturnTime?.includes('m')) {
        return parseInt(poReturnTime, 10) * 60;
      } else {
        return 5; // 5s后回退购物车
      }
    } else {
      return 5; // 5s后回退购物车
    }
  }, []);
  const countdownClock = useRef();
  const { isMixTenant } = getUserConfigInfo();
  const {
    location: { resultMsg },
  } = props;

  const [failed, setFailed] = useState(undefined);
  const [failedMsg, setFailedMsg] = useState();
  const [countdown, setCountdown] = useState(constTime);

  useEffect(() => {
    accessIsLogin();
    window.scrollTo(0, 0);

    if (!isEmpty(resultMsg)) {
      countdownClock.current = setInterval(() => {
        setCountdown((count) => count - 1);
      }, 1000);
    }

    if (resultMsg) {
      setFailed(resultMsg.failed);
      setFailedMsg(resultMsg.fieldMsg);
    } else {
      props.history.push({
        pathname: `${HmallConfig.contextPath}/cart`,
      });
    }
  }, []);

  function jumpTo() {
    clearInterval(countdownClock.current);
    const orderPath = '/my-mall/my-order';
    if (isMixTenant) {
      const path = failed ? '/cart' : orderPath;
      props.history.push(path);
    } else if (resultMsg.successNum !== 0) {
      window.location.href = `${failed ? `${HmallConfig.basePath}/cart` : orderPath}`;
    }
  }

  useEffect(() => {
    if (countdown <= 1) {
      jumpTo();
    }
  }, [countdown]);

  const clickRouter = (path) => {
    if (path === 'home') {
      props.history.push('/');
    } else if (path === 'order') {
      props.history.push('/my-mall/my-order');
    } else if (path === 'request') {
      props.history.push('/my-mall/my-request');
    } else if (path === 'cart') {
      props.history.push('/cart');
    } else {
      jumpTo();
    }
  };

  return (
    <React.Fragment>
      <div className={style['result-container']} style={{ minHeight: window.innerHeight - 400 }}>
        <div className="result-info">
          {isEmpty(resultMsg) ? (
            <div className="result-msg">
              <p style={{ marginBottom: 30 }}>
                <Icon
                  style={{ fontSize: 30, marginTop: -10, marginRight: 8 }}
                  type="sentiment_very_dissatisfied"
                />
                <span
                  style={{
                    fontSize: 24,
                    color: '#191919',
                    lineHeight: '36px',
                    fontWeight: 600,
                  }}
                >
                  {intl.get('mallf.common.view.page.invalide').d('当前页面已失效')}
                </span>
              </p>
              <p
                style={{
                  fontSize: 16,
                  color: '#191919',
                  lineHeight: '24px',
                  fontWeight: 600,
                  marginBottom: 10,
                }}
              >
                {intl.getHTML('mallf.common.view.jumpt.orderCenter').d(
                  <span>
                    请点击 <b>订单中心</b> 跳转至订单中心查看单据相关信息
                  </span>
                )}
              </p>
              <p
                style={{
                  fontSize: 16,
                  color: '#191919',
                  lineHeight: '24px',
                  fontWeight: 600,
                  marginBottom: 30,
                }}
              >
                {intl.getHTML('mallf.common.view.jumpt.cart').d(
                  <span>
                    或点击 <b>购物车</b> 跳转至购物车继续选购商品
                  </span>
                )}
              </p>
              <p>
                <div
                  style={{
                    display: 'inline-block',
                    width: 86,
                    height: 32,
                    background: getPrimaryColor(),
                    borderRadius: 2,
                    fontWeight: 600,
                    color: '#fff',
                    fontSize: 14,
                    lineHeight: '32px',
                    textAlign: 'center',
                    marginRight: 10,
                    cursor: 'pointer',
                  }}
                  onClick={() => clickRouter('order')}
                >
                  {intl.get('mallf.common.view.orderCenter').d('订单中心')}
                </div>
                <div
                  style={{
                    display: 'inline-block',
                    fontWeight: 600,
                    color: '#191919',
                    fontSize: 14,
                    lineHeight: '32px',
                    textAlign: 'center',
                    width: 72,
                    height: 32,
                    background: '#fff',
                    border: '1px solid rgba(0,0,0, 0.15)',
                    borderRadius: 2,
                    verticalAlign: 'top',
                    cursor: 'pointer',
                  }}
                  onClick={() => clickRouter('cart')}
                >
                  {intl.get(`mallf.common.view.common.cart`).d('购物车')}
                </div>
              </p>
            </div>
          ) : (
            <>
              <div className="result-msg">
                {failed ? (
                  <p className="failed-line">
                    <Icon type="cancel" />
                    <span>
                      {intl.get('mallf.applyRes.order.failed.info').d('抱歉，订单创建失败')}
                    </span>
                  </p>
                ) : (
                  // <p className="success-line">
                  //   <Icon type="check_circle" />
                  //   <span>{intl.get('mallf.applyRes.view.submit.success').d('提交成功')}</span>
                  // </p>
                  <></>
                )}
                {failedMsg && (
                  <p className="order-failed">
                    <span className="order-failed-label">
                      {intl.get('mallf.applyRes.order.failed.reason').d('失败原因')}:
                    </span>
                    <span className="order-failed-reason">{failedMsg}</span>
                  </p>
                )}
                {resultMsg?.successNum > 0 && (
                  <p className="order-successNum">
                    {resultMsg?.errorNum
                      ? intl
                          .getHTML(`mallf.common.applyResult.error.gotoMessage1`, {
                            value: resultMsg?.successNum,
                            value1: resultMsg?.errorNum,
                          })
                          .d(
                            <span>
                              该采购申请共生成<b>{resultMsg?.successNum}</b>个成功订单，
                              <strong>{resultMsg?.errorNum}</strong>个失败订单，前往
                              <i>订单中心</i>
                              即可查看
                            </span>
                          )
                      : intl
                          .getHTML(`mallf.common.applyResult.gotoMessage`, {
                            value: resultMsg?.successNum,
                          })
                          .d(
                            <span>
                              {/* 此处58租户级多语言修改 */}
                              该采购申请共生成<b>{resultMsg?.successNum}</b>个商城订单， 前往
                              <i>订单中心</i>
                              即可查看
                            </span>
                          )}
                  </p>
                )}
                {/* {resultMsg?.hasErrorFlag === 1 && (
              <span className="sub-order-msg">{`有(${resultMsg?.errorNum})条错误的采购申请`}</span>
            )} */}
                {/* {!isEmpty() && (
              <p className="order-po">
                <span className="order-po-label">
                  {intl.get('mallf.myMall.view.order.srmPoNum').d('商城订单号')}:
                </span>
                <span className="order-po-num">{resultMsg?.poNums.map(p => <p>{p}</p>)}</span>
              </p>
            )} */}
              </div>
              <div>
                {failed ? (
                  <>
                    <p className="res-msg">
                      {intl
                        .getHTML(`mallf.common.applyResult.backCartMessage`, {
                          value: countdown,
                        })
                        .d(
                          <span>
                            页面将于 <b>{countdown}s</b> 后跳转到 <b>购物车</b>{' '}
                            所有商品将会退回购物车
                          </span>
                        )}
                    </p>
                    <a className="success-btn jumpt-to-now" onClick={() => clickRouter('cart')}>
                      {intl.get('mallf.applyRes.model.applyRes.clickJump').d('点击立即跳转')}
                    </a>
                  </>
                ) : (
                  <>
                    <p className="res-msg">
                      {intl
                        .getHTML(`mallf.common.applyResult.toOrderCenter.Message`, {
                          value: countdown,
                        })
                        .d(
                          <span>
                            页面将于 <b>{countdown}s</b> 后跳转到 <b>订单中心</b>
                          </span>
                        )}
                    </p>
                    {/* <p className="res-msg" r-if={getOpenCartFlag()}>
                      {intl.getHTML(`mallf.common.applyResult.toMyRequest.Message`).d(
                        <span>
                          您的申请已成功提交，可在 <b> 我的申请 </b>中查看或提交
                        </span>
                      )}
                    </p> */}
                    <div className="router-success">
                      <a className="success-btn jumpt-to-now" onClick={() => clickRouter('order')}>
                        {intl.get('mallf.applyRes.model.applyRes.clickJump').d('点击立即跳转')}
                      </a>
                      {/* <a
                        className="success-btn jumpt-to-now"
                        r-if={getOpenCartFlag()}
                        onClick={() => clickRouter('request')}
                      >
                        {intl.get('mallf.applyRes.model.applyRes.request').d('我的申请')}
                      </a> */}
                      <div className="success-btn jumpt-to-home">
                        <a onClick={() => clickRouter('home')}>
                          {intl.get('mallf.applyRes.model.goBack.homePage').d('返回商城首页')}
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </React.Fragment>
  );
}

export default compose(withRouter, formatterCollections({ code: 'mallf.applyRes' }))(ApplyResult);

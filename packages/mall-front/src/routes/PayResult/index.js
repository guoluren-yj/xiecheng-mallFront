import React, { Fragment } from 'react';
import qs from 'qs';

import intl from 'utils/intl';
import './PayResult.less';
import Link from 'components/Link';
import BreadCrumbs from 'components/BreadCrumbs';

class AfterApplication extends React.Component {
  componentDidMount() {
    window.scrollTo(0, 0);
  }

  renderResult = (num) => {
    if (num * 1 === 0) {
      return this.renderSuccess();
    } else if (num * 1 === -1) {
      return (
        <h1 style={{ textAlign: 'center' }}>
          {intl.get(`mallf.payResult.view.payResult.abnormalPaymentInformation`).d('支付信息异常')}
        </h1>
      );
    } else if (num * 1 === -2) {
      return (
        <h1 style={{ textAlign: 'center' }}>
          {intl.get(`mallf.payResult.view.payResult.paymentException`).d('处理支付结果异常')}
        </h1>
      );
    } else {
      return (
        <h1 style={{ textAlign: 'center' }}>
          {intl.get(`mallf.payResult.view.payResult.paymentFailed`).d('支付失败')}
        </h1>
      );
    }
  };

  renderSuccess = () => {
    const { tradeNum, amount, tradeTime = '000000000000' } = qs.parse(
      this.props.location.search.substr(1)
    );
    return (
      <div className="result-list">
        <div className="pay-result-icon" />
        <div className="pay-result-info">
          <p className="result-info-desc">
            {intl.get(`mallf.payResult.view.payResult.paymentSuccessful`).d('支付成功')}
          </p>
          <p className="result-info-time">
            {intl.get(`mallf.payResult.view.payResult.paymentTime`).d('支付时间')}：
            <span>
              {`${tradeTime.substr(0, 4)}-${tradeTime.substr(4, 2)}-${tradeTime.substr(
                6,
                2
              )} ${tradeTime.substr(8, 2)}:${tradeTime.substr(10, 2)}:${tradeTime.substr(12, 2)}`}
            </span>
          </p>
          <p className="result-info-orderNum">
            {intl.get(`mallf.payResult.view.payResult.orderNum`).d('订单编号')}：
            <span>{tradeNum}</span>
          </p>
        </div>
        <div className="pay-result-money">
          <p className="result-money-desc">
            {intl.get(`mallf.payResult.view.payResult.paymentAmount`).d('支付金额')}
          </p>
          <p className="result-money-price">
            <span>
              {`${amount.substr(0, amount.length - 2)}.${amount.substr(amount.length - 2)}`}
            </span>
          </p>
          <p className="result-money-operat">
            <Link to="/">
              {intl.get(`mallf.payResult.model.payResult.backToHomepage`).d('回到首页')}
            </Link>
            <Link to="/my-mall/my-order">
              {intl.get('mallf.payResult.view.orderCenter').d('订单中心')}
            </Link>
          </p>
        </div>
      </div>
    );
  };

  render() {
    const { status } = qs.parse(this.props.location.search.substr(1));
    return (
      <Fragment>
        <div className="pay-result-container">
          <BreadCrumbs
            className="breadCrumbs"
            value={{
              pageTitle: intl.get('mallf.payResult.view.orderCenter').d('订单中心'),
              childTitle1: intl.get('mallf.payResult.view.payment').d('支付'),
            }}
          />
          <div className="pay-result-list" style={{ minHeight: `${window.innerHeight - 263}px` }}>
            {this.renderResult(status)}
          </div>
        </div>
      </Fragment>
    );
  }
}

export default AfterApplication;

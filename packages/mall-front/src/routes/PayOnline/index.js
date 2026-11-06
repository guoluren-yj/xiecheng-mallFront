import React from 'react';
import qs from 'qs';
import formatterCollections from 'utils/intl/formatterCollections';
import * as HmallConfig from 'utils/api-config';
import * as Hmall from 'utils/utils';
import request from 'utils/request';
import Loading from 'components/loading';
import swalAlert from 'components/swal';

class AfterApplication extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      orderNum: '', // 订单号
      ecPlatform: '',
      type: 'PC',
      serverName: '', // 当前url
      orderType: 1, // 固定1
      // userId: 'b7df2750fe3645729b4f28ea5cbedd43', // 固定
    };
  }

  componentDidMount() {
    document.querySelector('#header').style.display = 'none';
    document.querySelector('#footer').style.display = 'none';
    const { orderNum, sourceFrom } = qs.parse(this.props.location.search.substr(1));
    const serverName = window.location.host;
    this.setState(
      {
        orderNum,
        ecPlatform: sourceFrom,
        serverName,
      },
      () => {
        if (this.state.orderNum) {
          this.fetchPayment();
        } else {
          this.props.history.push(`/${HmallConfig.contextPath}`);
        }
      }
    );
  }

  componentWillUnmount() {
    document.querySelector('header').style.display = 'block';
    document.querySelector('#footer').style.display = 'block';
  }

  /**
   * 在线支付接口请求
   */
  fetchPayment = () => {
    const { companyId } = Hmall.getUserConfigInfo();
    const { organizationId } = Hmall.getUserConfigInfo();
    const { orderNum, ecPlatform, type, serverName, orderType } = this.state;
    const url = `${HmallConfig.apiGateway}/${HmallConfig.ecServiceName}/v1/${organizationId}/jd-pay/show-pay-page`;
    this.setState({
      loading: true,
    });
    request(url, {
      method: 'POST',
      dataType: 'text',
      body: JSON.stringify({
        companyId,
        type,
        orderNum, // 订单号
        ecPlatform,
        serverName,
        note: '',
        orderType, // 固定1
      }),
    })
      .then((res) => {
        if (/^<html>/.test(res)) {
          // 以<html>开头代表请求成功
          // 为了兼容ie，ie不支持docsrc 所以动态写入iframe的document中
          // const iframeDocument = document.getElementById(`iframeId`).contentWindow.document;
          document.open('text/html', 'replace');
          document.write(res);
          document.close();
        } else {
          swalAlert('Error').then(() => {
            this.props.history.push('/order-center');
          });
        }
      })
      .finally(() => {
        this.setState({
          loading: false,
        });
      });
  };

  render() {
    const { loading } = this.state;
    return <div>{loading ? <Loading /> : ''}</div>;
  }
}

export default formatterCollections({ code: 'mallf.payResult' })(AfterApplication);

import React, { useRef, useEffect, useMemo } from 'react';
import qs from 'qs';
import moment from 'moment';
import uuid from 'uuid/v4';
import { isEmpty, compose } from 'lodash';
import { Button, Icon as HIcon } from 'hzero-ui';
import { withRouter } from 'react-router-dom';
import { Breadcrumb, Spin, Modal } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import formatterCollections from 'utils/intl/formatterCollections';
import { OMS_PURCHASE_APPLY_HEADER, OMS_PURCHASE_APPLY_LINE } from 'utils/customizeCode';
import request from 'mall-front/lib/utils/request';
import c7nCustomize from 'srm-front-scuz/lib/c7nCustomize';
import swalAlert from 'components/swal';
import { fetchStaticTestByCode } from 'services/api';
import { fetchOMSSubmit, fetchOMSSave, fetchOMSApplyDetail } from 'services/purchaseRequestService';
import { getOrganizationId, getUserConfigInfo, getPrimaryColor } from 'utils/utils';
import intl from 'utils/intl';
import HmallConfig from 'utils/api-config';
import useSetState from 'hooks/useState';
import useRequest from 'hooks/useRequest';
import styles from './index.less';
import BaseInfoForm from './BaseInfoForm';
import ApplyInfoTable from './ApplyInfoTable';
import ds1 from './BaseInfoForm/ds';
import ds2 from './ApplyInfoTable/ds';
// import { fetchEmployeeNum, fetchUnit } from '../../services/api';

const { Sidebar } = Modal;

function OMS(props) {
  const baseInfoFormDs = useRef(new DataSet(ds1()));
  const applyInfoTableDs = useRef(new DataSet(ds2()));
  const {
    organizationId,
    companyId,
    companyName,
    companyNum,
    userId,
    realName: userName,
    userConfig: { ouId, ouName, ouCode, purchaseOrgCode, purchaseOrgId, purchaseOrgName },
  } = getUserConfigInfo();
  const { manualRequestId } = qs.parse(window.location.search.substr(1)); // 编辑的时候有manualRequestId

  const [state, setState] = useSetState({
    detailRemarkVisible,
    staticCode: {},
    detailRemark: {},
    remarkVisible: false,
    daleiType: {},
    update: false,
    attachmentList: [],
    fullAddress: '',
    spinning: false,
    saveLoading: false,
    submitLoading: false,
    tableInitData: {},
    companyId,
    financialPrecision: undefined,
    defaultPrecision: undefined,
  });
  const {
    detailRemarkVisible,
    staticCode,
    detailRemark,
    fullAddress,
    spinning,
    saveLoading,
    submitLoading,
    daleiType,
    // financialPrecision,
    defaultPrecision,
  } = state;

  const remarkTypeCode = useMemo(() => {
    if (baseInfoFormDs.current?.current) {
      baseInfoFormDs.current.current.set('attributeVarchar1', daleiType.value);
      baseInfoFormDs.current.current.set('attributeVarchar1Meaning', daleiType.value);
      baseInfoFormDs.current.current.set('attributeVarchar1Lov', daleiType);
    }
    return staticCode[daleiType.value];
  }, [daleiType]);
  useEffect(() => {
    if (remarkTypeCode) {
      fetchStaticTestByCode(remarkTypeCode).then((res) => {
        setState({ detailRemark: res });
      });
    }
  }, [remarkTypeCode]);

  const { resData: daleiTypeList } = useRequest({
    url: `${HmallConfig.apiGateway}/hpfm/v1/lovs/value/page`,
    query: {
      lovCode: 'SCUX.BSL.ITEM_CATEGORY_HEADER',
      tenantId: getOrganizationId(),
      page: 0,
      size: 100,
    },
    success: (res) => {
      const obj = {};
      res.content.forEach((type, index) => {
        obj[type.value] = `SRM.BSL.APPLY.TYPE.REMARK.${
          String(index + 1).length === 2 ? `0${index + 1}` : `00${index + 1}`
        }`;
      });
      setState({
        staticCode: obj,
      });
      if (!manualRequestId && isEmpty(props.location?.data)) {
        setState({
          daleiType: res.content[0],
        });
      }
    },
  });

  useEffect(() => {
    // 设置初始值
    if (manualRequestId) {
      fetchDetail();
    } else if (props.location?.data) {
      const { manualRequestEntryList = [], ...headerInfo } = props.location?.data;
      setState({
        daleiType: {
          value: headerInfo.attributeVarchar1,
          meaning: headerInfo.attributeVarchar1Meaning,
        },
      });
      baseInfoFormDs.current.loadData([headerInfo]);
      manualRequestEntryList.forEach((line) => {
        applyInfoTableDs.current.create({
          ...line,
          _status: 'create',
        });
      });
      setState({
        defaultPrecision: headerInfo.defaultPrecision,
        financialPrecision: headerInfo.financialPrecision,
      });
    } else {
      baseInfoFormDs.current.data = [
        {
          requestBy: userId,
          requestByName: userName,
          purchaseCompanyName: companyName,
          purchaseCompanyId: state.companyId,
          purchaseCompanyCode: companyNum,
          requestDate: moment(new Date()),
          attachmentUuid: uuid(),
          ouId,
          ouName,
          ouCode,
          purchaseOrganizationId: purchaseOrgId,
          purchaseOrganizationName: purchaseOrgName,
          purchaseOrganizationCode: purchaseOrgCode,
          // contactTelNum: getStorage(`${userId}_defaultAddressPhone`) || '',
        },
      ];
      // getUnit();
      fetchPurchaseAgent(purchaseOrgId);
      fetchCurrency();
      fetchSetAttributeVarchar12(ouId, baseInfoFormDs.current.current);
    }
  }, [manualRequestId]);

  // 查询采购员
  function fetchPurchaseAgent(id) {
    request(
      `/sprm/v1/${organizationId}/purchase-requests/purchase-agent?lovCode=SPUC.PURCHASE_AGENT&page=0&size=10&purchaseOrgIds=${id}`
    ).then((res) => {
      if (res?.numberOfElements > 0) {
        const data = res?.content?.[0] || {};
        baseInfoFormDs.current.current.set('agentName', data.purchaseAgentName);
        baseInfoFormDs.current.current.set('agentId', data.purchaseAgentId);
        baseInfoFormDs.current.current.set('agentCode', data.sourceCode);
      }
    });
  }

  // 查询部门
  // function getUnit() {
  //   fetchEmployeeNum().then((r) => {
  //     if (r?.employeeId) {
  //       fetchUnit(r?.employeeId).then((res) => {
  //         if (!isEmpty(res)) {
  //           baseInfoFormDs.current.current.set('unitId', res[0]?.unitId);
  //           baseInfoFormDs.current.current.set('unitName', res[0]?.unitName);
  //           baseInfoFormDs.current.current.set('unitCode', res[0]?.unitCode);
  //         }
  //       });
  //     }
  //   });
  // }

  function fetchCurrency(code = 'CNY') {
    request(`/smdm/v1/${organizationId}/currency`, {
      query: {
        lovCode: 'SMDM.CURRENCY',
        currencyCode: code,
        tenantId: organizationId,
        enabledFlag: 1,
      },
    }).then((data) => {
      if (data?.content?.[0] && !manualRequestId) {
        const { currencyName, currencyId, currencyCode } = data?.content?.[0];
        baseInfoFormDs.current.current.set('currencyName', currencyName);
        baseInfoFormDs.current.current.set('currencyId', currencyId);
        baseInfoFormDs.current.current.set('currencyCode', currencyCode);
      }
    });
  }

  // 设置地址值
  const setAddress = (receiverAddressId, receiverAddressName, receiverRegionId) => {
    baseInfoFormDs.current.current.set('receiverAddressId', receiverAddressId);
    baseInfoFormDs.current.current.set('receiverAddressName', receiverAddressName);
    baseInfoFormDs.current.current.set('receiverRegionId', receiverRegionId);
  };

  // 查询详情信息
  const fetchDetail = () => {
    setState({ spinning: true });
    fetchOMSApplyDetail({
      manualRequestId,
      customizeUnitCode: `${OMS_PURCHASE_APPLY_HEADER},${OMS_PURCHASE_APPLY_LINE}`,
    })
      .then((res) => {
        if (res) {
          baseInfoFormDs.current.data = [res];
          applyInfoTableDs.current.data = res?.manualRequestEntryList;
          setState({
            daleiType: {
              value: res.attributeVarchar1,
            },
          });
        }
      })
      .finally(() => {
        setState({ spinning: false });
      });
  };

  const handleSave = ({ bodyParams, isSubmit }) => {
    if (isSubmit) {
      setState({ submitLoading: true });
      fetchOMSSubmit([bodyParams])
        .then(() => {
          swalAlert(intl.get('mallf.common.view.submit.success').d('提交成功'));
          props.history.push({
            pathname: '/my-mall/my-request',
          });
          props.history.push('/refresh');
        })
        .finally(() => {
          setState({ submitLoading: false });
        });
    } else {
      setState({ saveLoading: true });
      fetchOMSSave(bodyParams)
        .then((res) => {
          props.history.push({
            pathname: props.location.pathname,
            search: `?manualRequestId=${res.manualRequestId}`,
          });
          props.history.push('/refresh');
        })
        .finally(() => {
          setState({ saveLoading: false });
        });
    }
  };

  const handleOk = (isSubmit) => {
    let bodyParams = {};
    Promise.all([baseInfoFormDs.current.validate(), applyInfoTableDs.current.validate()]).then(
      (arr) => {
        if (arr.every((p) => !!p)) {
          bodyParams = {
            ...baseInfoFormDs.current.current.toData(),
            manualRequestEntryList: applyInfoTableDs.current.toData(),
          };
          handleSave({ bodyParams, isSubmit });
        }
      }
    );
  };

  const SubmitButton = observer(({ dataSet }) => {
    return (
      <Button
        waitType="throttle"
        wait={500}
        loading={submitLoading}
        disabled={!dataSet?.toData?.().length > 0}
        className="footer-btn"
        type="primary"
        onClick={() => {
          handleOk(true);
        }}
      >
        {intl.get('hzero.common.button.submit').d('提交')}
      </Button>
    );
  });

  const SaveButton = observer(({ dataSet }) => {
    return (
      <Button
        waitType="throttle"
        wait={500}
        loading={saveLoading}
        disabled={!dataSet?.toData?.().length > 0}
        onClick={() => {
          handleOk();
        }}
        className="footer-btn"
      >
        {intl.get('hzero.common.btn.save').d('保存')}
      </Button>
    );
  });

  // function info() {
  //   if (isEmpty(detailRemark)) return;
  //   Modal.info({
  //     width: 760,
  //     style: {
  //       overflow: 'hidden',
  //     },
  //     title: detailRemark.title,
  //     content: <div dangerouslySetInnerHTML={{ __html: `${detailRemark.text}` }} />,
  //     onOk() {},
  //   });
  // }

  return (
    <>
      <Breadcrumb
        className={classNames('container', styles['application-breadcrumb'])}
        separator=">"
      >
        <Breadcrumb.Item href="/">
          {intl.get('mallf.common.view.homePage').d('首页')}
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          {intl.get('mallf.common.submit.purchase.application').d('手工提报采购申请')}
        </Breadcrumb.Item>
      </Breadcrumb>
      <div className={classNames('container', styles.application)}>
        <div className="application-meun">
          <p className="meun-title">{intl.get('mallf.common.view.commonly.type').d('常用类型')}</p>
          <ul className="meun-list">
            {daleiTypeList?.content.map((p) => {
              return (
                <li
                  title={p.meaning}
                  className={classNames('text-overflow', { active: daleiType.value === p.value })}
                  onClick={() => {
                    setState({
                      daleiType: p,
                    });
                    applyInfoTableDs.current.forEach((record) => {
                      record.set('attributeVarchar1Lov', null);
                    });
                  }}
                >
                  {p.meaning}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="application-content">
          <p className="application-content-warning">
            <HIcon type="exclamation-circle" size={13} style={{ marginRight: '6px' }} />
            <span className="warning-remark">
              {intl
                .get('mallf.common.bsl.application.warning')
                .d(
                  '申请提报时需要注明设备名称、规格等，以保证需求提报的准确性，具体提报可参照详细说明'
                )}
            </span>
            {!isEmpty(detailRemark) && (
              <span
                className="remark-btn"
                onClick={() => {
                  setState({ detailRemarkVisible: true });
                }}
              >
                {intl.get('mallf.common.view.detail.remark').d('详细说明')}
              </span>
            )}
          </p>
          <Spin spinning={spinning || saveLoading || submitLoading}>
            <div className="application-content-info">
              <BaseInfoForm
                custForm={props.customizeForm}
                manualRequestId={manualRequestId}
                fullAddress={fullAddress}
                setState={setState}
                setAddress={setAddress}
                ds={baseInfoFormDs.current}
              />
              {!isEmpty(daleiType) && (
                <ApplyInfoTable
                  defaultPrecision={defaultPrecision}
                  custTable={props.customizeTable}
                  companyId={state.companyId}
                  manualRequestId={manualRequestId}
                  ds={applyInfoTableDs.current}
                  fetchDetail={fetchDetail}
                />
              )}
              <div className="addPurchase-apply-footer">
                <Button
                  className="footer-btn"
                  onClick={() => {
                    props.history.push({
                      pathname: '/my-mall/my-request',
                    });
                  }}
                >
                  {intl.get(`mallf.common.button.back`).d('返回')}
                </Button>
                <SaveButton dataSet={applyInfoTableDs.current} />
                <SubmitButton dataSet={applyInfoTableDs.current} />
              </div>
            </div>
          </Spin>
        </div>
      </div>
      <Sidebar
        // title={detailRemark.title}
        title={intl.get('mallf.common.view.detail.remark').d('详细说明')}
        visible={detailRemarkVisible}
        onCancel={() => setState({ detailRemarkVisible: !detailRemarkVisible })}
        width={742}
        footer={[
          <Button
            style={{ width: 58, height: 32, background: getPrimaryColor(), color: '#fff' }}
            key="back"
            onClick={() => setState({ detailRemarkVisible: !detailRemarkVisible })}
          >
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>,
        ]}
        closable
      >
        <div
          className={styles['detail-remark-content']}
          style={{ overflow: 'hidden' }}
          dangerouslySetInnerHTML={{ __html: `${detailRemark.text}` }}
        />
      </Sidebar>
    </>
  );
}

function fetchSetAttributeVarchar12(ouId, dataSet) {
  request(
    `/marmot/v1/${getOrganizationId()}/marmot-api/ZOxy1Cictib4eIo8af3alHmlHbv90iaiapOa2rGzSfnMgTA?ouId=${ouId}`
  ).then((res) => {
    if (res) {
      dataSet.set('attributeVarchar12', res?.value);
    }
  });
}

export { fetchSetAttributeVarchar12 };

export default compose(
  formatterCollections({ code: ['mallf.addPurchase', 'mallf.purchaseDetail'] }),
  c7nCustomize({
    unitCode: [OMS_PURCHASE_APPLY_HEADER, OMS_PURCHASE_APPLY_LINE],
  }),
  withRouter
)(OMS);

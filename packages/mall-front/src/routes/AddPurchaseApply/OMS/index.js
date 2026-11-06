import React, { useRef, useEffect } from 'react';
import qs from 'qs';
import { isEmpty } from 'lodash';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import { Spin } from 'choerodon-ui';
import { DataSet, Button, Message } from 'choerodon-ui/pro';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import uuid from 'uuid/v4';

import BreadCrumbs from 'components/BreadCrumbs';
import { useModal } from 'components/Import';
import c7nCustomize from 'srm-front-scuz/lib/c7nCustomize';
// import swalAlert from 'components/swal';
import { fetchEmployeeNum, fetchUnit } from 'services/api';
import { fetchOMSSubmit, fetchOMSSave, fetchOMSApplyDetail } from 'services/purchaseRequestService';
import { getUserConfigInfo, openImport, getUserConfig } from 'utils/utils';
import intl from 'utils/intl';
import { OMS_PURCHASE_APPLY_HEADER, OMS_PURCHASE_APPLY_LINE } from 'utils/customizeCode';
import styles from './index.less';
import BaseInfoForm from './BaseInfoForm';
import ApplyInfoTable from './ApplyInfoTable';
import useSetState from '@/hooks/useState';
import request from '@/utils/request';
import CuxFn from '@/cuxTools/cuxFn';
import baseDs from './BaseInfoForm/ds';

export default c7nCustomize({
  unitCode: [OMS_PURCHASE_APPLY_HEADER, OMS_PURCHASE_APPLY_LINE],
})(withRouter(OMS));
function OMS(props) {
  const baseInfoFormDs = useRef(new DataSet(baseDs()));
  const applyInfoTableDs = useRef({});
  const {
    companyId,
    companyName,
    companyNum,
    userId,
    realName: userName,
    loginName,
    organizationId,
    userConfig: { ouId, ouName, purchaseOrgCode, purchaseOrgId, purchaseOrgName },
    doubleUomFlag,
  } = getUserConfigInfo();

  const { manualRequestId } = qs.parse(window.location.search.substr(1)); // 编辑的时候有manualRequestId
  const [state, setState] = useSetState({
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
    update,
    fullAddress,
    spinning,
    saveLoading,
    submitLoading,
    financialPrecision,
    defaultPrecision,
    // attachmentList,
    // tableInitData,
  } = state;

  useEffect(() => {
    if (props.setCtxParams) {
      props.setCtxParams(getUserConfig());
    }
  }, [props.setCtxParams]);

  useEffect(() => {
    // 设置初始值
    if (manualRequestId) {
      fetchDetail();
    } else if (props.location?.data) {
      const { manualRequestEntryList = [], ...headerInfo } = props.location?.data;
      baseInfoFormDs.current.loadData([headerInfo]);
      fetchCurrency(headerInfo.currencyCode);
      setTimeout(() => {
        manualRequestEntryList.forEach((line) => {
          applyInfoTableDs.current.create({
            ...line,
            _status: 'create',
          });
        });
      });
      setState({
        defaultPrecision: headerInfo.defaultPrecision,
        financialPrecision: headerInfo.financialPrecision,
      });
    } else {
      const initData = {
        requestDate: moment(new Date()),
        purchaseCompanyName: companyName,
        purchaseCompanyId: state.companyId,
        purchaseCompanyCode: companyNum,
        ouId,
        ouName,
        attachmentUuid: uuid(),
        outerAttachmentUuid: uuid(), // 新增
      };
      if (purchaseOrgId && purchaseOrgName && purchaseOrgCode) {
        initData.purchaseOrganizationId = purchaseOrgId;
        initData.purchaseOrganizationName = purchaseOrgName;
        initData.purchaseOrganizationCode = purchaseOrgCode;
      }
      baseInfoFormDs.current.loadData([initData]);
      baseInfoFormDs.current.current.set('requestByLov', { loginName, userId, userName });
      CuxFn({
        name: 'AddPurchaseApply-OMS-fn-getUnit',
        value: { fn: getUnit, formDs: baseInfoFormDs.current },
      })(getUnit)();
      CuxFn({
        name: 'AddPurchaseApply-OMS-fn-fetchPurchaseAgent',
      })(() => fetchPurchaseAgent(purchaseOrgId))();
      CuxFn({
        name: 'AddPurchaseApply-OMS-fn-fetchCurrency',
        value: { fn: fetchCurrency, formDs: baseInfoFormDs.current },
      })(fetchCurrency)();
      setTimeout(() => {
        // 处理采购申请类型
        const manualRequestTypeSelect = baseInfoFormDs.current.current?.get(
          'manualRequestTypeSelect'
        );
        if (!isEmpty(manualRequestTypeSelect) && typeof manualRequestTypeSelect !== 'object') {
          const data = baseInfoFormDs.current.current
            ?.getField('manualRequestTypeSelect')
            ?.getLookupData();
          baseInfoFormDs.current.current.set('manualRequestTypeSelect', {
            prTypeCode: data.prTypeCode,
            meaning: data.meaning,
            value: data.value,
          });
        }
      }, 1000);
    }
  }, []);

  // 查询部门
  function getUnit() {
    fetchEmployeeNum().then((r) => {
      if (r?.employeeId) {
        fetchUnit(r?.employeeId).then((res) => {
          if (!isEmpty(res)) {
            baseInfoFormDs.current.current.set('unitId', res[0]?.unitId);
            baseInfoFormDs.current.current.set('unitName', res[0]?.unitName);
            baseInfoFormDs.current.current.set('unitCode', res[0]?.unitCode);
          }
        });
      }
    });
  }

  const handleImport = (id) => {
    openImport({
      code: 'SMODR.MANUAL_REQUEST_LINE',
      importType: 'excel',
      action: intl.get('mallf.purchaseDetail.application.line.import').d('申请行导入'),
      args: JSON.stringify({
        manualRequestId: id,
      }),
    });
  };

  function fetchCurrency(code = 'CNY') {
    request(`/smdm/v1/${organizationId}/currency`, {
      query: {
        lovCode: 'SMDM.CURRENCY',
        currencyCode: code,
        tenantId: organizationId,
        enabledFlag: 1,
      },
    }).then((data) => {
      if (data?.content?.[0]) {
        const {
          currencyName,
          currencyId,
          currencyCode,
          defaultPrecision: defPrecision,
          financialPrecision: finPrecision,
        } = data?.content?.[0];
        baseInfoFormDs.current.current.set('currencyName', currencyName);
        baseInfoFormDs.current.current.set('currencyId', currencyId);
        baseInfoFormDs.current.current.set('currencyCode', currencyCode);
        baseInfoFormDs.current.current.set('defaultPrecision', defPrecision);
        baseInfoFormDs.current.current.set('financialPrecision', finPrecision);
        setState({ ...state, defaultPrecision: defPrecision, financialPrecision: finPrecision });
      }
    });
  }

  // 查询采购员
  function fetchPurchaseAgent(id) {
    if (!id) return;
    request(
      `/smal/v1/${organizationId}/purchase-request/agent?lovCode=SMAL.MANUL_PURCHASE_AGENT&page=0&size=20&purchaseOrgId=${id}`
    ).then((res) => {
      if (res?.numberOfElements > 0) {
        const data =
          res?.content?.find((p) => p.defaultFlag === 1) ||
          (res?.content.length === 1 ? res?.content?.[0] || {} : {});
        baseInfoFormDs.current.current.set('agentName', data.purchaseAgentName);
        baseInfoFormDs.current.current.set('agentId', data.purchaseAgentId);
        baseInfoFormDs.current.current.set('agentCode', data.purchaseAgentCode);
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
  const fetchDetail = (id) => {
    setState({ spinning: true });
    const { manualRequestId: manualReqId } = qs.parse(window.location.search.substring(1));
    fetchOMSApplyDetail({ manualRequestId: id || manualReqId })
      .then((res) => {
        if (res) {
          baseInfoFormDs.current.loadData([
            {
              ...res,
              // 编辑回显时 取接口返回的outerAttachmentUuid 新建时创建一个
              outerAttachmentUuid: res.outerAttachmentUuid || uuid(),
              manualRequestTypeSelect: {
                value: res.manualRequestTypeId,
                meaning: res.manualRequestTypeName,
                prTypeCode: res.manualRequestTypeCode,
              },
            },
          ]);
          applyInfoTableDs.current.data = res?.manualRequestEntryList;
          applyInfoTableDs.current.forEach((record) => {
            // eslint-disable-next-line no-param-reassign
            record.status = 'update';
          });
          fetchCurrency(res.currencyCode);
        }
      })
      .finally(() => {
        setState({ spinning: false });
      });
  };

  const handleSave = ({ bodyParams, isSubmit, toImport, newImport }) => {
    if (isSubmit) {
      setState({ submitLoading: true });
      fetchOMSSubmit([bodyParams])
        .then(() => {
          Message.success(intl.get('mallf.addPurchase.view.submit.success').d('提交成功'));
          // swalAlert(intl.get('mallf.addPurchase.view.submit.success').d('提交成功'));
          props.history.push({
            pathname: '/my-mall/my-request',
          });
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
          fetchDetail(res.manualRequestId);
          if (toImport) {
            if (newImport) {
              useModal().openModal({
                businessObjectTemplateCode: doubleUomFlag
                  ? 'SMODR.MANUAL_REQUEST_LINE_DUAL'
                  : 'SMODR.MANUAL_REQUEST_LINE',
                refreshButton: true,
                prefixPatch: '/smodr',
                successCallBack: () => fetchDetail(res.manualRequestId),
                args: { manualRequestId: res.manualRequestId },
              });
            } else {
              handleImport(res.manualRequestId);
            }
          }
          // props.history.push('/refresh');
        })
        .finally(() => {
          setState({ saveLoading: false });
        });
    }
  };

  const handleOk = (isSubmit, toImport, newImport) => {
    let bodyParams = {};
    Promise.all([baseInfoFormDs.current.validate(), applyInfoTableDs.current.validate()]).then(
      (arr) => {
        if (arr.every((p) => !!p)) {
          bodyParams = {
            ...baseInfoFormDs.current.current.toData(),
            manualRequestEntryList: applyInfoTableDs.current
              .toData()
              .map((p, i) => ({ ...p, entryCode: i + 1 })),
          };
          const prTypeSelect = bodyParams.manualRequestTypeSelect;
          if (!isEmpty(prTypeSelect) && typeof prTypeSelect === 'object') {
            bodyParams.manualRequestTypeCode = prTypeSelect.prTypeCode;
            bodyParams.manualRequestTypeName = prTypeSelect.meaning;
            bodyParams.manualRequestTypeId = prTypeSelect.value;
          }
          if (baseInfoFormDs?.current?.current?.get('prNum')) {
            // 已提交/审批拒绝 提交时置空 头/行 总额字段 给后端计算
            const nameListA = ['predictAmountMeaning', 'predictAmount'];
            const nameListB = ['predictEntryAmountMeaning', 'predictEntryAmount'];
            nameListA.forEach((n) => {
              bodyParams[n] = null;
            });
            nameListB.forEach((n) => {
              bodyParams.manualRequestEntryList.forEach((li, key) => {
                bodyParams.manualRequestEntryList[key][n] = null;
              });
            });
          }
          handleSave({ bodyParams, isSubmit, toImport, newImport });
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
        color="primary"
        onClick={() => {
          handleOk(true);
        }}
      >
        {intl.get('mallf.addPurchase.button.submit').d('提交')}
      </Button>
    );
  });

  const SaveButton = observer(({ dataSet }) => {
    return (
      !baseInfoFormDs?.current?.current?.get('prNum') && ( // 目前审批拒绝/已提交 手工申请不能保存
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
          {intl.get('mallf.addPurchase.btn.save').d('保存')}
        </Button>
      )
    );
  });

  return (
    <div
      className={classNames({
        container: true,
        [styles['addPurchase-apply']]: true,
      })}
    >
      <BreadCrumbs
        value={{
          pageTitle: intl.get('mallf.common.submit.purchase.application').d('手工提报采购申请'),
        }}
      />
      <Spin spinning={spinning || saveLoading || submitLoading}>
        <div className="addPurchase-apply-content">
          <BaseInfoForm
            initDs={baseInfoFormDs.current}
            custForm={props.customizeForm}
            manualRequestId={manualRequestId}
            fullAddress={fullAddress}
            setState={setState}
            setAddress={setAddress}
            onDsRef={(ds) => {
              baseInfoFormDs.current = ds;
            }}
            applyInfoTableDs={applyInfoTableDs.current}
          />
          <ApplyInfoTable
            handleOk={handleOk}
            custTable={props.customizeTable}
            companyId={state.companyId}
            manualRequestId={manualRequestId}
            onDsRef={(ds) => {
              setState({ update: !update });
              applyInfoTableDs.current = ds;
            }}
            headerDs={baseInfoFormDs.current}
            fetchDetail={fetchDetail}
            financialPrecision={financialPrecision}
            defaultPrecision={defaultPrecision}
            doubleUomFlag={doubleUomFlag}
          />
          <div className="addPurchase-apply-footer">
            <Button
              style={{ marginLeft: '0.1rem' }}
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
  );
}

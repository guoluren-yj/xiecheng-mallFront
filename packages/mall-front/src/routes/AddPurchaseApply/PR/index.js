import React, { useRef, useEffect } from 'react';
import qs from 'qs';
import moment from 'moment';
import { Spin } from 'choerodon-ui';
import { Button, Message } from 'choerodon-ui/pro';
import { withRouter } from 'react-router-dom';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import BreadCrumbs from 'components/BreadCrumbs';
import c7nCustomize from 'srm-front-scuz/lib/c7nCustomize';
// import swalAlert from 'components/swal';
import { queryAddress } from 'services/productDetailService';
import {
  handleSavePur,
  fetchProductInfo,
  fetchDetailList,
  handleSubmitPur,
  fetchAutoGetCompany,
} from 'services/purchaseRequestService';
import { getUserConfigInfo } from 'utils/utils';
import intl from 'utils/intl';
import styles from './index.less';
import BaseInfoForm from './BaseInfoForm';
import ApplyInfoTable from './ApplyInfoTable';
import useSetState from '@/hooks/useState';

function AddPurchaseApply(props) {
  const baseInfoFormDs = useRef({});
  const applyInfoTableDs = useRef({});
  const { prHeaderId } = qs.parse(window.location.search.substr(1)); // 编辑的时候有prHeaderId
  const [state, setState] = useSetState({
    attachmentList: [],
    fullAddress: '',
    applyType: '',
    spinning: false,
    saveLoading: false,
    submitLoading: false,
    tableInitData: {},
  });
  const { fullAddress, applyType, spinning, saveLoading, submitLoading, tableInitData } = state;
  const {
    companyId,
    companyName,
    organizationId,
    userId,
    realName: userName,
    ouId,
    purchaseOrgId,
  } = getUserConfigInfo();

  useEffect(() => {
    // 设置初始值
    if (prHeaderId) {
      fetchHeader();
    } else {
      // setState({ applyType: 'MATERIALS' });
      baseInfoFormDs.current.data = [
        {
          requestedBy: userId,
          prRequestedName: userName,
          companyName,
          companyId,
          requestDate: moment(new Date()),
        },
      ];
      getDefaultAddress();
    }
  }, []);

  // 查询默认地址
  const getDefaultAddress = () => {
    queryAddress({ addressType: 'RECEIVER', companyId }).then((res) => {
      if (res && res?.content?.[0]) {
        const { addressId, fullAddress: addressName, regionIdList = [] } = res.content[0];
        const regionId = regionIdList.pop();
        setState({ fullAddress: addressName || null });
        setAddress(addressId, addressName || null, regionId);
      }
    });
  };

  // 设置地址值
  const setAddress = (receiverAddressId, receiverAddressName, receiverRegionId) => {
    baseInfoFormDs.current.current.set('receiverAddressId', receiverAddressId);
    baseInfoFormDs.current.current.set('receiverAddressName', receiverAddressName);
    baseInfoFormDs.current.current.set('receiverRegionId', receiverRegionId);
  };

  // 查询头信息
  const fetchHeader = () => {
    setState({ spinning: true });
    fetchDetailList(prHeaderId).then((res) => {
      if (res) {
        setTableInitData(res.ouId);
        baseInfoFormDs.current.data = [{ manualNum: '-', ...res }];
        setState({
          fullAddress: res.receiverAddressName,
          applyType: res.prTypeCode,
        });
        getLineData(res.prTypeCode === 'PROJECT');
      }
    });
  };

  const getLineData = () => {
    setState({ spinning: true });
    fetchProductInfo({ prHeaderId })
      .then((res) => {
        applyInfoTableDs.current.loadData(res);
      })
      .finally(() => {
        setState({ spinning: false });
      });
  };

  const handleSave = ({ bodyParams, isSubmit, isProject }) => {
    if (isSubmit) {
      if (prHeaderId) {
        setState({ submitLoading: true });
        // 提交已保存,开启提交loading,关闭初始请求loading
        handleSubmitPur(bodyParams, isProject)
          .then(() => {
            Message.success(intl.get('mallf.addPurchase.view.submit.success').d('提交成功'));
            // swalAlert(intl.get('mallf.purchaseDetail.view.submit.success').d('提交成功'));
            props.history.push({
              pathname: '/my-mall/my-request',
            });
          })
          .finally(() => {
            setState({ submitLoading: false });
          });
      } else {
        // 新建提交
        setState({ submitLoading: true, saveLoading: true });
        handleSavePur(bodyParams, isProject)
          .then((res) => {
            handleSubmitPur(res)
              .then(() => {
                Message.success(intl.get('mallf.addPurchase.view.submit.success').d('提交成功'));
                // swalAlert(intl.get('mallf.purchaseDetail.view.submit.success').d('提交成功'));
                props.history.push({
                  pathname: '/my-mall/my-request',
                });
              })
              .finally(() => {
                setState({ submitLoading: false });
              });
          })
          .finally(() => {
            setState({ saveLoading: false });
          });
      }
    } else {
      // 保存
      setState({ saveLoading: true });
      handleSavePur(bodyParams, isProject)
        .then((res) => {
          if (prHeaderId) {
            fetchHeader();
          } else {
            props.history.push({
              pathname: props.location.pathname,
              search: `?prHeaderId=${res.prHeaderId}`,
            });
            props.history.push('/refresh');
          }
        })
        .finally(() => {
          setState({ saveLoading: false });
        });
    }
  };

  const setTableInitData = (id) => {
    fetchAutoGetCompany({ ouId: id }).then((res) => {
      setState({
        tableInitData: res,
      });
    });
  };

  const handleOk = (isSubmit) => {
    const baseDs = baseInfoFormDs.current;
    const applyTableDs = applyInfoTableDs.current;

    const validateArr = [baseDs.validate()]; // 数据校验

    const baseInfoValue = baseDs.current.toData(); // 基本信息
    delete baseInfoValue.prTypeCodeSelect;
    delete baseInfoValue.companyLov;

    const headerInfo = { ouId, purchaseOrgId, ...baseInfoValue, tenantId: organizationId }; // 头信息

    let bodyParams = {};
    if (applyTableDs) validateArr.push(applyTableDs.validate());
    else return;
    const applyTableValue = applyTableDs?.toData(); // 申请信息table
    applyTableValue.forEach((_, i) => {
      delete applyTableValue[i]?.invOrganizationLov;
      delete applyTableValue[i]?.uomLov;
      delete applyTableValue[i]?.uomLov;
      delete applyTableValue[i]?.categoryLov;
      delete applyTableValue[i]?.costLov;
      delete applyTableValue[i]?.wbsCodeLov;
      delete applyTableValue[i]?.ouId; // 接口加密导致报错 先暂时删除
    });
    Promise.all(validateArr).then((arr) => {
      if (arr.every((p) => !!p)) {
        bodyParams = {
          ...headerInfo,
          prTypeCode: applyType,
          prLineList: applyTableValue || [],
        };
        handleSave({ bodyParams, isSubmit });
      }
    });
  };

  const SubmitButton = observer(({ dataSet }) => {
    return (
      <Button
        loading={submitLoading}
        disabled={!(dataSet?.toData?.().length > 0)}
        className="footer-btn"
        color="primary"
        onClick={() => {
          handleOk(true);
        }}
      >
        {intl.get('mallf.purchaseDetail.button.submit').d('提交')}
      </Button>
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
            custForm={props.customizeForm}
            setTableInitData={setTableInitData}
            prHeaderId={prHeaderId}
            fullAddress={fullAddress}
            applyType={applyType}
            setState={setState}
            setAddress={setAddress}
            onDsRef={(ds) => {
              baseInfoFormDs.current = ds;
            }}
          />
          <ApplyInfoTable
            custTable={props.customizeTable}
            getLineData={getLineData}
            prHeaderId={prHeaderId}
            tableInitData={tableInitData}
            headerDs={baseInfoFormDs.current}
            onDsRef={(ds) => {
              applyInfoTableDs.current = ds;
            }}
          />
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
            <Button
              loading={saveLoading}
              onClick={() => {
                handleOk();
              }}
              className="footer-btn"
            >
              {intl.get('mallf.common.btn.save').d('保存')}
            </Button>
            <SubmitButton dataSet={applyInfoTableDs.current} />
          </div>
        </div>
      </Spin>
    </div>
  );
}

export default c7nCustomize({
  unitCode: ['MALL.APPLY.EDIT.BASICINFO', 'MALL.APPLY.EDIT.APPLYINFO.TABLE'],
})(withRouter(AddPurchaseApply));

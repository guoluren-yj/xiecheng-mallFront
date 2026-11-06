import React, { useState, useEffect } from 'react';
import { Spin } from 'hzero-ui';

import Lov from 'components/lov';
import HmallConfig from 'utils/api-config';
import intl from 'utils/intl';
import { getCookie, setCookie, getUserConfigInfo, getOrganizationId } from 'utils/utils';
import { fetchUserConfigService, saveUserConfigService } from 'services/headerService';

import style from './index.less';

function Preference(props) {
  const { purchaseTypeConfig } = getUserConfigInfo();
  const { purchaseType, closeAndReturn } = props;
  const [userConfig, setUserConfig] = useState({});
  const [stateConfig, setStateConfig] = useState({
    companyId: undefined,
    companyName: '',
    ouId: undefined,
    ouName: '',
    invoiceOrgId: undefined,
    invoiceOrgName: '',
    purchaseOrgId: undefined,
    purchaseOrgName: undefined,
  });
  const [personConfig, setPersonConfig] = useState({
    companyId: undefined,
    companyName: '',
  });
  const [flags, setFlags] = useState({
    companyFlag: false,
    ouFlag: false,
    invFlag: false,
    purFlag: false,
  });
  const [loading, setLoading] = useState(true);
  // const [home, setHome] = useState(false);

  useEffect(() => {
    fetchUserConfig();
  }, []);

  function fetchUserConfig() {
    fetchUserConfigService()
      .then((res) => {
        if (purchaseType === 'PERSON') {
          const { personCompanyId, personCompanyName } = res;
          setPersonConfig({
            ...personConfig,
            companyId: personCompanyId,
            companyName: personCompanyName,
          });
        } else if (purchaseType === 'COMPANY') {
          const {
            companyId,
            companyName,
            ouId,
            ouName,
            invOrganizationId: invoiceOrgId,
            invOrganizationName: invoiceOrgName,
            purchaseOrgId,
            purchaseOrgName,
          } = res;
          setStateConfig({
            ...stateConfig,
            companyId,
            companyName,
            ouId,
            ouName,
            invoiceOrgId,
            invoiceOrgName,
            purchaseOrgId,
            purchaseOrgName,
          });
        }
        setUserConfig(res);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  /**
   * 选择公司回调
   * @param {Object} values - Lov 行
   */
  function chooseCompany(values) {
    const { companyId: prevCompanyId } = stateConfig;
    const { companyId, companyName } = values;
    let newState = {
      companyId,
      companyName,
    };
    if (companyId !== prevCompanyId) {
      // if (this.invoiceRef.current) this.invoiceRef.current.clearText();
      // if (this.purchaseRef.current) this.purchaseRef.current.clearText();
      newState = {
        ...newState,
        ouId: undefined,
        ouName: undefined,
        invoiceOrgId: undefined,
        invoiceOrgName: undefined,
        purchaseOrgId: undefined,
        purchaseOrgName: undefined,
      };
    }
    setFlags({
      ...flags,
      companyFlag: !companyId,
      ouFlag: !companyId || companyId !== prevCompanyId,
      invFlag: !companyId || companyId !== prevCompanyId,
      purFlag: !companyId || companyId !== prevCompanyId,
    });
    setStateConfig({ ...stateConfig, ...newState });
    // setHome(true);
  }

  /**
   * 个人选买选择公司回调
   * @param {Object} values - Lov 行
   */
  function personChooseCompany(values) {
    const { companyId: prevCompanyId } = personConfig;
    const { companyId, companyName } = values;
    let newState = {
      companyId,
      companyName,
    };
    if (companyId !== prevCompanyId) {
      newState = {
        ...newState,
      };
      // setHome(true);
    }
    setFlags({
      ...flags,
      companyFlag: !companyId,
    });
    setPersonConfig({ ...personConfig, ...newState });
  }

  /**
   * 选择业务实体回调
   * @param {Object} values - Lov 行
   */
  function chooseOu(values) {
    const { ouId: prevOuId } = stateConfig;
    const { ouId, ouName } = values;
    let newState = {
      ouId,
      ouName,
    };
    if (ouId !== prevOuId) {
      // if (this.invoiceRef.current) this.invoiceRef.current.clearText();
      newState = {
        ...newState,
        invoiceOrgId: undefined,
        invoiceOrgName: undefined,
      };
    }
    setFlags({
      ...flags,
      ouFlag: !ouId,
      invFlag: !ouId || ouId !== prevOuId,
    });
    setStateConfig({ ...stateConfig, ...newState });
  }

  /**
   * 选择库存组织回调
   * @param {Object} values - Lov 行
   */
  function chooseInvoice(values) {
    const { organizationId: invoiceOrgId, organizationName: invoiceOrgName } = values;
    const newState = {
      invoiceOrgId,
      invoiceOrgName,
    };
    setFlags({
      ...flags,
      invFlag: !invoiceOrgId,
    });
    setStateConfig({ ...stateConfig, ...newState });
  }

  /**
   * 选择采购组织回调
   * @param {Object} values - Lov 行
   */
  function choosePurchase(values) {
    const { purchaseOrgId, organizationName: purchaseOrgName } = values;
    const newState = {
      purchaseOrgId,
      purchaseOrgName,
    };
    setFlags({
      ...flags,
      purFlag: !purchaseOrgId,
    });
    setStateConfig({ ...stateConfig, ...newState });
  }

  function closeAndSave() {
    const { userId, organizationId, loginName } = getUserConfigInfo();
    let newUserConfig = {};
    let validateFlag = false;
    if (purchaseType === 'PERSON') {
      const { companyId, companyName } = personConfig;
      if (companyId) {
        validateFlag = true;
        newUserConfig = {
          ...userConfig,
          userId,
          personCompanyId: companyId,
          personCompanyName: companyName,
          purchaseType,
          tenantId: organizationId,
          userName: loginName,
        };
      } else {
        setFlags({
          ...flags,
          companyFlag: true,
        });
      }
    } else if (purchaseType === 'COMPANY') {
      const {
        companyId,
        companyName,
        ouId,
        ouName,
        invoiceOrgId: invOrganizationId,
        invoiceOrgName: invOrganizationName,
        purchaseOrgId,
        purchaseOrgName,
      } = stateConfig;
      if (companyId && ouId && invOrganizationId && purchaseOrgId) {
        validateFlag = true;
        newUserConfig = {
          ...userConfig,
          userId,
          companyId,
          companyName,
          ouId,
          ouName,
          invOrganizationId,
          invOrganizationName,
          purchaseOrgId: purchaseOrgId || null,
          purchaseOrgName,
          purchaseType,
          userName: loginName,
        };
      } else {
        setFlags({
          ...flags,
          companyFlag: !companyId,
          ouFlag: !ouId,
          invFlag: !invOrganizationId,
          purFlag: !purchaseOrgId,
        });
      }
    }
    if (validateFlag) {
      setLoading(true);
      saveUserConfigService(newUserConfig)
        .then(() => {
          setCookie('ecPlatform', getCookie('ecPlatform') || 'ALL');
          // onClose(home);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }

  function renderPerson() {
    const { companyId, companyName } = personConfig;
    const organizationId = getOrganizationId();
    const companyColumns = [
      {
        title: intl.get(`mallf.header.model.header.companyCode`).d('公司编码'),
        width: 200,
        dataIndex: 'companyNum',
        isQuery: true,
      },
      {
        title: intl.get(`mallf.common.view.company.name`).d('公司名称'),
        width: 200,
        dataIndex: 'companyName',
        isQuery: true,
      },
    ];
    return (
      <ul className="buy-preference">
        <li className="preference-item">
          <span className="preference-label label-required">
            {intl.get(`mallf.common.view.company.name`).d('公司名称')}
          </span>
          <Lov
            key={companyId}
            viewInfo={{
              width: 770,
              lovRowKey: 'companyId',
              queryUrl: `${HmallConfig.apiGateway}/spfm/v1/${organizationId}/user-authority-data/company`,
              columns: companyColumns,
              title: intl.get(`mallf.header.model.chooseCompanyName`).d('选择公司名称'),
              displayField: 'companyName',
              valueField: 'companyId',
            }}
            textValue={companyName}
            onOkCallback={personChooseCompany}
            width={300}
            height={35}
          />
          <div
            className="preference-validate"
            style={{
              color: flags.companyFlag ? 'rgb(255, 0, 0)' : 'rgba(0, 0, 0, 0)',
            }}
          >
            {intl.get(`mallf.header.model.chooseCompanyName`).d('选择公司名称')}
          </div>
        </li>
        <li className="preference-item">
          <span className="preference-label">
            {intl.get(`mallf.common.model.businessEntity`).d('业务实体')}
          </span>
          <Lov textValue="" width={300} height={35} disabled />
        </li>
        <li className="preference-item">
          <span
            className="preference-label"
            title={intl.get(`mallf.common.model.inventoryOrg`).d('库存组织')}
          >
            {intl.get(`mallf.common.model.inventoryOrg`).d('库存组织')}
          </span>
          <Lov key={stateConfig.ouId} textValue="" width={300} height={35} disabled />
        </li>
        <li className="preference-item">
          <span
            className="preference-label"
            title={intl.get(`mallf.common.model.purchaseOrg`).d('采购组织')}
          >
            {intl.get(`mallf.common.model.purchaseOrg`).d('采购组织')}
          </span>
          <Lov key={stateConfig.purchaseOrgId} textValue="" width={300} height={35} disabled />
        </li>
      </ul>
    );
  }

  function renderCompany() {
    const {
      companyId,
      companyName,
      ouId,
      ouName,
      // invoiceOrgId,
      invoiceOrgName,
      purchaseOrgId,
      purchaseOrgName,
    } = stateConfig;
    const organizationId = getOrganizationId();
    const companyColumns = [
      {
        title: intl.get(`mallf.header.model.header.companyCode`).d('公司编码'),
        width: 200,
        dataIndex: 'companyNum',
        isQuery: true,
      },
      {
        title: intl.get(`mallf.common.view.company.name`).d('公司名称'),
        width: 200,
        dataIndex: 'companyName',
        isQuery: true,
      },
    ];
    const ouColumns = [
      {
        title: intl.get(`mallf.common.view.organization.code`).d('组织编码'),
        width: 200,
        dataIndex: 'ouCode',
        isQuery: true,
      },
      {
        title: intl.get(`mallf.common.view.organization.name`).d('组织名称'),
        width: 200,
        dataIndex: 'ouName',
        isQuery: true,
      },
    ];
    const invOrgColumns = [
      {
        title: intl.get(`mallf.common.view.organization.code`).d('组织编码'),
        width: 200,
        dataIndex: 'organizationCode',
        isQuery: true,
      },
      {
        title: intl.get(`mallf.common.view.organization.name`).d('组织名称'),
        width: 200,
        dataIndex: 'organizationName',
        isQuery: true,
      },
    ];
    const purchaseOrgColumns = [
      {
        title: intl.get(`mallf.common.view.organization.code`).d('组织编码'),
        width: 200,
        dataIndex: 'organizationCode',
        isQuery: true,
      },
      {
        title: intl.get(`mallf.common.view.organization.name`).d('组织名称'),
        width: 200,
        dataIndex: 'organizationName',
        isQuery: true,
      },
    ];
    return (
      <ul className="buy-preference">
        <li className="preference-item">
          <span className="preference-label label-required">
            {intl.get(`mallf.common.view.company.name`).d('公司名称')}
          </span>
          <Lov
            key={companyId}
            viewInfo={{
              width: 770,
              lovRowKey: 'companyId',
              queryUrl: `${HmallConfig.apiGateway}/spfm/v1/${organizationId}/user-authority-data/company`,
              columns: companyColumns,
              title: intl.get(`mallf.header.model.header.chooseCompanyName`).d('选择公司名称'),
              displayField: 'companyName',
              valueField: 'companyId',
            }}
            textValue={companyName}
            onOkCallback={chooseCompany}
            width={300}
            height={35}
            disabled
            // ref={this.companyRef}
          />
          <div
            className="preference-validate"
            style={{
              color: flags.companyFlag ? 'rgb(255, 0, 0)' : 'rgba(0, 0, 0, 0)',
            }}
          >
            {intl.get(`mallf.header.model.header.chooseCompanyName`).d('选择公司名称')}
          </div>
        </li>
        <li className="preference-item">
          <span className="preference-label label-required">
            {intl.get(`mallf.common.model.businessEntity`).d('业务实体')}
          </span>
          <Lov
            key={companyId}
            viewInfo={{
              width: 770,
              lovRowKey: 'ouId',
              queryUrl: `${HmallConfig.apiGateway}/spfm/v1/${organizationId}/user-authority-data/ou?companyId=${companyId}&enabledFlag=1`,
              columns: ouColumns,
              title: intl.get(`mallf.header.model.header.chooseBusinessEntity`).d('选择业务实体'),
              displayField: 'ouName',
              valueField: 'ouId',
            }}
            textValue={ouName}
            onOkCallback={chooseOu}
            width={300}
            height={35}
            // ref={this.ouRef}
            disabled={!companyId}
          />
          <div
            className="preference-validate"
            style={{
              color: flags.ouFlag ? 'rgb(255, 0, 0)' : 'rgba(0, 0, 0, 0)',
            }}
          >
            {intl.get(`mallf.header.model.header.chooseBusinessEntity`).d('选择业务实体')}
          </div>
        </li>
        <li className="preference-item">
          <span
            className="preference-label label-required"
            title={intl.get(`mallf.common.model.inventoryOrg`).d('库存组织')}
          >
            {intl.get(`mallf.common.model.inventoryOrg`).d('库存组织')}
          </span>
          <Lov
            key={ouId}
            viewInfo={{
              width: 770,
              lovRowKey: 'organizationId',
              queryUrl: `${HmallConfig.apiGateway}/spfm/v1/${organizationId}/user-authority-data/company-invorg?ouId=${ouId}`,
              columns: invOrgColumns,
              title: intl.get(`mallf.header.model.header.chooseInventoryOrg`).d('选择库存组织'),
              displayField: 'organizationName',
              valueField: 'organizationId',
            }}
            textValue={invoiceOrgName}
            onOkCallback={chooseInvoice}
            width={300}
            height={35}
            // ref={this.invoiceRef}
            disabled={!companyId || !ouId}
          />
          <div
            className="preference-validate"
            style={{
              color: flags.invFlag ? 'rgb(255, 0, 0)' : 'rgba(0, 0, 0, 0)',
            }}
          >
            {intl.get(`mallf.header.model.header.chooseInventoryOrg`).d('选择库存组织')}
          </div>
        </li>
        <li className="preference-item">
          <span
            className="preference-label label-required"
            title={intl.get(`mallf.common.model.purchaseOrg`).d('采购组织')}
          >
            {intl.get(`mallf.common.model.purchaseOrg`).d('采购组织')}
          </span>
          <Lov
            key={purchaseOrgId}
            viewInfo={{
              width: 770,
              lovRowKey: 'purchaseOrgId',
              queryUrl: `${HmallConfig.apiGateway}/spfm/v1/${organizationId}/user-authority-data/purchase-organization`,
              columns: purchaseOrgColumns,
              title: intl.get(`mallf.header.model.header.choosePurchaseOrg`).d('选择采购组织'),
              displayField: 'organizationName',
              valueField: 'purchaseOrgId',
            }}
            textValue={purchaseOrgName}
            onOkCallback={choosePurchase}
            width={300}
            height={35}
            // ref={this.purchaseRef}
          />
          <div
            className="preference-validate"
            style={{
              color: flags.purFlag ? 'rgb(255, 0, 0)' : 'rgba(0, 0, 0, 0)',
            }}
          >
            {intl.get(`mallf.header.model.header.choosePurchaseOrg`).d('选择采购组织')}
          </div>
        </li>
      </ul>
    );
  }

  return (
    <div className={style['buy-preference-container']}>
      <Spin spinning={loading}>
        {purchaseType === 'PERSON'
          ? renderPerson()
          : purchaseType === 'COMPANY'
          ? renderCompany()
          : ''}
      </Spin>
      <div className="preference-confirm-container">
        {purchaseTypeConfig && (
          <button
            type="button"
            className="preference-confirm"
            onClick={() => {
              closeAndReturn();
            }}
          >
            {intl.get(`mallf.common.button.back`).d('返回')}
          </button>
        )}
        <button type="button" className="preference-confirm" onClick={closeAndSave}>
          {intl.get(`mallf.common.button.save`).d('保存')}
        </button>
      </div>
    </div>
  );
}
export default Preference;

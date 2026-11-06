import React from 'react';
import { Select, DataSet, Lov, Modal } from 'choerodon-ui/pro';
import { isNil, isEmpty } from 'lodash';
import intl from 'utils/intl';
import request from 'utils/request';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';

export function setQueryCartParams(props) {
  if (!isEmpty(props) && !isNil(props)) {
    const { dataSet, params } = props;
    const firstCatalog = dataSet.getState('firstCatalog');
    const secondAssetClass = dataSet.getState('secondAssetClass');
    return { ...params, firstCatalog, secondAssetClass };
  } else return {};
}

export function setQueryCartUi(props) {
  if (!isEmpty(props) && !isNil(props)) {
    const { dataSet } = props;
    const cuxDs = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'firstCatalogLov',
          type: 'object',
          lovCode: 'SMPC.CATALOG_FIRST_LEVEL',
          label: intl.get('mallf.cart.model.firstCatalog').d('一级目录'),
          ignore: 'always',
          defaultValue: dataSet.getState('firstCatalogLov'),
        },
        {
          name: 'firstCatalog',
          bind: 'firstCatalogLov.catalogId',
        },
        {
          name: 'catalogCode',
          bind: 'firstCatalogLov.catalogCode',
        },
        {
          name: 'catalogId',
          bind: 'firstCatalogLov.catalogId',
        },
        {
          name: 'secondAssetClass',
          type: 'string',
          lookupCode: 'EJZCFL',
          label: intl.get('mallf.cart.model.secondAssetClass').d('二级资产分类'),
          dynamicProps: {
            required: ({ record }) => {
              const catalogCode = record.get('catalogCode') || {};
              if (!isNil(catalogCode)) {
                return catalogCode === 'GDZC';
              } else return false;
            },
          },
          defaultValue: dataSet.getState('secondAssetClass'),
        },
      ],
      events: {
        update: ({ name, value, record }) => {
          if (name === 'firstCatalogLov' && !isNil(value)) {
            localStorage.setItem(name, value);
            dataSet.setState(name, value);
            dataSet.setState('firstCatalog', value?.catalogId);
            if (value.catalogCode === 'GDZC' && isNil(record.get('secondAssetClass'))) {
              return false;
            } else dataSet.queryCartData();
          } else if (name === 'firstCatalogLov' && isNil(value)) {
            localStorage.setItem(name, {});
            dataSet.setState('firstCatalog', null);
            dataSet.setState(name, {});
            dataSet.queryCartData();
          } else {
            localStorage.setItem(name, value);
            dataSet.setState(name, value);
            dataSet.queryCartData();
          }
        },
      },
    });
    return (
      <>
        <Lov
          dataSet={cuxDs}
          name="firstCatalogLov"
          clearButton
          placeholder={intl.get('mallf.cart.model.firstCatalog').d('一级目录')}
        />
        <Select
          dataSet={cuxDs}
          name="secondAssetClass"
          clearButton
          placeholder={intl.get('mallf.cart.model.secondAssetClass').d('二级资产分类')}
        />
      </>
    );
  }
}

export function setNextStepValidation(props) {
  if (isEmpty(props) || isNil(props)) {
    return Promise.resolve(false);
  }

  const { params } = props;

  return new Promise(async (resolve) => {
    const res = getResponse(
      await request(
        `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/Ich5Ea8SozHibnEH4lv3o8F5UhKibcY1nLKj5dpCSb8aA`,
        {
          method: 'POST',
          body: JSON.stringify(params),
        }
      )
    );
    if (res) {
      const { checkCode, checkMessage } = res || {};
      // checkCode 为 0：直接往下走
      if ([0, '0'].includes(checkCode)) {
        resolve(true); // 继续
        return;
      }
      // checkCode 为 1：强校验
      if ([1, '1'].includes(checkCode)) {
        resolve(false);
        return;
      }
      // checkCode 为 2：弱校验
      if ([2, '2'].includes(checkCode)) {
        Modal.open({
          key: Modal.key(),
          children: checkMessage,
          onOk: () => {
            resolve(true);
          },
          onCancel: () => {
            resolve(false);
          },
        });
      }
    }
  });
}

/* eslint-disable no-param-reassign */
import React from 'react';
import { message } from 'choerodon-ui';
import { Lov } from 'choerodon-ui/pro';

import { lovDefineAxiosConfig } from 'mall-front/lib/utils/c7nUIConfig.js';

export function getFields({ fields }) {
  const newFields = fields.map((field) => {
    if (field.name === 'costUnitLov') {
      return {
        ...field,
        type: 'object',
        ignore: 'always',
        idField: 'value',
        parentField: 'parentId',
        lovDefineAxiosConfig: (code) => {
          const lovConfig = lovDefineAxiosConfig(code);
          return {
            ...lovConfig,
            transformResponse: [
              ...lovConfig.transformResponse,
              (data) => {
                return {
                  ...data,
                  treeFlag: 'Y',
                  idField: 'value',
                  parentIdField: 'parentId',
                };
              },
            ],
          };
        },
      };
    } else if (field.name === 'budgetAccountNumLov') {
      return {
        ...field,
        type: 'object',
        ignore: 'always',
        idField: 'value',
        parentField: 'parentId',
        lovDefineAxiosConfig: (code) => {
          const lovConfig = lovDefineAxiosConfig(code);
          return {
            ...lovConfig,
            transformResponse: [
              ...lovConfig.transformResponse,
              (data) => {
                return {
                  ...data,
                  treeFlag: 'Y',
                  idField: 'value',
                  parentIdField: 'parentId',
                };
              },
            ],
          };
        },
      };
    } else if (field.name === 'purpose') {
      return {
        ...field,
        dynamicProps: {
          required: ({ record }) => {
            return record.get('useFlag') === 'Y';
          },
          disabled: ({ record }) => {
            return record.get('useFlag') !== 'Y';
          },
        },
      };
    } else {
      return field;
    }
  });
  newFields.push({
    name: 'useFlag',
    bind: 'budgetAccountNumLov.useFlag',
  });
  return newFields;
}

export function getNewBudget({ budgetList, newBudget, record }) {
  // 找出预算维度字段
  budgetList.forEach((n) => {
    const { fieldName } = n;
    newBudget[fieldName] = record.get(fieldName);
    newBudget[`${fieldName}Meaning`] = record.get(`${fieldName}Meaning`);
    if (fieldName === 'budgetAccountNum') {
      newBudget.useFlag = record.get('useFlag');
    }
  });
}

export function getBudgetColumns({ columns }) {
  return columns.map((column) => {
    if (column.name === 'costUnitLov' || column.name === 'budgetAccountNumLov') {
      return {
        ...column,
        editor: (r) => (
          <Lov
            onBeforeSelect={(record) => {
              if (record.get('hasChild') !== 'N') {
                message.error(
                  column.name === 'costUnitLov'
                    ? '仅能选择最后一级部门信息!'
                    : '仅能选择最后一级预算科目信息!',
                  undefined,
                  undefined,
                  'top'
                );
              }
              return record.get('hasChild') === 'N';
            }}
            onOption={({ record }) => {
              return {
                disabled: record.get('hasChild') !== 'N',
              };
            }}
            onChange={() => {
              if (column.name === 'budgetAccountNumLov') {
                r.set('purpose', '');
              }
            }}
          />
        ),
      };
    }
    return column;
  });
}

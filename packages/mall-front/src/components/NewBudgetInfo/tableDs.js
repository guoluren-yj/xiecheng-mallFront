import intl from 'utils/intl';
import { getPrecision, getToFixed, calcValidatePack } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import CuxFn from '@/cuxTools/cuxFn';
import { math } from 'choerodon-ui/dataset';
import { DEFAULT_MAX } from 'utils/constants';

export function renderColums(props) {
  const { budgetList, budgetData, disabled, pounchOut, batchFlag } = props;
  const {
    minPurchaseQuantity = 1,
    minPackageQuantity = 1,
    uomPrecision = 0,
    latestPrice = 1,
    customFlag,
  } = batchFlag ? {} : budgetData;
  const defaultValue = uomPrecision ? getPrecision(uomPrecision) : 1;
  const fields = [
    {
      label: intl.get(`mallf.common.view.orderSeq`).d('序号'),
      name: 'orderSeq',
    },
    {
      name: 'budget',
    },
    {
      name: 'budgetId',
    },
    {
      name: 'quantity',
      label: intl.get(`mallf.common.view.productNum.order`).d('数量'),
      type: 'number',
      step: customFlag ? 1 : defaultValue,
      min: minPurchaseQuantity || defaultValue,
      max: math.floor(DEFAULT_MAX / latestPrice),
      required: !batchFlag,
      validator: (val) => {
        if (
          val &&
          (calcValidatePack(uomPrecision, minPackageQuantity) || customFlag) &&
          val % (minPackageQuantity || 1) !== 0
        ) {
          return `${intl
            .get('mallf.common.view.errorMinPackageQuantity')
            .d('最小包装量为')}${minPackageQuantity}`;
        }
        if (!val && !batchFlag) {
          return intl.get('mallf.common.view.quantityNull').d('请输入数量');
        }
      },
      dynamicProps() {
        return {
          disabled: disabled || pounchOut,
        };
      },
    },
    {
      name: 'remainingBudget',
      label: intl.get('mallf.common.view.budget.balance').d('预算余额'),
    },
    {
      name: 'errorMessage',
      label: intl.get('mallf.common.view.prompt').d('提示'),
    },
    {
      name: 'action',
      label: intl.get('hzero.common.action').d('操作'),
    },
  ];
  budgetList.forEach((item) => {
    const {
      fieldName,
      budgetItemName,
      lovCode,
      tenantId,
      valueField,
      displayField,
      componentType,
      requiredFlag,
      queryParams = { tenantId },
    } = item;
    const lovOrSel = componentType === 'LOV' ? { lovCode } : { lookupCode: lovCode };
    const lovFieldBind =
      componentType === 'LOV'
        ? [
            {
              name: fieldName,
              bind: `${fieldName}Lov.${valueField}`,
            },
            {
              name: `${fieldName}Meaning`,
              bind: `${fieldName}Lov.${displayField}`,
            },
          ]
        : [];
    const lovFieldProps =
      componentType === 'LOV'
        ? {
            valueField,
            textField: displayField,
          }
        : {};
    fields.push(
      {
        name: componentType === 'LOV' ? `${fieldName}Lov` : fieldName,
        label: budgetItemName,
        ...lovFieldProps,
        required: !!requiredFlag,
        type: componentType === 'LOV' ? 'object' : 'string',
        ...lovOrSel,
        lovPara: queryParams,
        disabled,
        transformResponse: (_, record) => {
          if (componentType === 'LOV') {
            return record[fieldName]
              ? {
                  [displayField]: record[`${fieldName}Meaning`],
                  [valueField]: record[fieldName],
                }
              : null;
          } else {
            return record[fieldName];
          }
        },
      },
      ...lovFieldBind
    );
  });
  const getFields = CuxFn({
    name: 'NewBudgetInfo-fn-getFields',
    value: { fields, product: budgetData, batchFlag },
  })(() => fields);
  return getFields();
}

const tableDataset = (props) => ({
  primaryKey: 'orderSeq',
  autoQuery: false,
  paging: false,
  autoLocateFirst: false,
  selection: props.batchFlag || props.disabled ? false : 'multiple',
  fields: renderColums(props),
  transport: {
    destroy: ({ data }) => ({
      url: `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${props.organizationId}/budget-infos`,
      method: 'DELETE',
      data: [
        {
          ...props.budgetData,
          budgetInfoList: data,
        },
      ],
      transformResponse: (res) => {
        const response = JSON.parse(res);
        if (response) {
          props.handleFetchBudget();
          props.saveCallBack(response);
        }
      },
    }),
  },
  events: {
    update: ({ dataSet, record, name }) => {
      if (
        !['orderSeq', 'budget', 'quantity', 'remainingBudget', 'errorMessage', 'action'].includes(
          name
        )
      ) {
        let newBudget = {};
        const getNewBudget = () => {
          // 找出预算维度字段
          props.budgetList.forEach((n) => {
            const { fieldName } = n;
            newBudget = {
              ...newBudget,
              [fieldName]: record.get(fieldName),
              [`${fieldName}Meaning`]: record.get(`${fieldName}Meaning`),
            };
          });
        };
        CuxFn({
          name: 'NewBudgetInfo-fn-getNewBudget',
          value: { budgetList: props.budgetList, record, newBudget },
        })(getNewBudget)();
        if (JSON.stringify(newBudget) === record.get('budget')) return;
        record.set('budget', JSON.stringify(newBudget));
        const newBudgetData = !props.batchFlag
          ? [
              {
                ...props.budgetData,
                budgetInfoList: dataSet.toData(),
              },
            ]
          : props.budgetData.map((item) => ({ ...item, budgetInfoList: dataSet.toData() }));
        props.fetchBudgetRemain(newBudgetData, record);
      }
    },
  },
});

const childTableDataset = (budgetData) => {
  return {
    selection: false,
    paging: false,
    fields: [
      {
        name: 'productInfo',
        label: intl.get(`mallf.common.view.productInformation`).d('商品信息'),
      },
      {
        name: 'latestPrice',
        label: intl.get(`mallf.common.model.companyOrder.unitPrice`).d('单价'),
      },
      {
        name: 'quantity',
        label: intl.get(`mallf.common.model.companyOrder.count`).d('数量'),
        type: 'number',
        required: true,
        validator: (val, name, record) => {
          const { uomPrecision, minPackageQuantity, customFlag } = record.toData();
          if (
            val &&
            (calcValidatePack(uomPrecision, minPackageQuantity) || customFlag) &&
            val % (minPackageQuantity || 1) !== 0
          ) {
            return `${intl
              .get('mallf.common.view.errorMinPackageQuantity')
              .d('最小包装量为')}${minPackageQuantity}`;
          }
          if (!val) {
            return intl.get('mallf.common.view.quantityNull').d('请输入数量');
          }
        },
        dynamicProps({ record }) {
          const { uomPrecision, customFlag, minPurchaseQuantity, latestPrice } =
            budgetData[record?.index] || {};
          const defaultValue = uomPrecision ? getPrecision(uomPrecision) : 1;
          return {
            step: customFlag ? 1 : defaultValue,
            min: minPurchaseQuantity || defaultValue,
            max: math.floor(DEFAULT_MAX / latestPrice),
          };
        },
      },
      {
        name: 'totalPrice',
        label: intl.get(`mallf.common.view.all.money`).d('金额'),
      },
      {
        name: 'action',
        label: intl.get('hzero.common.action').d('操作'),
      },
    ],
    events: {
      update: ({ record, name, value, oldValue }) => {
        if (name === 'quantity') {
          const { uomPrecision, latestPrice } = budgetData[record?.index] || {};
          const newValue = value > math.floor(DEFAULT_MAX / latestPrice) ? oldValue : value;
          record.set('quantity', getToFixed(newValue, uomPrecision));
        }
      },
    },
  };
};

export { tableDataset, childTableDataset };

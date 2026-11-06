import intl from 'utils/intl';
import { getPrecision, getToFixed } from 'utils/utils';
import HmallConfig from 'utils/api-config';

export function renderColums(props) {
  const { budgetData, disabled, pounchOut, batchFlag, employeeNum } = props;
  const {
    minPurchaseQuantity = 1,
    minPackageQuantity = 1,
    uomPrecision = 0,
    latestPrice = 1,
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
      step: getPrecision(uomPrecision) || minPackageQuantity,
      min: minPurchaseQuantity || defaultValue,
      max: Math.floor(999999999 / latestPrice),
      required: !batchFlag,
      validator: (val) => {
        if (val && !uomPrecision && val % (minPackageQuantity || 1) !== 0) {
          return `${intl
            .get('mallf.common.view.errorMinPackageQuantity')
            .d('最小包装量为')}${minPackageQuantity}`;
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
    {
      label: intl.get('mallf.common.view.money.projectNum').d('费用项目编码'),
      name: 'projectLov',
      type: 'object',
      valueField: 'eiCode',
      textField: 'eiCode',
      lovCode: 'SCUX.RUIJIE.COST_ITEM',
      required: true,
      dynamicProps() {
        return {
          disabled,
        };
      },
    },
    {
      name: 'eiCode',
      bind: 'projectLov.eiCode',
    },
    {
      name: 'eiName',
      bind: 'projectLov.eiName',
      label: intl.get('mallf.common.view.money.projectName').d('费用项目名称'),
    },
    {
      label: intl.get('mallf.common.view.money.forNum').d('费用归属编码'),
      name: 'ccLov',
      type: 'object',
      valueField: 'ccCode',
      textField: 'ccCode',
      lovCode: 'SCUX.RUIJIE.COST_ATTRIBUTION',
      required: true,
      dynamicProps({ record }) {
        return {
          disabled: disabled || !record.get('eiCode'),
          lovPara: {
            eiCode: record.get('eiCode'),
            userId: employeeNum,
          },
        };
      },
    },
    {
      name: 'ccCode',
      bind: 'ccLov.ccCode',
    },
    {
      name: 'ccName',
      bind: 'ccLov.ccName',
      label: intl.get('mallf.common.view.money.forName').d('费用归属名称'),
    },
  ];
  return fields;
}

const tableDataset = (props) => ({
  primaryKey: 'orderSeq',
  autoQuery: false,
  paging: !props.batchFlag,
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
      if (name === 'projectLov') {
        record.set('ccLov', null);
      }
      if (name === 'ccLov' || name === 'projectLov') {
        const newBudget = {
          eiCode: record.get(`eiCode`),
          eiName: record.get(`eiName`),
          ccCode: record.get(`ccCode`),
          ccName: record.get(`ccName`),
        };
        // 找出预算维度字段
        // [{fieldName: }, {}].forEach((n) => {
        //   const { fieldName } = n;
        //   newBudget = {
        //     ...newBudget,
        //     [fieldName]: record.get(fieldName),
        //     [`${fieldName}Meaning`]: record.get(`${fieldName}Meaning`),
        //   };
        // });
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
        label: intl.get(`mallf.myMall.model.companyOrder.unitPrice`).d('单价'),
      },
      {
        name: 'quantity',
        label: intl.get(`mallf.common.view.productNum.order`).d('数量'),
        type: 'number',
        required: true,
        validator: (val, name, record) => {
          const { uomPrecision, minPackageQuantity } = record.toData();
          if (val && !uomPrecision && val % (minPackageQuantity || 1) !== 0) {
            return `${intl
              .get('mallf.common.view.errorMinPackageQuantity')
              .d('最小包装量为')}${minPackageQuantity}`;
          }
        },
        dynamicProps({ record }) {
          const { uomPrecision, minPackageQuantity, minPurchaseQuantity, latestPrice } =
            budgetData[record?.index] || {};
          const defaultValue = uomPrecision ? getPrecision(uomPrecision) : 1;
          return {
            step: getPrecision(uomPrecision) || minPackageQuantity,
            min: minPurchaseQuantity || defaultValue,
            max: Math.floor(999999999 / latestPrice),
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
          const newValue = value > Math.floor(999999999 / latestPrice) ? oldValue : value;
          record.set('quantity', getToFixed(newValue, uomPrecision));
        }
      },
    },
  };
};

export { tableDataset, childTableDataset };

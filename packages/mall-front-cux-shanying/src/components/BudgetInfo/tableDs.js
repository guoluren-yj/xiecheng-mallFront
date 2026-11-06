import intl from 'utils/intl';
import { getPrecision, getToFixed } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import { isEmpty } from 'lodash';

export function renderColums(props) {
  const { budgetData, disabled, pounchOut, batchFlag, labels = {} } = props;
  const { productLabelDTOList = [] } = labels;
  const {
    minPurchaseQuantity = 1,
    minPackageQuantity = 1,
    uomPrecision = 0,
    latestPrice = 1,
    attributeVarchar1, // 固定资产标准
    attributeVarchar2, // 费用类型必输
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
    // cdp-109323
    {
      label: intl.get('mallf.common.view.money.subjectsCode').d('财务科目'),
      name: 'subject',
      type: 'object',
      valueField: 'subjectsCode',
      textField: 'subjectsCodeName',
      lovCode: 'SCUX.SHANYING.FINANCIAL_SUBJECT',
      dynamicProps() {
        return {
          disabled,
        };
      },
      transformResponse: (_, record) => {
        const { subjectsCode, subjectsCodeName } = record;
        return {
          subjectsCode,
          subjectsCodeName,
        };
      },
    },
    {
      name: 'subjectsCode',
      bind: 'subject.subjectsCode',
    },
    {
      name: 'subjectsCodeName',
      bind: 'subject.subjectsCodeName',
    },
    {
      label: intl.get('mallf.common.model.userDept').d('使用部门'),
      name: 'costCenter',
      type: 'object',
      valueField: 'costCode',
      textField: 'costName',
      lovCode: 'SCUX.SHANYING.COST_CENTER',
      required: true,
      dynamicProps() {
        return {
          disabled,
        };
      },
    },
    {
      name: 'costCode',
      bind: 'costCenter.costCode',
    },
    {
      name: 'costName',
      bind: 'costCenter.costName',
    },
    {
      name: 'sapNum',
      label: intl.get('mallf.common.view.budget.sapNum').d('内部订单号'),
    },
    {
      // label: intl.get('mallf.common.view.costType').d('费用类型'),
      label: intl.get('mallf.common.view.budget.dfsBusinessType').d('DFS业务类型'),
      name: 'expensesSubjectLov',
      type: 'object',
      valueField: 'value',
      textField: 'meaning',
      // required: false,
      lovCode: 'SYSCFYLX',
      dynamicProps() {
        const flag = productLabelDTOList?.some(item => item?.labelCode === 'ZC_NOT_AN_ASSET');
        return {
          disabled: flag ? false : disabled,
          // required: attributeVarchar2 === '1', // 不再用旧逻辑
          // 标签为【不是资产】时费用类型必输
          required: Boolean(flag),
        };
      },
    },
    {
      name: 'expensesSubject',
      bind: 'expensesSubjectLov.value',
    },
    {
      name: 'expensesSubjectName',
      bind: 'expensesSubjectLov.meaning',
    },
    {
      name: 'subCateCodevalidat',
    },
    {
      name: 'subjectsCategoryCodeObj',
      lovCode: 'SYSCZCFL',
      type: 'object',
      // label: intl.get('mallf.common.view.budget.assetClassfication').d('资产分类'),
      label: intl.get('mallf.common.view.budget.erp.assetClassfication').d('ERP资产分类'),
      // 旧逻辑弃用
      // computedProps: {
      //   required: ({ record }) => attributeVarchar1 === '1' && isEmpty(record.get('sapNum')),
      // },
      dynamicProps() {
        const flag = productLabelDTOList?.some(item =>
          ['ZC_FIXED_ASSETS', 'ZC_INTANGIBLE_ASSETS'].includes(item?.labelCode)
        );
        return {
          // 当商品标签为固定资产或无形资产时，资产分类字段，设置为必输项
          required: Boolean(flag),
        };
      },
      // validator: (val, name, record) => {
      //   if (record.get('subCateCodevalidat')) {
      //     return intl.get('mallf.common.view.assetClassficationVilidate').d('资产分类不能重复');
      //   }
      // },
    },
    {
      name: 'subjectsCategoryCode',
      bind: 'subjectsCategoryCodeObj.value',
    },
    {
      name: 'subjectsCategoryName',
      bind: 'subjectsCategoryCodeObj.meaning',
    },
    {
      name: 'manageUnitCodeObj',
      label: intl.get('mallf.common.model.mangeUnit').d('管理部门'),
      type: 'object',
      valueField: 'costCode',
      textField: 'costName',
      lovCode: 'SCUX.SHANYING.COST_CENTER',
      computedProps: {
        required: ({ record }) => record?.get('subjectsCategoryCode'),
      },
    },
    {
      name: 'manageUnitCode',
      bind: 'manageUnitCodeObj.costCode',
    },
    {
      name: 'manageUnitName',
      bind: 'manageUnitCodeObj.costName',
    },
    {
      name: 'quantity',
      label: intl.get(`mallf.myMall.model.companyOrder.count`).d('数量'),
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
        if (!val && !batchFlag) {
          return intl.get('mallf.common.view.quantityNull').d('请输入数量');
        }
      },
      dynamicProps() {
        return {
          disabled: disabled || pounchOut || attributeVarchar1 === '1',
        };
      },
    },
    {
      name: 'remainingBudget',
      label: intl.get('mallf.common.view.budget.balance').d('预算余额'),
    },
    {
      name: 'fixAssetCode',
      label: intl.get('mallf.common.view.budget.fixAssetCode').d('固定资产编码'),
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
  return fields;
}

const tableDataset = (props) => ({
  primaryKey: 'orderSeq',
  autoQuery: false,
  paging: false,
  autoLocateFirst: false,
  dataToJSON: 'all',
  forceValidate: true,
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
    update: ({ dataSet, record, name, value }) => {
      if (name === 'subjectsCategoryCode') {
        dataSet.forEach((r, index) => {
          if (record.index !== index) {
            record.set('subCateCodevalidat', r.get('subjectsCategoryCode') === value);
            r.set('subCateCodevalidat', r.get('subjectsCategoryCode') === value);
          }
        });
        dataSet.validate();
      }
      if (['subject', 'costCenter', 'expensesSubjectLov', 'sapNum', 'manageUnitCodeObj', 'subjectsCategoryCodeObj', 'fixAssetCode'].includes(name)) {
        const {
          subjectsCode,
          subjectsCodeName,
          costCode,
          costName,
          sapNum,
          expensesSubject,
          expensesSubjectName,
          subjectsCategoryCode,
          subjectsCategoryName,
          manageUnitCode,
          manageUnitName,
          fixAssetCode,
        } = record.toData();
        const newBudget = {
          subjectsCode,
          subjectsCodeName,
          costCode,
          costName,
          sapNum,
          expensesSubject,
          expensesSubjectName,
          manageUnitCode,
          manageUnitName,
          subjectsCategoryName,
          subjectsCategoryCode,
          fixAssetCode,
        };
        if (JSON.stringify(newBudget) === record.get('budget')) return;
        record.set('budget', JSON.stringify(newBudget));
        record.set('errorMessage', null);
        const newBudgetData = [
          {
            ...props.budgetData,
            budgetInfoList: dataSet.toData(),
          },
        ];
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
        label: intl.get(`mallf.myMall.model.companyOrder.count`).d('数量'),
        type: 'number',
        required: true,
        validator: (val, name, record) => {
          const { uomPrecision, minPackageQuantity } = record.toData();
          if (val && !uomPrecision && val % (minPackageQuantity || 1) !== 0) {
            return `${intl
              .get('mallf.common.view.errorMinPackageQuantity')
              .d('最小包装量为')}${minPackageQuantity}`;
          }
          if (!val) {
            return intl.get('mallf.common.view.quantityNull').d('请输入数量');
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

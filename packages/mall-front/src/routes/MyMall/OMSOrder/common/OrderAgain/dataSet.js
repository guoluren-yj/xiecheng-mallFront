import { isEmpty, isNil } from 'lodash';
import { getPrecision, getProductLimit } from 'utils/utils';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import moment from 'moment';
import { math } from 'choerodon-ui/dataset';
import CuxFn from '@/cuxTools/cuxFn';

function isGift(skuType) {
  return ['ATTACHMENT', 'GIFT'].includes(skuType);
}

const formDataSet = (props) => {
  const { userId } = props;
  return {
    autoQuery: false,
    fields: [
      {
        name: 'deliveryAddressLov',
        required: true,
        label: intl.get(`mallf.common.view.receiveAddress`).d('收货地址'),
        type: 'object',
        lovCode: 'SMCT.ADDRESS',
        textField: 'fullAddress',
        valueField: 'addressId',
        computedProps: {
          lovPara: ({ record }) => {
            const companyId = record.get('purchaseCompanyId');
            return CuxFn({
              name: 'OrderAgain-fn-formDs-addressLovPara',
              value: { companyId, userId },
            })(() => ({ companyId, userId }))();
          },
        },
      },
      {
        name: 'updateFlag',
      },
      {
        name: 'addressId',
        bind: 'deliveryAddressLov.addressId',
      },
      {
        name: 'contactName',
        label: intl.get('mallf.myOrder.view.order.receiver').d('收货人'),
        bind: 'deliveryAddressLov.contactName',
      },
      {
        name: 'fullPhone',
        label: intl.get(`mallf.common.view.contactInformation`).d('联系方式'),
        bind: 'deliveryAddressLov.mobile',
      },
      {
        name: 'remark',
        label: intl.get(`mallf.common.model.remark`).d('备注'),
      },
      {
        name: 'attachmentUuid',
        label: intl.get('mallf.common.view.innerAttachment').d('内部附件'),
        type: 'attachment',
        bucketName: 'private-bucket',
        bucketDirectory: 'mall-front',
      },
      {
        name: 'outerAttachmentUuid',
        label: intl.get('mallf.common.view.outterAttachment').d('外部附件'),
        type: 'attachment',
        bucketName: 'private-bucket',
        bucketDirectory: 'mall-front',
      },
    ],
  };
};

// 数量校验type
const getQuantityValid = ({ record, value, totalQuantity: newTotalQuantity }) => {
  const {
    cecFromCode,
    uomPrecision,
    totalQuantity,
    originalQuantity,
    minPackageQuantity,
    minPurchaseQuantity,
    ladderPriceList,
  } = record.get([
    'cecFromCode',
    'uomPrecision',
    'totalQuantity',
    'originalQuantity',
    'minPackageQuantity',
    'minPurchaseQuantity',
    'ladderPriceList',
  ]);
  const total = [newTotalQuantity, totalQuantity, value].find((f) => !isNil(f));
  const [minLimit] = getProductLimit({
    sourceFrom: cecFromCode,
    minPurchaseQuantity,
    maxPurchaseQuantity: originalQuantity,
    ladderPriceLimit: ladderPriceList,
  });
  const defaultValue = uomPrecision ? getPrecision(uomPrecision) : 1;
  // 是否满足包装量校验
  const packgeValid =
    isNil(total) ||
    (uomPrecision && !Number.isInteger(minPackageQuantity)) ||
    (minPackageQuantity || 1) === 1 ||
    math.eq(math.mod(total, minPackageQuantity || 1), 0); // 包装量为1则不校验
  // 是否满足最小起订量
  const minValid = isNil(total) || math.gte(total, minLimit || defaultValue);
  return { packgeValid, minValid, minPackageQuantity, minQuantity: minLimit || defaultValue };
};

const tableDataset = (readOnly) => {
  return {
    paging: false,
    forceValidate: true,
    selection: readOnly ? false : 'multiple',
    record: {
      dynamicProps: {
        selectable: (record) => !isGift(record.get('skuType')),
      },
    },
    fields: [
      {
        name: 'orderEntryId',
      },
      {
        name: 'productInfo',
        label: intl.get(`mallf.common.view.productInformation`).d('商品信息'),
      },
      {
        name: 'neededDate',
        type: 'date',
        required: true,
        format: DEFAULT_DATE_FORMAT,
        label: intl.get(`mallf.common.view.need.date`).d('需求日期'),
        dynamicProps: {
          min: ({ record }) =>
            isGift(record.get('skuType')) ? null : moment(new Date()).format(DEFAULT_DATE_FORMAT),
        },
      },
      {
        name: 'unitPrice',
        label: intl.get(`mallf.common.model.unitPrice`).d('单价(含税)'),
      },
      {
        name: 'totalQuantity',
      },
      {
        name: 'originalQuantity',
        transformResponse: (val, obj) =>
          isEmpty(obj.customizedProductValueList) ? val : obj.packageQuantity,
      },
      {
        name: '_quantity',
        label: intl.get(`mallf.common.model.companyOrder.count`).d('数量'),
        type: 'bigNumber',
        required: true,
        transformResponse: (val, obj) =>
          isEmpty(obj.customizedProductValueList) ? obj.quantity : obj.packageQuantity,
        validator: (value, name, record) => {
          const { packgeValid, minPackageQuantity, minValid, minQuantity } = getQuantityValid({
            record,
            value,
          });
          if (!packgeValid) {
            return `${intl
              .get('mallf.common.view.errorMinPackageQuantity')
              .d('最小包装量为')}${minPackageQuantity}`;
          }
          if (!minValid) {
            return intl
              .get(`mallf.common.model.minPurchaseNumber`, {
                value: minQuantity,
              })
              .d(`最小购买量为${minQuantity}`);
          }
          if (!value) {
            return intl.get('mallf.common.view.quantityNull').d('请输入数量');
          }
          // return undefined;
        },
        dynamicProps: {
          nonStrictStep: ({ record }) => isGift(record.get('skuType')),
          max: ({ record }) => record.get('originalQuantity'),
          step: ({ dataSet, record }) => {
            const uomPrecision = record.get('uomPrecision');
            return uomPrecision
              ? getPrecision(uomPrecision)
              : dataSet.length > 1 // 多行包装量不生效
              ? 1
              : record.get('minPackageQuantity') || 1;
          },
        },
      },
      {
        name: 'entryAmount',
        label: intl.get('mallf.common.view.line.amount.price').d('行金额(含税)'),
      },
      {
        name: 'action',
        label: intl.get('hzero.common.action').d('操作'),
      },
    ],
    events: {
      update({ name, dataSet, record: r, value, oldValue }) {
        if (name === '_quantity') {
          const { skuId, originalQuantity, customizedProductValueList } = r.get([
            'skuId',
            'originalQuantity',
            'customizedProductValueList',
          ]);

          const totalQuantity = dataSet.reduce(
            (pre, cur) => (cur.get('skuId') === skuId ? math.plus(pre, cur.get('_quantity')) : pre),
            0
          );

          // 边界
          if (math.lte(value || 0, 0) || math.gt(value, originalQuantity)) {
            r.set(name, oldValue);
            return;
          }

          // 普通商品
          if (isEmpty(customizedProductValueList)) {
            r.set({ quantity: value, packageQuantity: value });
          } else {
            r.set('packageQuantity', value);
          }

          const { packgeValid, minValid } = getQuantityValid({ record: r, totalQuantity, value });

          dataSet.forEach((record) => {
            if (record.get('skuId') === skuId) {
              record.set('totalQuantity', totalQuantity);
              if (!minValid || !packgeValid) {
                Object.keys(record.data).forEach((key) => {
                  record.init(key, record.get(key));
                });
                record.reset();
              }
            }
          });
        }
      },
    },
  };
};

export { formDataSet, tableDataset, isGift };

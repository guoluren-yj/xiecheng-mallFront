import React from 'react';
import { Modal, Table, DataSet, Tooltip, Message } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Button as PermissionButton } from 'hzero-front/lib/components/Permission';
import ProductAllocation from 'mall-front/lib/routes/CartProCopy/ProductAllocationButton';
import useDimensTemplates from 'mall-front/lib/hooks/useDimensTemplates';
import { reqOpenCartSubmitService } from 'mall-front/lib/services/newCartService';
import { TagRender } from 'utils/renderer';
import DocFlow from 'components/DocFlow';
import { requestDocFlow } from 'components/Permission/permissionCode';
import { PermissionWrapper } from 'components/Permission';
import { fetchRequestBudgetApi, fetchOrderRequestBudgetApi, fetchAddCart } from '../services/index';
import ApproveRecordRender from '../components/ApproveRecordRender';

async function beforeHandleSubmit(props = {}) {
  const { openOrderInfo = {}, formDs, setLoading, history } = props;
  const flag = await formDs.validate();
  if (!flag) return;
  const { orderLineList = [] } = openOrderInfo;
  const formData = formDs.current.toData();
  const params = {
    ...openOrderInfo,
    orderLineList: orderLineList?.map((m) => ({
      ...m,
      address: {
        ...m.address,
        receiveChannel: 1, // 收货渠道 先默认mobile 可选项 2 email 1 mobile 邮箱 手机
      },
      lineValueList: null,
      headerValueList: null,
    })),
    ...formData,
  };
  delete params.cartColumnDTOS;
  delete params.cartDTOList;

  function handleSubmit(newParams) {
    setLoading(true);
    reqOpenCartSubmitService(newParams)
      .then((res) => {
        if (res) {
          history.push('/req-open-cart/result');
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }
  setLoading(true);
  fetchRequestBudgetApi(params)
    .then((res) => {
      setLoading(false);
      if (res) {
        if (res.orderLineList?.some((n) => n.cuxBudgetWarningFlag === 1)) {
          const ds = new DataSet({
            data: (res.orderLineList?.filter((n) => n.cuxBudgetWarningFlag === 1) || []).map(
              (n) => ({
                ...n,
                cuxBudgetWarningMsg: '预算已被占用金额超出预算总额，请确认是否继续提交',
              })
            ),
            selection: false,
            paging: false,
            fields: [
              {
                name: 'productName',
                label: intl.get('mallf.myMall.model.search.commodityNames').d('商品名称'),
              },
              {
                name: 'cuxBudgetWarningMsg',
                label: intl.get('mallf.common.view.warningMsg').d('提示'),
              },
            ],
          });
          const columns = [
            {
              name: 'productName',
              width: 200,
            },
            {
              width: 200,
              name: 'cuxBudgetWarningMsg',
            },
          ];
          Modal.open({
            title: intl.get('mallf.companyOrder.view.title.budgetWarning').d('预算校验提示'),
            destroyOnClose: true,
            mask: true,
            closable: true,
            style: { width: 560 },
            children: (
              <>
                <div style={{ marginBottom: 10, marginTop: -5 }}>
                  {intl
                    .get('mallf.companyOrder.view.title.budgetConfirm')
                    .d('以下商品预算超量或超预警线，请确认是否继续提交')}
                </div>
                <Table dataSet={ds} columns={columns} style={{ maxHeight: 210 }} />
              </>
            ),
            onOk: () => {
              handleSubmit(res);
            },
          });
        } else {
          handleSubmit(res);
        }
      }
    })
    .catch(() => {
      setLoading(false);
    });
}

async function resubmitValidate(props = {}) {
  const { params, resubmitFunc } = props;
  await fetchOrderRequestBudgetApi(params).then((res) => {
    if (res) {
      if (res.attributeVarchar6 === 1) {
        const ds = new DataSet({
          data: res.mallRequestEntryViewVOList
            ?.filter((n) => n.cancelStatus !== 'CANCELED')
            ?.map((n) => ({
              ...n,
              cuxBudgetWarningMsg: '预算已被占用金额超出预算总额，请确认是否继续提交',
            })),
          selection: false,
          paging: false,
          fields: [
            {
              name: 'skuName',
              label: intl.get('mallf.myMall.model.search.commodityNames').d('商品名称'),
            },
            {
              name: 'cuxBudgetWarningMsg',
              label: intl.get('mallf.common.view.warningMsg').d('提示'),
            },
          ],
        });
        const columns = [
          {
            name: 'skuName',
            width: 200,
          },
          {
            width: 200,
            name: 'cuxBudgetWarningMsg',
          },
        ];
        Modal.open({
          title: intl.get('mallf.companyOrder.view.title.budgetWarning').d('预算校验提示'),
          destroyOnClose: true,
          mask: true,
          closable: true,
          style: { width: 560 },
          children: (
            <>
              <div style={{ marginBottom: 10, marginTop: -5 }}>
                {intl
                  .get('mallf.companyOrder.view.title.budgetConfirm')
                  .d('以下商品预算超量或超预警线，请确认是否继续提交')}
              </div>
              <Table dataSet={ds} columns={columns} style={{ maxHeight: 210 }} />
            </>
          ),
          onOk: async () => {
            await resubmitFunc(res);
          },
        });
      } else {
        resubmitFunc(res);
      }
    }
  });
}

function renderManualButton(props = {}) {
  const { isShowMiniCart } = props;
  const [dimensTemplates, dimensLoading] = useDimensTemplates({ needLoadFlag: true });
  const { manualDimensionTemplate = {}, manualDimensionList = [] } = dimensTemplates || {};
  return (
    <ProductAllocation
      r-if={isShowMiniCart && !dimensLoading}
      noFetchFlag
      defaultFlag
      product={{ manualFlag: 1 }}
      title={intl.get('mallf.common.view.openCartApplication').d('搜不到想买的?')}
      dimensionTemplates={{
        dimensionTemplate: manualDimensionTemplate,
        dimensionList: manualDimensionList,
      }}
      callBack={() => {}}
      // callBack={() => dataSet.queryCartData()} // 保存成功后的回调
    >
      <Tooltip
        title={intl
          .get('mallf.common.view.zyt.openCartApplication.tooltip')
          .d('创建一个自定义的新需求，让采购同事帮你去买')}
      >
        <PermissionButton style={{ marginLeft: '10px', height: '40px' }}>
          {intl.get('mallf.common.view.zyt.openCartApplication').d('搜不到想买的?')}
        </PermissionButton>
      </Tooltip>
    </ProductAllocation>
  );
}

function renderDocFlow(props = {}) {
  const { requestEntryId } = props;
  return (
    <PermissionWrapper permissionList={[requestDocFlow]}>
      <div style={{ display: 'flex', marginTop: '4px' }}>
        <div className="header-request-status">
          {TagRender({
            text: intl.get('mallf.myRequest.view.button.zyt.docFlow.progress').d('单据进度'),
            type: 'warning',
            style: { maxWidth: '160px', marginRight: 0 },
          })}
        </div>
        <DocFlow
          tableName="s2ful_mall_request_entry"
          tablePk={requestEntryId}
          style={{
            color: 'red',
          }}
          buttonType="aTag"
          buttonText={intl.get('mallf.myRequest.view.zyt.link.view').d('查看')}
        />
      </div>
    </PermissionWrapper>
  );
}

function handleApprovalRecord(props = {}) {
  const { data, item } = props;
  return <ApproveRecordRender data={data} item={item} />;
}

function handleApproveTag() {
  return TagRender({
    text: `${intl.get('mallf.myRequest.view.order.approvHistory').d('审批记录')}：`,
    type: 'warning',
    style: { maxWidth: '160px', marginRight: 0 },
  });
}

async function beforeBackCart(props = {}) {
  const { cartList } = props;
  const res = await fetchAddCart(cartList);
  if (res?.failed) {
    Message.error(res?.message);
    return false;
  }
  return true;
}

export {
  beforeHandleSubmit,
  resubmitValidate,
  renderManualButton,
  renderDocFlow,
  handleApprovalRecord,
  handleApproveTag,
  beforeBackCart,
};

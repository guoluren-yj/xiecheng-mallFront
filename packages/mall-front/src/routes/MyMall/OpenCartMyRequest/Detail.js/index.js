import React, { useEffect, useMemo } from 'react';
import { Steps } from 'choerodon-ui';
import {
  DataSet,
  Form,
  Table,
  Output,
  Attachment,
  Spin,
  Button,
  Select,
  TextField,
  TextArea,
  Lov,
  message,
  Modal,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import c7nCustomize from 'srm-front-scuz/lib/c7nCustomize';
import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import {
  OPENCART_APPLY_DETAIL_HEADER,
  OPENCART_APPLY_DETAIL_LINE,
  OPENCART_APPLY_EDIT_HEADER,
  OPENCART_APPLY_EDIT_LINE,
} from 'utils/customizeCode';
import {
  fetchDetailHeaderService,
  resaveRequest,
  resubmitRequest,
  deleteRequestLine,
  fetchRequestBudgetApi,
} from 'services/openCartMyRequestService';
import { TagRender } from 'utils/renderer';
import { accept } from 'utils/constants';
import swal from 'components/swal';
import { openComfirmModal } from 'utils/modals';
// eslint-disable-next-line import/no-cycle
import { status } from '../RequestList/ListHeader';
import { formDataSet, tableDataSet } from './dataSet';
import ViewCompareList from './ViewCompareList';
import style from './index.less';
import CuxFn from '@/cuxTools/cuxFn';

const DeleteBtn = observer(({ onClick, dataSet }) => {
  return (
    <Button
      color="primary"
      funcType="flat"
      icon="delete_black-o"
      disabled={dataSet.selected.length < 1}
      onClick={onClick}
      style={{ float: 'right', fontSize: '12px', marginTop: -5 }}
    >
      {intl.get('hzero.common.button.delete').d('删除')}
    </Button>
  );
});

const ReqSteps = observer(({ dataSet }) => {
  const requestStatus = dataSet.current?.get('requestStatus');
  let currentStep;
  let stepStatus;
  switch (requestStatus) {
    case 'ACCEPTING': // 受理中
    case 'SUBMITTING': // 提交中
      currentStep = 1;
      break;
    case 'SUBMITTED': // 已提交
    case 'APPROVED': // 已审批
    case 'CONVERSION_PROCESSING': // 执行中
      currentStep = 2;
      break;
    case 'CONVERSION_COMPLETED': // 已完成
      currentStep = 3;
      break;
    case 'REJECTED': // 审批拒绝
    case 'WITHDRAWN': // 已撤回
    case 'RETURNED': // 已退回
      currentStep = 0;
      stepStatus = 'error';
      break;
    default:
      // 新建/取消中/已取消 全部置灰
      currentStep = -1;
      break;
  }
  return (
    <Steps size="small" current={currentStep} status={stepStatus} className="request-steps">
      <Steps.Step title={intl.get('mallf.myRequest.view.step.accept').d('受理中')} />
      <Steps.Step title={intl.get('mallf.myRequest.view.step.submitted').d('已提交')} />
      <Steps.Step title={intl.get('mallf.myRequest.view.step.completed').d('已完成')} />
    </Steps>
  );
});

function Detail({
  item,
  readOnly,
  customizeForm,
  customizeTable,
  modal,
  updateSuccessCallback = (e) => e,
}) {
  const {
    custWebConfig: { purchasFileSize = 100 },
  } = getUserConfigInfo();

  // 申请附件提示
  const fileHelp = intl
    .get('mallf.common.view.attProps.help', {
      accept,
      maxSize: `${purchasFileSize}M`,
    })
    .d(`支持${accept}格式，且不能大于${`${purchasFileSize}M`}`);

  const { requestId } = item;

  // 作为参数的个性化单元编码，区分详情和编辑
  const customizeUnitCode = readOnly
    ? `${OPENCART_APPLY_DETAIL_HEADER},${OPENCART_APPLY_DETAIL_LINE}`
    : `${OPENCART_APPLY_EDIT_HEADER},${OPENCART_APPLY_EDIT_LINE}`;

  const formDs = useMemo(() => {
    return new DataSet(formDataSet(readOnly));
  }, []);

  const tableDs = useMemo(() => {
    return new DataSet(tableDataSet({ requestId, readOnly, customizeUnitCode }));
  }, []);

  useEffect(() => {
    if (!readOnly) {
      modal.update({
        footer: (ok, cancel) => [
          <Button color="primary" onClick={() => beforeHandleResubmit()}>
            {intl.get('mallf.common.button.resubmit').d('重新提交')}
          </Button>,
          <Button onClick={() => handleSaveClose()}>
            {intl.get('mallf.common.button.saveAndClose').d('保存并关闭')}
          </Button>,
          cancel,
        ],
      });
    }
    initDetailData();
  }, []);

  // 数据初始化
  function initDetailData() {
    formDs.status = 'loading';
    tableDs.status = 'loading';

    fetchDetailHeaderService({ requestId, customizeUnitCode })
      .then((res) => {
        if (res) {
          formDs.loadData([res]);
        }
      })
      .finally(() => {
        formDs.status = 'ready';
      });
  }

  // 数据校验，获取参数
  async function validateGetParams() {
    const headFlag = await formDs.validate();
    const lineFlag = await tableDs.validate();
    if (headFlag && lineFlag) {
      return {
        ...(formDs.current?.toJSONData() || {}),
        mallRequestEntryViewDTOList: tableDs.toJSONData(),
      };
    }
    return null;
  }

  async function beforeHandleResubmit() {
    const params = await validateGetParams();
    if (!params) {
      return;
    }
    await handleBudgetValidate(params);
  }

  // 重新提交前校验预算
  async function handleBudgetValidate(params) {
    const budgetRes = await fetchRequestBudgetApi(params);
    if (!budgetRes) {
      return false;
    }
    const isFailedList = budgetRes?.filter((b) => b.failed === '1');
    const isWarningList = budgetRes?.filter((b) => b.warnFlag === '1');

    if (isFailedList.length > 0 || isWarningList.length > 0) {
      const isWarningFlag = isFailedList.length === 0;
      const ds = new DataSet({
        data: formDs?.current
          ?.get('mallRequestEntryViewVOList')
          ?.filter((r) =>
            (isWarningFlag ? isWarningList : isFailedList).some(
              (i) => i?.documentNum === r?.requestCodeLine
            )
          )
          .map((r) => ({
            lineNum: r.lineNum,
            errorMessage: (isWarningFlag ? isWarningList : isFailedList).find(
              (i) => i?.documentNum === r?.requestCodeLine
            )?.errorMessage,
          })),
        selection: false,
        paging: false,
        fields: [
          {
            name: 'lineNum',
            label: intl.get(`mallf.common.view.lineSeq`).d('行号'),
          },
          {
            name: 'errorMessage',
            label: intl.get('mallf.common.view.warningMsg').d('提示'),
          },
        ],
      });
      const columns = [
        {
          name: 'lineNum',
          width: 80,
        },
        {
          name: 'errorMessage',
        },
      ];
      Modal.open({
        title: intl.get('mallf.companyOrder.view.title.budgetWarning').d('预算校验提示'),
        destroyOnClose: true,
        mask: true,
        closable: true,
        style: { width: 560 },
        cancelButton: isWarningFlag,
        children: (
          <>
            <div style={{ marginBottom: 10, marginTop: -5 }}>
              {isWarningFlag
                ? intl
                    .get('mallf.companyOrder.view.title.budgetConfirm')
                    .d('以下商品预算超量或超预警线，请确认是否继续提交')
                : intl
                    .get('mallf.companyOrder.view.title.budgetFailedInfo')
                    .d('以下商品预算校验失败，请检查预算编制信息')}
            </div>
            <Table dataSet={ds} columns={columns} style={{ maxHeight: 210 }} />
          </>
        ),
        onOk: async () => {
          if (isWarningFlag) {
            await handleResubmit();
          }
          return true;
        },
      });
    } else {
      await handleResubmit();
    }
  }

  // 重新提交
  async function handleResubmit() {
    openComfirmModal({
      title: intl.get('mallf.myRequest.view.confirmSubmit').d('确认提交'),
      children: (
        <div style={{ fontSize: '14px' }}>
          {intl.get('mallf.myRequest.view.resubmitMessage').d('您确定重新提交整张申请吗？')}
        </div>
      ),
      onOk: async () => {
        const params = await validateGetParams();
        if (params) {
          try {
            const resubmitFunc = async (newParams) => {
              const res = await resubmitRequest(newParams, customizeUnitCode);
              if (res) {
                modal.close();
                message.success(intl.get('mallf.common.view.submit.success').d('提交成功'));
                updateSuccessCallback();
              }
            };
            await CuxFn({
              name: 'OpenCartMyRequest-fn-resubmitFunc',
              value: { params, resubmitFunc },
            })(async () => {
              await resubmitFunc(params);
            })();
          } catch {
            // do nothing
          }
        }
      },
    });
  }

  // 保存并关闭
  async function handleSaveClose() {
    const params = await validateGetParams();
    if (params) {
      try {
        const res = await resaveRequest(params, customizeUnitCode);
        if (res) {
          modal.close();
          message.success(intl.get('mallf.common.view.set.success').d('操作成功'));
          updateSuccessCallback();
        }
      } catch {
        // do nothing
      }
    }
  }

  // 行删除
  async function handleDeleteLine() {
    const isDeleteAll = tableDs.totalCount === tableDs.selected.length;
    if (isDeleteAll) {
      swal(
        intl
          .get('mallf.myRequest.view.deleteAllLineMessage')
          .d('不支持删除全部申请行，请重新确认。')
      );
    } else {
      openComfirmModal({
        title: intl.get('mallf.common.view.confirmDeleteTitle').d('确认删除'),
        children: (
          <div style={{ fontSize: '14px' }}>
            {intl
              .get('mallf.myRequest.view.deleteLineMessage')
              .d('删除后不可恢复，您确定删除选中申请行吗？')}
          </div>
        ),
        onOk: async () => {
          const params = {
            ...(formDs.current?.toJSONData() || {}),
            mallRequestEntryViewDTOList: tableDs.selected.map((m) => m.toData()),
          };
          try {
            const res = await deleteRequestLine(params);
            if (res) {
              initDetailData();
              tableDs.remove(tableDs.selected, true);
              tableDs.query();
              message.success(intl.get('mallf.common.view.set.success').d('操作成功'));
              updateSuccessCallback();
            }
          } catch {
            // do nothing
          }
        },
      });
    }
  }

  // 行可编辑判断
  const lineIsEdit = (record) =>
    !readOnly && ['RETURNED', 'REJECTED', 'NEW'].includes(record.get('lineStatus'));

  // 表格列
  const columns = [
    {
      name: 'lineNum',
      width: 120,
    },
    {
      name: 'skuName',
      width: 160,
      editor: (record) => lineIsEdit(record) && record.get('sourceType') === 'MANUAL',
    },
    {
      name: 'lineStatusMeaning',
      width: 80,
      renderer: ({ record }) => {
        return TagRender({
          text: record.get('lineStatusMeaning'),
          type: status(record.get('lineStatus')),
          style: { marginTop: '5px' },
        });
      },
    },
    {
      name: 'sourceTypeMeaning',
      width: 80,
    },
    {
      name: 'skuTypeMeaning',
      width: 120,
    },
    {
      name: readOnly ? 'unitPriceMeaning' : 'unitPrice',
      width: 120,
      align: 'right',
      editor: (record) => lineIsEdit(record) && record.get('sourceType') === 'MANUAL',
    },
    {
      name: 'per',
      width: 80,
    },
    {
      name: 'compareView',
      width: 120,
      renderer: ({ record }) => {
        if (
          record.get('productCompareDTO') &&
          !['GIFT', 'ATTACHMENT', 'FREIGHT'].includes(record.get('skuType'))
        ) {
          return <ViewCompareList productCompare={record.get('productCompareDTO')} />;
        }
        return '-';
      },
    },
    {
      name: 'itemLov',
      show: !readOnly,
      width: 120,
      editor: (record) => lineIsEdit(record) && record.get('sourceType') === 'MANUAL',
    },
    {
      name: 'itemName',
      width: 120,
      show: !readOnly,
    },
    {
      name: readOnly ? 'quantityMeaning' : 'quantity',
      width: 120,
      align: 'right',
      editor: (record) => lineIsEdit(record) && record.get('sourceType') === 'MANUAL',
    },
    {
      name: 'uomLov',
      show: !readOnly,
      width: 120,
      editor: (record) => lineIsEdit(record) && record.get('sourceType') === 'MANUAL',
    },
    {
      name: 'amountMeaning',
      width: 120,
      align: 'right',
    },
    {
      name: 'attachmentUuid',
      width: 120,
      help: readOnly ? null : <div style={{ wordBreak: 'break-all', width: 300 }}>{fileHelp}</div>,
      editor: (record) => {
        const isEdit = lineIsEdit(record) && ['CATA', 'MANUAL'].includes(record.get('sourceType'));
        return (
          <Attachment
            readOnly={!isEdit}
            accept={accept}
            bucketName="private-bucket"
            bucketDirectory="mall-front"
            showValidation="newLine"
            viewMode="popup"
            funcType="link"
            fileSize={1024 * 1024 * purchasFileSize}
          />
        );
      },
    },
    {
      name: readOnly ? 'receiveFullAddress' : 'addressLov',
      width: 180,
      editor: (record) =>
        lineIsEdit(record) &&
        ['CATA', 'MANUAL'].includes(record.get('sourceType')) &&
        record.get('agreementBusinessType') !== 'RECEIVE',
    },
    {
      name: 'invOrganizationName',
      width: 120,
    },
    {
      name: 'ouName',
      width: 120,
    },
    {
      name: 'purOrganizationName',
      width: 120,
    },
    {
      name: 'purchaseCompanyName',
      width: 120,
    },
    {
      name: 'supplierCompanyName',
      width: 120,
    },
    {
      name: 'unitName',
      width: 120,
    },
    {
      name: 'remark',
      width: 120,
      editor: (record) =>
        lineIsEdit(record) && ['CATA', 'MANUAL'].includes(record.get('sourceType')),
    },
    ...CuxFn({
      name: 'OpenCartMyRequest-fn-getCuxColumns',
    })(() => [])(),
  ].filter((f) => f.show !== false);

  // 只读详情表单
  const readOnlyForm = customizeForm(
    {
      code: OPENCART_APPLY_DETAIL_HEADER,
      readOnly: true,
    },
    <Form dataSet={formDs} columns={3} className="c7n-pro-vertical-form-display">
      <Output name="requestCode" />
      <Output
        name="requestStatusMeaning"
        renderer={() =>
          TagRender({
            text: formDs?.current?.get('requestStatusMeaning'),
            type: status(formDs?.current?.get('requestStatus')),
          })
        }
      />
      <Output name="requestTypeMeaning" />
      <Output name="requestAmountMeaning" />
      <Output name="requestNakedAmountMeaning" />
      <Output name="handleByName" />
      <Output name="creationDate" />
      <Output
        name="attachmentUuid"
        renderer={() => (
          <Attachment
            name="attachmentUuid"
            sortable
            bucketName="private-bucket"
            bucketDirectory="mall-front"
            viewMode="popup"
            readOnly
          />
        )}
        style={{ marginTop: '-6px', marginLeft: '-15px' }}
      />
      <Output
        name="outerAttachmentUuid"
        renderer={() => (
          <Attachment
            name="outerAttachmentUuid"
            sortable
            bucketName="private-bucket"
            bucketDirectory="mall-front"
            viewMode="popup"
            readOnly
          />
        )}
        style={{ marginTop: '-6px', marginLeft: '-15px' }}
      />
      <Output name="remark" />
      <Output name="activityTypeMeaning" />
    </Form>
  );

  // 编辑申请表单
  const editForm = customizeForm(
    {
      code: OPENCART_APPLY_EDIT_HEADER,
    },
    <Form dataSet={formDs} columns={3} labelLayout="float" style={{ marginBottom: 25 }}>
      <Select name="requestType" />
      <TextField name="requestAmountMeaning" disabled />
      <TextField name="requestNakedAmountMeaning" disabled />
      <Lov name="handleByLov" />
      <Attachment
        sortable
        accept={accept}
        name="attachmentUuid"
        bucketName="private-bucket"
        bucketDirectory="mall-front"
        showValidation="newLine"
        fileSize={1024 * 1024 * purchasFileSize}
        help={fileHelp}
        colSpan={2}
      />
      <Attachment
        sortable
        accept={accept}
        name="outerAttachmentUuid"
        bucketName="private-bucket"
        bucketDirectory="mall-front"
        showValidation="newLine"
        fileSize={1024 * 1024 * purchasFileSize}
        help={fileHelp}
        colSpan={2}
      />
      <TextArea name="remark" />
    </Form>
  );

  return (
    <div className={style['request-detail']}>
      <Spin dataSet={formDs}>
        <ReqSteps dataSet={formDs} />
        <p className="content-box-title">
          {intl.get(`mallf.myRequest.view.baseInfo`).d('基本信息')}
        </p>
        {readOnly ? readOnlyForm : editForm}
      </Spin>
      <div>
        <p className="content-box-title">
          {intl.get(`mallf.myRequest.view.myRequestInfo`).d('申请信息')}
          <DeleteBtn onClick={() => handleDeleteLine()} dataSet={tableDs} r-if={!readOnly} />
        </p>
        {customizeTable(
          {
            code: readOnly ? OPENCART_APPLY_DETAIL_LINE : OPENCART_APPLY_EDIT_LINE,
          },
          <Table dataSet={tableDs} columns={columns} />
        )}
      </div>
    </div>
  );
}

export default c7nCustomize({
  unitCode: [
    OPENCART_APPLY_DETAIL_HEADER,
    OPENCART_APPLY_DETAIL_LINE,
    OPENCART_APPLY_EDIT_HEADER,
    OPENCART_APPLY_EDIT_LINE,
  ],
})(Detail);

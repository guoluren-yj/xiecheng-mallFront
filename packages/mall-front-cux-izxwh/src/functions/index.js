import React from 'react';
import { Button, Lov, Modal } from 'choerodon-ui/pro';

import Link from 'components/Link';
import intl from 'utils/intl';
import { fillUrlToken, openPage } from 'utils/utils';
import HmallConfig from 'utils/api-config';

export function cuxAddLine({ addLine, headerDs, initDs: tableDs }) {
  addLine();
  const headerInfo = headerDs.current.toData();
  tableDs.current.set({ attributeVarchar11Lov: headerInfo?.attributeVarchar10Lov });
}

export const cancelRequest = ({ item, handleCancelRequest }) => {
  return (
    <>
      {![
        'TO_PO',
        'CANCELED',
        'CANCELLING',
        'NEW',
        'CANCEL_TO_CONFIRM',
        'SUBMITTED',
        'APPROVED',
        'TO_BE_APPROVE', // 待审批不展示
      ].includes(item.mallManualRequestStatus) && (
        <div className="right-btn text-overflow" onClick={() => handleCancelRequest(item)}>
          {intl.get('mallf.myRequest.view.edit.cancelRequest').d('取消申请')}
        </div>
      )}
      {/* 新建，已提交不显示该按钮 */}
      {item?.attributeLongtext10 && !['NEW', 'SUBMITTED'].includes(item.mallManualRequestStatus) && (
        <Link className="right-btn text-overflow" to={item?.attributeLongtext10}>
          {intl.get('mallf.myRequest.view.OA.approve').d('OA审批页面')}
        </Link>
      )}
    </>
  );
};

export function changePrType({ tableDs }) {
  tableDs.forEach((record) => {
    record.set('itemCodeLov', null);
    record.set('categoryLov', null);
  });
}

// 手工申请头修改headerChangeAttr10字段
export function headerChangeAttr10({ tableDs, headerDs }) {
  const unit = headerDs.current?.get('attributeVarchar10Lov');
  tableDs.records.forEach((record) => {
    record.set({ attributeVarchar11Lov: unit, attributeVarchar10Lov: null });
  });
}

export function lineChangeAttr11({ tableDs }) {
  tableDs.current.set({ attributeVarchar10Lov: null });
}

export function preOrderHeaderChangeAttr10({ order }) {
  const unit = order.DS.current?.get('attributeVarchar10Lov');
  order.shoppingCartDTOList.forEach((product) => {
    product.DS.set({ attributeVarchar11Lov: unit, attributeVarchar10Lov: null });
  });
}

export function preOrderlineChangeAttr11({ dataSet }) {
  dataSet.current.set({ attributeVarchar10Lov: null });
}

export function cuxButton() {
  return (
    <Button
      color="primary"
      funcType="flat"
      onClick={() =>
        openPage(`${HmallConfig.srmPath}/smdm/materiel-application/list${fillUrlToken()}`)
      }
    >
      {intl.get('mallf.addPurchase.view.itemApplyPush').d('物料申请单跳转')}
    </Button>
  );
}

export function cuxAddPurchaseApplyInitDs({ ds }) {
  ds.addField('attributeLongtext1Lov', {
    name: 'attributeLongtext1Lov',
    label: intl.get('mallf.addPurchase.view.projectName').d('项目名称'),
    type: 'object',
    ignore: 'always',
    lovCode: 'SCUX_AIXUEXI_PROJECT_NAME',
    valueField: 'projectId',
    textField: 'projectName',
    optionsProps: (dsProps) => ({
      ...dsProps,
      paging: false,
      record: {
        dynamicProps: {
          selectable: (record) => !record.get('children'),
        },
      },
      childrenField: 'children',
    }),
    transformResponse: (value, object) => {
      return object?.attributeLongtext1
        ? {
            projectId: value,
            projectName: object?.attributeLongtext1Meaning,
          }
        : null;
    },
  });
  ds.addField('attributeLongtext1', {
    name: 'attributeLongtext1',
    label: '项目id',
    type: 'string',
    bind: 'attributeLongtext1Lov.projectId',
  });
  ds.addField('attributeLongtext1Meaning', {
    name: 'attributeLongtext1Meaning',
    label: '项目名称',
    type: 'string',
    bind: 'attributeLongtext1Lov.projectName',
  });
  return ds;
}

export function cuxAddPurchaseApplyColumns({ columns }) {
  columns.push({
    name: 'attributeLongtext1Lov',
    width: 120,
    editor: (record) => (
      <Lov
        editor
        dataSet={record}
        name="attributeLongtext1Lov"
        tableProps={{
          mode: 'tree',
          onRow: (row) => {
            const handleSelect = ({ dataSet, record: _record }) => {
              if (dataSet && _record) {
                dataSet.select(_record);
              }
            };
            return {
              onClick: () => handleSelect(row),
              onDoubleClick: () => {
                if (row?.record?.selectable) {
                  handleSelect(row);
                  record.set({
                    attributeVarchar15: row?.record?.toData(),
                  });
                  Modal.destroyAll();
                }
              },
            };
          },
          selectionMode: 'rowbox',
          style: { maxHeight: '500px' },
        }}
      />
    ),
  });
  return columns;
}

export function cuxDeleteField(props) {
  const { res } = props;
  if (res) {
    delete res._token;
    delete res.manualRequestId;
    delete res.manualRequestNum;
    delete res.objectVersionNumber;
    delete res.lastUpdatedBy;
    delete res.predictAmountMeaning;
    delete res.predictAmount;
    delete res.rejectedReason;
    delete res.mallManualRequestStatus;
    delete res.mallManualRequestStatusMeaning;
    delete res.showCancelFailedFlag;
    delete res.prNum; // 不复制prNum，用于做已提交/审批拒绝状态判断
    delete res.cancelReason; // 不复制原因
    delete res.attributeLongtext10; // 不复制OA审批链接
    if (res?.manualRequestEntryList) {
      res.manualRequestEntryList.forEach(m => {
        delete m.objectVersionNumber;
        delete m._token;
        delete m.manualRequestEntryId;
        delete m.manualRequestId;
        delete m.predictEntryAmount;
        delete m.predictEntryAmountMeaning;
        delete m.lastUpdateDate;
        delete m.lastUpdatedBy;
      });
    }
  }
}

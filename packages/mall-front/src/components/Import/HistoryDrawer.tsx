import * as React from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { TableColumnTooltip, ColumnLock, TableQueryBarType } from 'choerodon-ui/pro/lib/table/enum';

import { operatorRender } from 'hzero-front/lib/utils/renderer';
import { TagRender } from 'utils/renderer';
import intl from 'utils/intl';
import styles from './index.less';
import { historyTableDS } from './stores';

interface ImportProps {
  onRestore: (object: any) => void;
  modal: any;
  dataSource: any;
  onDownloadSource: (record: any) => void;
  onDownloadFailure: (record: any) => void;
  [propName: string]: any;
}

const Drawer: React.FC<ImportProps> = ({
  dataSource,
  onRestore,
  modal,
  onDownloadSource,
  onDownloadFailure,
}) => {
  const { code, prefixPatch, tenantId, importType, batch, restoreShowAllButton } = dataSource;
  const historyTableDs = React.useMemo(() => new DataSet(historyTableDS(importType)), []);

  React.useEffect(() => {
    if (importType === 'businessObjectTemplateCategory') {
      historyTableDs.setQueryParameter('templateCategory', code);
    } else {
      historyTableDs.setQueryParameter('templateCode', code);
    }
    historyTableDs.setQueryParameter('prefixPatch', prefixPatch);
    historyTableDs.setQueryParameter('tenantId', tenantId);
    historyTableDs.setQueryParameter('importType', importType);
    historyTableDs.query();
  }, []);

  const renderTag = React.useCallback(({ value, text }) => {
    const statusList = [
      { status: 'UPLOADING', type: 'warning' /* , text: 'Excel导入' */ },
      { status: 'UPLOADED', type: 'success' /* , text: '验证成功' */ },
      { status: 'CHECKING', type: 'danger' /* , text: '验证失败' */ },
      { status: 'CHECKED', type: 'success' /* , text: '导入成功' */ },
      {
        status: 'CHECK_FAILED',
        type: 'danger' /* , text: '数据校验失败' */,
      },
      { status: 'IMPORTING', type: 'danger' /* , text: '导入失败' */ },
      { status: 'IMPORTED', type: 'danger' /* , text: '数据异常' */ },
      {
        status: 'IMPORT_FAILED',
        type: 'danger' /* , text: '数据导入失败' */,
      },
    ];
    const currentType = statusList.find((t) => t.status === value) || ({} as any);
    return (
      <div>
        {TagRender({ type: currentType.type, text })}
      </div>
    );
  }, []);

  const handleRestore = React.useCallback(
    (record) => {
      const newBatch = record?.get('batch') || record?.get('batchNum');
      const actualTemplateCode = record?.get('templateCode');
      const fileName = record?.get('fileName');
      onRestore({ batch: newBatch, actualTemplateCode, fileName, flag: true });
      if (modal) {
        modal.close();
      }
    },
    [onRestore, batch]
  );

  const handleDelete = React.useCallback(async (record): Promise<void> => {
    const res = await historyTableDs.delete(record);
    if (res) {
      historyTableDs.query();
    }
  }, []);

  return (
    <>
      {importType !== 'templateCode' && (
        <Alert
          closable
          message={intl
            .get('hmsg.userMessage.view.message.import')
            .d('导入文件会保存一周，一周后将无法下载')}
          type="info"
          showIcon
          className={styles.alert}
        />
      )}
      <Table queryBar={TableQueryBarType.advancedBar} queryFieldsLimit={3} dataSet={historyTableDs}>
        {/* // FIXME: 为什么不用columns */}
        {importType === 'templateCode' && (
          <Table.Column name="batch" tooltip={TableColumnTooltip.overflow} />
        )}
        {importType === 'templateCode' && (
          <Table.Column name="dataCount" tooltip={TableColumnTooltip.overflow} width={100} />
        )}
        <Table.Column name="status" width={120} renderer={renderTag} />
        {importType !== 'templateCode' && (
          <Table.Column name="fileName" tooltip={TableColumnTooltip.overflow} width={200} />
        )}
        {importType !== 'templateCode' && (
          <Table.Column
            name="description"
            tooltip={TableColumnTooltip.overflow}
            renderer={({ record }) => {
              const count = record?.get('dataCount');
              const ready = record?.get('successCount') || 0;
              const status = record?.get('status');
              return status === 'IMPORT_FAILED'
                ? intl
                  .get('hzero.common.components.import.pending.tooltip', { count, ready: count - ready })
                  .d(`导入${count}条数据，失败${count - ready}条`)
                : '';
            }}
          />
        )}
        <Table.Column name="creationDate" width={200} />
        <Table.Column
          name="operation"
          header={intl.get('hzero.common.button.action').d('操作')}
          width={240}
          lock={ColumnLock.right}
          renderer={({ record }) => {
            const status = record?.get('status');
            const templateSource = record?.get('templateSource');
            const fileUrl = record?.get('fileUrl');
            const data = record?.toData();
            const operators: any[] = [];
            if (
              importType === 'templateCode' ||
              restoreShowAllButton ||
              status === 'IMPORT_FAILED' ||
              status === 'CHECK_FAILED'
            ) {
              operators.push({
                key: 'restore',
                ele: (
                  <a
                    onClick={() => {
                      handleRestore(record);
                    }}
                  >
                    {intl.get('himp.commentImport.view.button.restore').d('恢复')}
                  </a>
                ),
                len: 2,
                title: intl.get('himp.commentImport.view.button.restore').d('恢复'),
              });
            }
            if (
              importType === 'templateCode' &&
              ['IMPORTED', 'CHECKED', 'UPLOADED'].includes(status)
            ) {
              operators.push({
                key: 'delete',
                ele: (
                  <a
                    onClick={() => {
                      handleDelete(record);
                    }}
                  >
                    {intl.get('hzero.common.button.delete').d('删除')}
                  </a>
                ),
                len: 2,
                title: intl.get('hzero.common.button.delete').d('删除'),
              });
            } else if (templateSource === 'MODEL' && fileUrl) {
              operators.push({
                key: 'downloadOrigin',
                ele: (
                  <a
                    onClick={() => {
                      onDownloadSource(data);
                    }}
                  >
                    {intl.get('himp.commentImport.view.button.downloadOrigin').d('下载源文件')}
                  </a>
                ),
                len: 5,
                title: intl.get('himp.commentImport.view.button.downloadOrigin').d('下载源文件'),
              });
              if (status === 'IMPORT_FAILED') {
                operators.push({
                  key: 'downloadFailure',
                  ele: (
                    <a
                      onClick={() => {
                        onDownloadFailure(data);
                      }}
                    >
                      {intl.get('himp.commentImport.view.button.downloadFailure').d('下载失败文件')}
                    </a>
                  ),
                  len: 6,
                  title: intl
                    .get('himp.commentImport.view.button.downloadFailure')
                    .d('下载失败文件'),
                });
              }
            }

            if (importType === 'templateCode' && status === 'IMPORT_FAILED') {
              operators.push({
                key: 'downloadFailure',
                ele: (
                  <a
                    onClick={() => {
                      onDownloadFailure(data);
                    }}
                  >
                    {intl.get('himp.commentImport.view.button.downloadFailure').d('下载失败文件')}
                  </a>
                ),
                len: 6,
                title: intl.get('himp.commentImport.view.button.downloadFailure').d('下载失败文件'),
              });
            }

            return operatorRender(operators, record, { limit: 3 });
          }}
        />
      </Table>
    </>
  );
};

export default Drawer;

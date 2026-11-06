import React, { useMemo } from 'react';
import { Button, Modal } from 'choerodon-ui/pro';
import qs from 'qs';

import { getAccessToken } from 'utils/utils';
import intl from 'utils/intl';
import { srmPath } from 'utils/api-config';

export default function OperateRender({ dataSet, item, handleCancelLine = (e) => e }) {
  const handleOpenModal = () => {
    const {
      requestId,
      requestCode: requestNum,
      templateType: type,
      flag,
      editFlag,
      attributeVarchar18,
    } = item || {};
    const params = {
      requestId,
      requestNum,
      type,
      editFlag,
      attributeVarchar18,
    };
    Modal.open({
      title:
        flag === 2
          ? intl.get('mallf.myRequest.view.edit.comment').d('立即评价')
          : intl.get('mallf.myRequest.view.edit.commentView').d('查看评价'),
      closable: true,
      drawer: true,
      footer: null,
      style: { width: '1090px' },
      children: (
        <iframe
          name="commentIframe"
          style={{ border: 'none' }}
          width="100%"
          height="100%"
          title="commentIframe"
          src={`${srmPath}/pub/scux/application-evaluation/form?${qs.stringify(
            params
          )}#access_token=${getAccessToken()}`}
        />
      ),
      onClose: () => {
        dataSet.queryData();
      },
    });
  };

  const OperateRenderer = useMemo(() => {
    const { mallRequestEntryViewVOList = [], flag } = item || {};
    const lineIsCancel = (line) => line.canCancelFlag === 1;
    const canCancelFlag = mallRequestEntryViewVOList.some(lineIsCancel);
    return canCancelFlag ? (
      mallRequestEntryViewVOList.map((n) => (
        <div className="request-item-operate">
          <Button
            r-if={lineIsCancel(n)}
            funcType="flat"
            color="primary"
            className="right-btn text-overflow"
            onClick={() => handleCancelLine(n)}
          >
            {intl.get('mallf.myRequest.view.edit.cancelRequest').d('取消申请')}
          </Button>
        </div>
      ))
    ) : (
      <div className="request-item-operate">
        <Button
          r-if={[2, 3].includes(+flag)}
          funcType="flat"
          color="primary"
          className="right-btn text-overflow"
          onClick={() => handleOpenModal()}
        >
          {flag === 2
            ? intl.get('mallf.myRequest.view.edit.comment').d('立即评价')
            : intl.get('mallf.myRequest.view.edit.commentView').d('查看评价')}
        </Button>
      </div>
    );
  }, [item]);

  return OperateRenderer;
}

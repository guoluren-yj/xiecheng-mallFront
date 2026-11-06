import React, { useMemo, useEffect } from 'react';
import { Spin, Button } from 'choerodon-ui/pro';
import { Observer } from 'mobx-react';

import intl from 'utils/intl';
import { PermissionProvider } from 'components/Permission';

import AllocationAnchor from './AllocationAnchor';
import AllocationItem from './AllocationItem';
import HeaderDataSet from './HeaderDataSet';
import LineDataSet from './LineDataSet';
import { renderField } from './func';
import {
  getHeaderEnabledDimension,
  getLineEnabledDimension,
  getLineDisplayDimension,
} from '../ProductAllocation/func';
import useAnchorScroll from '@/hooks/useAnchorScroll';
import AllocationItemSkeleton from '../ProductAllocation/AllocationItemSkeleton';
import style from './index.less';

function BatchAllocationModal(props) {
  const {
    dimensTemplates,
    products,
    hasPunchoutFlag,
    hasManulFlag,
    isSharedOrderFlag,
    modal,
    fetchProduct = (e) => e,
    history,
  } = props;
  const { dimensionList = [], dimensionTemplate } = dimensTemplates || {};
  const { templateId } = dimensionTemplate || {};

  const { index: anchorIndex } = useAnchorScroll({
    container: document.querySelector('.c7n-pro-modal-body'),
  });

  const alloctionDs = useMemo(() => {
    return new HeaderDataSet(
      {
        autoQuery: false,
        paging: false,
        forceValidate: true,
        fields: renderField({
          dimensionList,
          fieldList: getHeaderEnabledDimension(dimensionList),
          fieldType: 'header',
          hasManulFlag,
        }),
        events: {
          update: (r) => {
            alloctionDs.update(r);
          },
        },
      },
      { dimensionList, products, templateId, fetchProduct }
    );
  }, []);

  useEffect(() => {
    modal.update({
      onOk: () => alloctionDs.saveBatchAlloction({ history }),
    });
    alloctionDs.hasPunchoutFlag = hasPunchoutFlag;
    alloctionDs.hasManulFlag = hasManulFlag;
    alloctionDs.isSharedOrderFlag = isSharedOrderFlag;
    const params = alloctionDs.getAddInfoListParams(products, true);
    alloctionDs.batchFetch({ ...params, templateId, defaultFlag: 1 });
  }, [modal, alloctionDs]);

  useEffect(() => {
    // 是否存在拆单维度
    const isSplit = getLineDisplayDimension(dimensionList || []).some(
      (n) => n.dimension?.splitFlag === 1
    );
    alloctionDs.noCreateFlag = hasPunchoutFlag || hasManulFlag || isSplit || isSharedOrderFlag;
  }, [dimensionList]);

  return (
    <PermissionProvider>
      <Spin dataSet={alloctionDs}>
        <Observer>
          {() => (
            <div className={style['batch-allocation']}>
              <AllocationAnchor alloctionDs={alloctionDs} />
              <div className="body-allocation">
                {(alloctionDs.records || []).map((record, index) => {
                  if (!record.lineDs) {
                    // eslint-disable-next-line no-param-reassign
                    record.lineDs = new LineDataSet(
                      {
                        autoQuery: false,
                        paging: false,
                        forceValidate: true,
                        selection: false,
                        record: {
                          defaultExpanded: true,
                        },
                        fields: renderField({
                          headerDs: record,
                          dimensionList,
                          fieldType: 'line',
                          fieldList: getLineEnabledDimension(dimensionList),
                          hasManulFlag,
                        }),
                        events: {
                          update: (r) => {
                            record.lineDs.update(r);
                          },
                        },
                      },
                      { dimensionList, headerRecord: record, hasManulFlag }
                    );
                    alloctionDs.loadLineData(record);
                  }
                  const allocationProps = {
                    templateId,
                    index,
                    dimensionList,
                    headerDs: record,
                    alloctionDs,
                    products,
                  };
                  return Math.abs(index - anchorIndex) <= 5 ? (
                    <AllocationItem {...allocationProps} />
                  ) : (
                    <AllocationItemSkeleton index={index} height={500} />
                  );
                })}
                <Button
                  r-if={!alloctionDs.noCreateFlag}
                  icon="add"
                  funcType="flat"
                  color="primary"
                  onClick={() => alloctionDs.addAllocation()}
                  style={{ marginBottom: 20, fontSize: 14 }}
                >
                  {intl.get('mallf.common.button.add').d('新建')}
                </Button>
              </div>
            </div>
          )}
        </Observer>
      </Spin>
    </PermissionProvider>
  );
}

export default BatchAllocationModal;

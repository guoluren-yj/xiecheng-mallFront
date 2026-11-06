/**
 * DocRelation
 * 关联单据
 * @date: 2021-12-10
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useState, useEffect, useCallback } from 'react';
import {Table, Spin } from 'choerodon-ui';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { queryNodeRelDocInfo } from './docFlowService';

// FlowChart interface
interface DocRelationProps {
  tableName: string;
  tablePk: string;
  currentOrganizationId: number;
}

// NodeRelDocInfoRow interface
interface NodeRelDocInfoRow {
  fieldCode: string;
  fieldMeaning: string;
  fieldValue: string;
}

// DocRelationLi interface
interface DocRelationLi {
  nodeName: string;
  quantity: number;
  nodeRelDocInfo: Array<Array <NodeRelDocInfoRow>>;
}

function DocRelation (props: DocRelationProps) {

  const { tableName, tablePk, currentOrganizationId } = props;
  const [docRelationLoading, handleDocRelationLoading] = useState(true);
  const [docRelationList, setDocRelationList] = useState([]);

  useEffect(() => {
    handleDocRelationLoading(true);
    queryNodeRelDocInfo({
      tableName,
      tablePk,
      currentOrganizationId,
    }).then((res) => {
      if(getResponse(res)) {
        setDocRelationList(res)
      }
    }).finally(() => handleDocRelationLoading(false));
  }, []);

  /**
   * 动态渲染关联单据表格
   * 数据是二维数组， 直接拿 [0][0] 来生成表头， 然后二次循环生成表格数据
   * @param nodeRelDocInfo 渲染表格数据
   * @returns
   */
  const renderDocTable = (nodeRelDocInfo) => {
    // 暂时给格式为 any
    const fields = [] as any;
    const columns = [] as any;
    const data = [] as any;
    for (let i = 0; i < nodeRelDocInfo.length; i++) {
      let currentRow = nodeRelDocInfo[i];
      let dataCell = {};
      for (let j = 0; j < currentRow.length; j++) {
        if(i === 0) {
          fields.push({
            name: currentRow[j].fieldCode,
            label: currentRow[j].fieldMeaning,
            type: 'string',
          });
          columns.push({
            // name: currentRow[j].fieldCode,
            dataIndex: currentRow[j].fieldCode,
            key: currentRow[j].fieldCode,
            title: currentRow[j].fieldMeaning,
          })
        }
        dataCell[currentRow[j].fieldCode] = currentRow[j].fieldValue
      }
      data.push(dataCell)
    }
    return (
      <Table
        // dataSet={new DataSet({
        //   selection: false,
        //   fields,
        //   data,
        // })}
        filterBar={false}
        dataSource={data}
        columns={columns}
        pagination={false}
      />
    )
  }

  /**
   * 渲染关联单据tabs
   */
  const renderDocRelation = useCallback((docRelationList) => {
    if (docRelationList.length > 0) {
      return (
        <div className='doc-flow-relation-table-content'>
          {docRelationList.map((li: DocRelationLi) => {
            return (
              <div className='doc-flow-relation-table-content-item'>
                <p className='doc-flow-relation-table-content-item-title'>{li.nodeName}</p>
                {renderDocTable(li.nodeRelDocInfo)}
              </div>
            )
          })}
        </div>
      )
    } else {
      return <div className='doc-flow-relation-emptyText'>{intl.get('hzero.hzeroUI.Table.emptyText').d('暂无数据')}</div>
    }

  }, [docRelationList])

  return (
    <Spin spinning={docRelationLoading}>
      <div className='doc-flow-relation-table'>
        {renderDocRelation(docRelationList)}
      </div>
    </Spin>
  )
}

export default DocRelation;

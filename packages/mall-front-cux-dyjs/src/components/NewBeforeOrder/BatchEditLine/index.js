import React from 'react';
import { DataSet, Form, Lov } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';

export default function Product(props) {
  const { orderData = {} } = props || {};
  return (
    <div style={{ margin: '10px' }}>
      <Form
        dataSet={
          new DataSet({
            fields: [
              {
                name: 'attributeVarchar1',
                type: 'object',
                lovCode: 'SIEC.PROJECT_TASK_TREE',
              },
            ],
          })
        }
      >
        <Lov
          name="attributeVarchar1"
          color="primary"
          mode="button"
          clearButton={false}
          onChange={(selectedLine) => {
            const {
              projectId = null,
              projectName = null,
              projectNum = null,
              taskId = null,
              taskName = null,
              taskNum = null,
            } = selectedLine || {};
            if (!isEmpty(orderData)) {
              orderData.forEach((item) => {
                const { DS = {} } = item || {};
                DS.forEach((record) => {
                  record.set({
                    attributeVarchar1: taskName,
                    attributeVarchar10: projectNum,
                    attributeLongtext1: projectName,
                    projectId,
                    projectName,
                    projectNum,
                    taskId,
                    taskName,
                    taskNum,
                  });
                });
              });
            }
          }}
        >
          {intl.get('mallf.myMall.view.companyOrder.batchEditItemInfo').d('批量维护项目信息')}
        </Lov>
      </Form>
    </div>
  );
}

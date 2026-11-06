import React, { useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { Modal, Row, Col, Input, Select } from 'choerodon-ui';
import { Form } from 'hzero-ui';
import { DataSet, Table as C7nTable, Button as ProButton } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { isEmpty, sum, isString, isFunction } from 'lodash';
import Loading from 'components/loading';
import getColumus from './columns';
import { getOrganizationId } from 'utils/utils';
import { fetchLovConfig } from '@/services/api';
import useSetState from '@/hooks/useState';

const formLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

function LovModal(props) {
  const selectedRow = useRef();
  const {
    lovCode, // lovCode
    toggleModal,
    handleLovOk,
    queryUrl,
    queryParams,
    columns,
    title = '',
    columnsParams,
    originTenantId,
    modal,
    okText,
    cancelText,
  } = props;

  const [state, setState] = useSetState({
    config: {},
    data: [],
    pagination: {},
    queryFields: [],
    tableFields: [],
    loading: !!lovCode,
    spinning: false,
  });

  const isCodeLov = useMemo(() => !!lovCode, [lovCode]); // 是否为code传值lov
  const { getFieldDecorator, resetFields, getFieldsValue } = props.form;

  useEffect(() => {
    const currentColumus =
      !isEmpty(columns) && isString(columns) ? getColumus(columnsParams)[columns] : columns || [];
    if (!isCodeLov && currentColumus) {
      setState({
        tableFields: currentColumus.map((p) => ({
          ...p,
          name: p.dataIndex,
          label: p.title,
          tooltip: 'overflow',
        })),
        queryFields: currentColumus
          .filter((c) => c.isQuery)
          .map((c) => ({ ...c, field: c.dataIndex, label: c.title })),
      });
    }
  }, []);

  const tableDs = useMemo(() => {
    if (!isEmpty(state.tableFields)) {
      return new DataSet({
        autoQuery: true,
        fields: state.tableFields,
        selection: false,
        events: {
          load({ dataSet }) {
            selectedRow.current = dataSet.toData()?.[0];
          },
        },
        transport: {
          read({ data }) {
            return {
              url: (state.config.queryUrl || queryUrl)?.replace(
                '{organizationId}',
                getOrganizationId()
              ),
              method: 'GET',
              data: {
                lovCode: lovCode || null,
                ...data,
                ...getFieldsValue(),
                ...(isFunction(queryParams) ? queryParams() : queryParams),
              },
            };
          },
        },
      });
    } else {
      return new DataSet();
    }
  }, [state.tableFields?.length]);

  useEffect(() => {
    fetchData();
  }, [isCodeLov]);

  function fetchData() {
    if (isCodeLov) {
      fetchLovConfig({ lovCode, tenantId: originTenantId })
        .then((config) => {
          setState({
            config,
            queryFields: config.queryFields,
            tableFields: config.tableFields.map((p) => ({
              ...p,
              name: p.dataIndex,
              label: p.title,
              tooltip: 'overflow',
            })),
          });
        })
        .finally(() => {
          setState({
            loading: false,
          });
        });
    }
  }

  const handleModalOK = () => {
    if (isEmpty(selectedRow.current)) {
      Modal.warning({
        title: intl.get(`mallf.common.model.selectOneMsg`).d('请至少选择一条数据'),
        okText: intl.get(`mallf.common.model.know`).d('知道了'),
        zIndex: 10000,
      });
    } else {
      handleLovOk(selectedRow.current, state.config);
      modal.close();
    }
  };

  const handleClick = (data) => {
    selectedRow.current = data;
  };

  const handleDoubleClick = (data) => {
    handleLovOk(data, state.config);
    toggleModal();
  };

  const modalWidth = sum(state.tableFields.map((c) => c.width));

  useLayoutEffect(() => {
    modal.update({
      title: state.config.title || title,
      style: { width: modalWidth ? (modalWidth > 1130 ? 1190 : modalWidth + 60) : 530 },
      footer: [
        <ProButton color="primary" onClick={handleModalOK}>
          {okText || intl.get(`mallf.common.model.confirm`).d('确认')}
        </ProButton>,
        <ProButton
          onClick={() => {
            toggleModal();
            modal.close();
          }}
        >
          {cancelText || intl.get(`mallf.common.button.cancel`).d('取消')}
        </ProButton>,
      ],
    });
  }, [modalWidth, state.config.title]);

  return (
    <>
      {state.loading ? (
        <Loading />
      ) : (
        <>
          <Form style={{ marginTop: state.config.title || title ? 0 : 20 }}>
            <Row gutter={12}>
              <Col span={18}>
                <Row>
                  {state.queryFields.map((q) => {
                    if (q.isSelect) {
                      return (
                        <Col span={12}>
                          <Form.Item label={q.label} {...formLayout}>
                            {getFieldDecorator(q.queryDataIndex)(
                              <Select style={{ height: 36 }}>
                                {q.queryData.map((n) => (
                                  <Select.Option value={n.value} key={n.value}>
                                    {n.meaning}
                                  </Select.Option>
                                ))}
                              </Select>
                            )}
                          </Form.Item>
                        </Col>
                      );
                    } else {
                      return (
                        <Col span={12}>
                          <Form.Item label={q.label} {...formLayout}>
                            {getFieldDecorator(q.field)(
                              <Input style={{ height: 36 }} onPressEnter={() => tableDs.query()} />
                            )}
                          </Form.Item>
                        </Col>
                      );
                    }
                  })}
                </Row>
              </Col>
              <Col span={6}>
                <div className="button-group" style={{ float: 'right' }}>
                  <ProButton style={{ height: 36 }} onClick={() => resetFields()}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </ProButton>
                  <ProButton
                    color="primary"
                    onClick={() => {
                      tableDs.query();
                    }}
                  >
                    {intl.get('hzero.common.button.search').d('查询')}
                  </ProButton>
                </div>
              </Col>
            </Row>
          </Form>
          <div>
            <C7nTable
              selectionMode="dblclick"
              dataSet={tableDs}
              columns={state.tableFields}
              onRow={({ record }) => ({
                onClick: () => handleClick(record.toData()),
                onDoubleClick: () => handleDoubleClick(record.toData()),
              })}
            />
          </div>
        </>
      )}
    </>
  );
}

export default Form.create({ fieldNameProp: null })(LovModal);

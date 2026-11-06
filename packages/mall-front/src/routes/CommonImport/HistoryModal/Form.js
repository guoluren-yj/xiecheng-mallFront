import React, { useEffect } from 'react';
import { Row, Col, Button, Form } from 'hzero-ui';
import { DatePicker } from 'choerodon-ui/pro';
import moment from 'moment';
import intl from 'utils/intl';

function FormList(props) {
  const {
    onRef = (e) => e,
    onSearch = (e) => e,
    form,
    form: { getFieldDecorator, getFieldValue, resetFields },
  } = props;

  const handleReset = () => {
    resetFields();
  };

  useEffect(() => {
    onRef(form);
  }, []);

  return (
    <Form layout="inline">
      <Row gutter={12}>
        <Col span={9}>
          <Form.Item label={intl.get('mallf.commonImport.view.creationDateFrom').d('创建日期从')}>
            {getFieldDecorator('creationDateFrom')(
              <DatePicker
                showTime
                placeholder=""
                format="YYYY-MM-DD hh:mm:ss"
                max={
                  getFieldValue('creationDateTo') ? moment(getFieldValue('creationDateTo')) : null
                }
              />
            )}
          </Form.Item>
        </Col>
        <Col span={9}>
          <Form.Item label={intl.get('mallf.commonImport.view.creationDateTo').d('创建日期至')}>
            {getFieldDecorator('creationDateTo')(
              <DatePicker
                showTime
                placeholder=""
                format="YYYY-MM-DD hh:mm:ss"
                min={
                  getFieldValue('creationDateFrom')
                    ? moment(getFieldValue('creationDateFrom'))
                    : null
                }
              />
            )}
          </Form.Item>
        </Col>
        <Col span={6}>
          <Button style={{ marginRight: 8 }} onClick={handleReset}>
            {intl.get('mallf.commonImport.button.reset').d('重置')}
          </Button>
          <Button type="primary" onClick={() => onSearch()}>
            {intl.get('mallf.commonImport.button.query').d('查询')}
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

export default Form.create()(FormList);

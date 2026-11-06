import React from 'react';
import { Radio, Row, Col } from 'choerodon-ui';
// import intl from 'utils/intl';
import style from './index.less';

function ButtonList(props) {
  const { loadings, onRadioChange, currentStatus, count, labelList = [] } = props;
  // console.log(currentStatus);
  return (
    <Row
      className={style['button-list']}
      style={
        loadings.loading
          ? { pointerEvents: 'none', marginBottom: 0, height: 32 }
          : { marginBottom: 0, height: 32 }
      }
    >
      <Col span={24}>
        <Radio.Group
          onChange={onRadioChange}
          value={currentStatus}
          style={{ float: 'left', width: '100%' }}
          size="large"
        >
          {/* code， value， label */}
          {labelList.map((l) => {
            // console.log(l);
            return (
              <Radio.Button title={count[l.countName]} value={l.status}>
                {l.label}
                {`(${count[l.countName] || '0'})`}
              </Radio.Button>
            );
          })}
        </Radio.Group>
      </Col>
    </Row>
  );
}

export default ButtonList;

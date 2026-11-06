import React from 'react';
import { Row, Col } from 'choerodon-ui/pro';

export function AutoRow(props) {
  const { children, ...otherProps } = props;

  const cols = [];

  React.Children.forEach(children, (child) => {
    if (child) {
      cols.push(child.props);
    }
  });

  return (
    <Row {...otherProps}>
      {cols.map((m) => (
        <Col {...m} span={24 / cols.length}>
          {m.children}
        </Col>
      ))}
    </Row>
  );
}

export function AutoCol(props) {
  const { children, ...otherProps } = props;

  let hidden = true;

  React.Children.forEach(children, (child) => {
    if (child) {
      hidden = false;
    }
  });

  return hidden ? null : <Col {...otherProps}>{children}</Col>;
}

import React from 'react';
import { Button, Dropdown, Menu } from 'choerodon-ui/pro';

function HeaderOther(props) {
  const { operateBtns: oldOperateBtns } = props;
  const operateBtns = oldOperateBtns.filter((i) => !i.hidden);
  const isHaveRender = (target) => typeof target.render === 'function';
  const outerBtn = operateBtns?.[0];
  const secondBtn = operateBtns?.[1] || {};
  const menu = (
    <Menu selectable={false}>
      {operateBtns.slice(1).map((btn) =>
        isHaveRender(btn) ? (
          <Menu.Item style={{ padding: 0, textAlign: 'left' }}>{btn.render()}</Menu.Item>
        ) : (
          <Menu.Item onClick={btn.onClick} style={{ textAlign: 'left' }}>
            {btn.title}
          </Menu.Item>
        )
      )}
    </Menu>
  );
  return (
    <div
      style={{
        display: 'flex',
        textAlign: 'right',
        flexDirection: 'row-reverse',
      }}
    >
      {outerBtn &&
        (isHaveRender(outerBtn) ? (
          outerBtn.render()
        ) : (
          <Button color="primary" funcType="flat" icon={outerBtn.icon} onClick={outerBtn.onClick}>
            {outerBtn.title}
          </Button>
        ))}
      {operateBtns.length > 1 &&
        (operateBtns.length > 2 ? (
          <Dropdown overlay={menu} placement="bottomLeft">
            <Button
              icon="more_horiz"
              color="primary"
              funcType="flat"
              style={{ lineHeight: '32px', borderRadius: '2px' }}
            />
          </Dropdown>
        ) : isHaveRender(secondBtn) ? (
          secondBtn?.render()
        ) : (
          <Button color="primary" funcType="flat" icon={secondBtn.icon} onClick={secondBtn.onClick}>
            {secondBtn.title}
          </Button>
        ))}
    </div>
  );
}

export default HeaderOther;

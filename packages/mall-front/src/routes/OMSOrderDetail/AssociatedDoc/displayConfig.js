import React from 'react';
import { CopyButton } from 'utils/renderer';
import OverflowTip from 'components/OverflowTip';

export default function getCustDisplayConfig(fields, dataSource) {
  const missFields = [];
  const fieldsRenders = [];
  fields.forEach((field) => {
    const { name, label, copyField, show = true } = field;
    if ('show' in field) {
      missFields.push(field.name);
    }
    const value = dataSource[name];
    const showFlag = typeof show === 'function' ? show(value, dataSource) : show;
    fieldsRenders.push(
      <p className="line-item copy-btn-container" data-field={name} r-if={showFlag}>
        <span className="line-item-label">
          <OverflowTip>{label}</OverflowTip>:
        </span>
        <span className="line-item-info text-overflow">
          <span title={value}>{value || '-'}</span>
          <CopyButton
            r-if={copyField}
            num={value}
            label={label}
            tooltipProps={{ placement: 'right' }}
            style={{ position: 'absolute', top: -4, right: 10 }}
          />
        </span>
      </p>
    );
  });
  return [missFields, <div>{fieldsRenders}</div>];
}

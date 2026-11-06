import React from 'react';
import intl from 'utils/intl';
import style from './index.less';

export default function getFields({ columns }) {
  columns.splice(1, 0, {
    name: 'productAttribute',
    width: 150,
    header: intl.get(`mcux.common.view.specification`).d('规格'),
    renderer: ({ record }) => {
      const productAttribute = record.get('productAttribute');
      return (
        <div>
          <div className={style['custom-info']}>
            <div className="custom-content">
              {(productAttribute || [])
                ?.map(({ pValue, pName }) => `${pName}: ${pValue}`)
                .join(`;\xa0\xa0\xa0`)}
            </div>
          </div>
        </div>
      );
    },
  });
  return columns;
}

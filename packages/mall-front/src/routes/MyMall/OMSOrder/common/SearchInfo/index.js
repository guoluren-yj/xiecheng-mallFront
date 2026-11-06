import React from 'react';
import { Icon } from 'choerodon-ui';

import intl from 'utils/intl';
import style from './index.less';

export default function Search(props) {
  const { searchMoreParams, label, setState } = props;
  const keys = Object.keys(searchMoreParams).filter(
    (key) => !!searchMoreParams[key] && key !== 'startDate' && key !== 'beginDate'
  );

  function deleteSearch(key) {
    const newParams = JSON.parse(JSON.stringify(searchMoreParams));
    if (key === 'endDate') {
      delete newParams.endDate;
      delete newParams.startDate;
      if (newParams.beginDate) {
        delete newParams.beginDate;
      }
    } else {
      delete newParams[key];
    }
    delete newParams[key];
    const newState = { searchMoreParams: newParams };
    if (key === 'orderCode') {
      newState.textFieldVal = '';
    }
    setState(newState);
  }
  return (
    <>
      {keys.length > 0 && (
        <div className={style['search-info']}>
          <div className="search-info-label">
            {intl.get('mallf.myOrder.view.advanced.query').d('高级查询条件')}：
          </div>
          <div className="search-info-content">
            {keys.map((key) => {
              if (key === 'endDate') {
                return (
                  <div className="search-info-item">
                    <span>{label.createDate}：</span>
                    <span>
                      {`${searchMoreParams.startDate || searchMoreParams.beginDate} ~ ${
                        searchMoreParams.endDate
                      }`}
                    </span>
                    <Icon type="close" onClick={() => deleteSearch(key)} />
                  </div>
                );
              } else {
                return (
                  <div className="search-info-item">
                    <span>{label[key]}：</span>
                    <span>{searchMoreParams[key]}</span>
                    <Icon type="close" onClick={() => deleteSearch(key)} />
                  </div>
                );
              }
            })}
          </div>
        </div>
      )}
    </>
  );
}

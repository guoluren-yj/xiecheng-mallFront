import React from 'react';
import { compose } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import { connect } from 'dva';

// import intl from 'utils/intl';
import Theme from './Theme';
import Goods from './Goods';
import style from './index.less';

import Header from './Header';

function Home(props) {
  const { dispatch, previewInfo } = props;
  const { mallType, unitId } = previewInfo || {};
  return (
    <>
      <Header mallType={mallType} unitId={unitId} dispatch={dispatch} finish />
      <div />
      <div className={style.home}>
        <Theme />
        <Goods />
      </div>
    </>
  );
}

export default compose(
  connect(({ global }) => ({
    previewInfo: global.previewInfo,
  })),
  formatterCollections({ code: 'mallf.home' })
)(Home);

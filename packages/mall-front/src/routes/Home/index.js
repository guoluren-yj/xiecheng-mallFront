import React, {useEffect} from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import Theme from './Theme';
import Goods from './Goods';
import style from './index.less';
import CuxFn from '@/cuxTools/cuxFn';

function Home() {
  useEffect(() => {
    CuxFn({ name: 'Layout-fn-initHome' })();
  }, []);
  return (
    <div className={style.home}>
      <Theme />
      <Goods />
    </div>
  );
}

export default formatterCollections({ code: ['mallf.home'] })(Home);

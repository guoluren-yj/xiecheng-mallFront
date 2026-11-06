import React, { useState, useEffect } from 'react';
import { Popover } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import CompareOrderDetail from 'components/ViewCompareList/CompareOrderDetail';
import './index.less';

export default function ViewCompareList(props) {
  const { productCompare = {} } = props || {};
  const [compareVisible, setCompareVisible] = useState(false);
  const { scrollTop } = document.body || {};

  const handleScrollTop = () => {
    document.body.scrollTop = scrollTop;
  };

  useEffect(() => {
    document.body.addEventListener('scroll', handleScrollTop);
    return () => {
      document.body.removeEventListener('scroll', handleScrollTop);
    };
  }, []);

  return (
    <Popover
      content={
        <CompareOrderDetail productCompare={productCompare} setCompareVisible={setCompareVisible} />
      }
      placement="rightTop"
      overlayClassName="compare-view-popver"
      overlayStyle={{ width: 400 }}
      trigger="click"
      visible={!!compareVisible}
      onVisibleChange={(vis) => setCompareVisible(vis)}
    >
      <Button funcType="link" color="primary">
        {intl.get('mallf.myRequest.view.compare.botton').d('查看比价单')}
      </Button>
    </Popover>
  );
}

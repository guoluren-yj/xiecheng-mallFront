import React, { useEffect, useState } from 'react';

import Link from 'components/Link';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import request from 'utils/request';

function QuickLink() {
  const [ipUrl, setIpUrl] = useState();

  useEffect(() => {
    request(`/sitf/v1/${getCurrentOrganizationId()}/execute-exp/generic/scux-common1`, {
      headers: {
        'H-Menu-Id': null,
      },
    }).then((res) => {
      setIpUrl(res?.transferUrl);
    });
  }, []);

  return (
    <>
      {ipUrl && (
        <li className="user-panel-info">
          <span className="top-menu-link">
            <Link to={ipUrl}>
              <span>{intl.get('mcux.common.inja.view.myWallet').d('我的钱包')}</span>
            </Link>
          </span>
        </li>
      )}
    </>
  );
}

export default QuickLink;

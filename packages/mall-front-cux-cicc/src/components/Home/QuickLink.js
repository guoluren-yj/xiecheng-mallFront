import React, { useEffect, useState } from 'react';

import Link from 'components/Link';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import request from 'utils/request';

function QuickLink() {
  const [jumpUrl, setJumpUrl] = useState();

  useEffect(() => {
    request(
      `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/xHZic1gmXdEytLW33fxhQCchxL7rlIkIJibAUlOLQhzbw`,
      {
        headers: {
          'H-Menu-Id': null,
        },
      }
    ).then((res) => {
      setJumpUrl(res?.jumpUrl);
    });
  }, []);

  return (
    <>
      {jumpUrl && (
        <li className="user-panel-info">
          <span className="top-menu-link">
            <Link to={jumpUrl}>
              <span>{intl.get('mcux.common.cicc.view.jumpUrlA').d('财务共享EC')}</span>
            </Link>
          </span>
        </li>
      )}
    </>
  );
}

export default QuickLink;

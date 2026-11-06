import React, { useEffect } from 'react';
import { connect } from 'dva';
import { isEmpty } from 'lodash';

import Link from 'components/Link';
import { FOOTER_PADDING_BOTTOM } from 'utils/constants';
import styles from './index.less';

// const compare = property => (a, b) => {
//   const value1 = a[property];
//   const value2 = b[property];
//   return value1 - value2;
// };

function BottomInfo(props) {
  const { constants, bottomEnable, pageBottomList = [], recordEnable, data } = props;
  const { bottomType } = data || {};
  useEffect(() => {
    if (pageBottomList?.length > 0 && bottomEnable && document.getElementById('bottom-info')) {
      // eslint-disable-next-line no-unused-expressions
      props.dispatch({
        type: 'global/update',
        payload: {
          constants: {
            ...constants,
            footerPaddingBottom:
              (recordEnable === 1 ? FOOTER_PADDING_BOTTOM : 30) +
              document.getElementById('bottom-info').clientHeight,
          },
        },
      });
    }
  }, [pageBottomList]);

  const width = 1190 / pageBottomList?.length;

  const qrCodeData = pageBottomList?.filter((p) => p.bottomType === 1)?.[0] || {};
  return (
    <div id="bottom-info">
      {pageBottomList?.filter((p) => p.bottomType !== 1)?.length > 0 && (
        <div className={styles.container}>
          <div className="content container">
            {pageBottomList
              ?.filter((p) => p.bottomType !== 1)
              ?.map((p) => (
                <div className="bottom-info-item" style={{ width }}>
                  <div style={{ width: '80%', margin: '0 auto' }}>
                    <p className="info-item-title text-overflow"> {p.bottomTitle}</p>
                    {p?.pageBottomLineList?.map((b) => (
                      <div className="info-item-item text-overflow">
                        {b.linkUrl ? (
                          <Link to={b.linkUrl}>{b.description}</Link>
                        ) : (
                          <span>{b.description}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            {bottomType === 1 && !isEmpty(qrCodeData) && (
              <div className="bottom-info-item" style={{ width }}>
                <div style={{ width: '80%', margin: '0 auto' }}>
                  <p className="info-item-title text-overflow"> {qrCodeData?.bottomTitle}</p>
                  <img
                    style={{ width: 78, height: 78 }}
                    src={qrCodeData?.pageBottomLineList?.[0]?.linkUrl}
                    alt=""
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default connect(({ global }) => ({ data: global.webConfig, constants: global.constants }))(
  BottomInfo
);

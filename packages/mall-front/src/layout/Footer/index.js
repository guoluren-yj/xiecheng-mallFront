/**
 * footer - 商城底部
 * @date: 2019-08-28
 * @author: GM <ming.gao03@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import React from 'react';
import { connect } from 'dva';

import intl from 'utils/intl';
import WYSIWYGViewer from 'components/WYSIWYGViewer';
import BottomInfo from '@/layout/Footer/BottomInfo';

import style from './index.less';

function Footer(props) {
  const {
    webConfig: { recordInformation, recordEnable, bottomEnable, pageBottomList },
    dispatch,
  } = props;

  return (
    <div>
      <footer
        id="footer"
        className={style.footer}
        // style={!isSecondWebSite ? { height: 310 } : { height: 62 }}
      >
        {bottomEnable === 1 && (
          <BottomInfo
            dispatch={dispatch}
            pageBottomList={pageBottomList}
            bottomEnable={bottomEnable}
            recordEnable={recordEnable}
          />
        )}
        {recordEnable === 1 && (
          <div
            className="footer-container"
            style={{ minHeight: 22, padding: '20px 0' }}
            id="footer-copyright"
          >
            {recordInformation && recordInformation !== JSON.stringify([{ insert: '\n' }]) ? (
              <div className="footer-icp-info">
                <WYSIWYGViewer data={recordInformation} />
              </div>
            ) : (
              <div className="footer-icp">
                CopyRight@2018&nbsp;
                {intl
                  .get(`mallf.common.view.footer`)
                  .d('上海甄云信息科技有限公司 | 沪ICP备18039109号-3')}
                &nbsp;
              </div>
            )}
          </div>
        )}
      </footer>
    </div>
  );
}

export default connect(({ global }) => ({
  webConfig: global.webConfig,
  language: global.language,
}))(Footer);

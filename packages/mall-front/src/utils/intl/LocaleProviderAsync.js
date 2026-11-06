import React, { useState, useEffect } from 'react';
import { ConfigProvider } from 'hzero-ui';
import { LocaleProvider as C7NLocaleProvider } from 'choerodon-ui';
import { localeContext } from 'choerodon-ui/pro';
import { connect } from 'dva';
import moment from 'moment';
import 'moment/locale/zh-cn';
import 'moment/locale/en-gb';
import 'moment/locale/ja';

import { resolveRequire } from 'utils/utils';
import { getHzeroUILocale, getC7nLocale, getC7nProLocale } from 'services/localeApi';

function LocalProviderAsync(props) {
  const { userInfo } = props;
  const [antdLocale, setAntdLocale] = useState({});
  const [c7nLocale, setC7nLocale] = useState({});
  useEffect(() => {
    const { language } = userInfo;
    if (language) {
      getHzeroUILocale(language).then((langData) => {
        setAntdLocale(langData);
        moment.locale(resolveRequire(langData).locale);
      });
      getC7nLocale(language).then((langData) => {
        setC7nLocale(langData);
        moment.locale(resolveRequire(langData).locale);
      });
      getC7nProLocale(language).then((langData) => {
        localeContext.setLocale(resolveRequire(langData));
        moment.locale(resolveRequire(langData).locale);
      });
    }
  }, [userInfo]);

  return (
    <C7NLocaleProvider locale={c7nLocale}>
      <ConfigProvider {...props} locale={antdLocale} />
    </C7NLocaleProvider>
  );
}

export default connect(({ global }) => ({
  userInfo: global.userInfo,
  needLanguage: global.needLanguage,
}))(LocalProviderAsync);

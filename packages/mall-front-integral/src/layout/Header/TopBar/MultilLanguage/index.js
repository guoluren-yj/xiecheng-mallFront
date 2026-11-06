/* eslint-disable no-unused-expressions */
import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { localeContext } from 'choerodon-ui/pro';

import { checkoutLanguage, languageTypes } from 'services/api';

function MultilLanguage(props) {
  const { languageName } = props;
  const [langList, setLangList] = useState([]);
  useEffect(() => {
    setTimeout(() => {
      languageTypes().then((res) => {
        setLangList(res);
        if (res) {
          const langSupports = {};
          res?.forEach((lang) => {
            langSupports[lang.value] = lang.meaning;
          });
          localeContext.setSupports(langSupports);
        }
      });
    }, 1000);
  }, []);

  const changeLanguage = (lang) => {
    if (props.language !== lang) {
      checkoutLanguage(lang).then(() => {
        window.location.reload();
      });
    }
  };

  return (
    <span className="top-menu-link" style={{ marginRight: 45 }}>
      <span className="link-popup">{languageName}</span>
      <ul className="top-menu-list top-scroll">
        {langList.map((item) => (
          <ul
            key={item.id}
            onClick={() => {
              changeLanguage(item.code, item.name);
            }}
          >
            <a>{item.name}</a>
          </ul>
        ))}
      </ul>
    </span>
  );
}

export default connect(({ global }) => ({
  language: global.language,
  languageName: global.languageName,
}))(MultilLanguage);

/* eslint-disable no-unused-expressions */
import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Menu, Dropdown, localeContext } from 'choerodon-ui/pro';

import { checkoutLanguage, getTenantLanguages } from 'services/api';

function MultilLanguage(props) {
  const { languageName } = props;
  const [langList, setLangList] = useState([]);
  useEffect(() => {
    setTimeout(() => {
      getTenantLanguages().then((res) => {
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
      <Dropdown
        overlay={
          <Menu>
            {langList.map((item) => (
              <Menu.Item
                onClick={() => {
                  changeLanguage(item.code, item.name);
                }}
              >
                <a>{item.name}</a>
              </Menu.Item>
            ))}
          </Menu>
        }
      >
        <span className="link-popup">{languageName}</span>
      </Dropdown>
    </span>
  );
}

export default connect(({ global }) => ({
  language: global.language,
  languageName: global.languageName,
}))(MultilLanguage);

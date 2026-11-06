import React from 'react';
import { connect } from 'dva';
import { Spin } from 'hzero-ui';
import { isArray, isString } from 'lodash';
import { getCurrentOrganizationId, getUserConfigInfo } from '../utils';
import intl from '.';
import { fetchMeunId } from '../../services/api';
import loadPromptLocale from './loadPromptLocale';

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default function formatterCollections({ code = '' } = {}) {
  const { needLanguage } = getUserConfigInfo();
  return (Component) => {
    class IntlComponent extends React.Component {
      static displayName = `IntlComponent(${getDisplayName(Component)})`;

      state = {
        localeLoaded: false,
      };

      loading = false;

      currentLanguage = null;

      async loadLocale(language) {
        if (language && this.currentLanguage !== language) {
          // 必须要 language 有值
          this.currentLanguage = language;
          const multipleCode = isString(code) ? [code] : isArray(code) ? code : [];
          if (multipleCode.length) {
            this.loading = true;
            try {
              const organizationId = getCurrentOrganizationId() || 0;
              window.menuCache = window.menuCache || {};
              if (!window.menuCache[window.location.pathname]) {
                const menu = await fetchMeunId();
                window.menuCache[window.location.pathname] = menu;
              }
              if (needLanguage) {
                await Promise.all(
                  multipleCode.map((mCode) => loadPromptLocale(organizationId, language, mCode))
                );
              }
            } finally {
              this.loading = false;
              this.setState({
                localeLoaded: true,
              });
            }
          } else {
            this.setState({
              localeLoaded: true,
            });
          }
        }
      }

      componentDidMount() {
        const { language } = this.props;
        this.loadLocale(language);
      }

      componentDidUpdate() {
        this.loadLocale(this.props.language);
      }

      shouldComponentUpdate() {
        return !this.loading;
      }

      render() {
        const { localeLoaded } = this.state;
        return localeLoaded ? <Component intl={intl} {...this.props} /> : <Spin />;
      }
    }

    return connect(({ global = {} }) => ({
      language: global.language,
    }))(IntlComponent);
  };
}

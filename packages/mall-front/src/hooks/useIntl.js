import { isArray, isString } from 'lodash';
import intl from 'utils/intl';
import { fetchMeunId, queryPromptLocale } from 'services/api';
import { getCurrentOrganizationId, getUserConfigInfo } from 'utils/utils';

// const commonPromptKey = [
//   'hzero.common',
//   'mallf.common',
//   'mallf.myMall',
//   'mallf.header',
//   'himp.commentImport',
//   'hmsg.userMessage',
//   'mcux.common',
// ];

const intlLoadPromise = (orgId, lang, promptKey) => queryPromptLocale(orgId, lang, promptKey);

const cache = window.intlCache || (window.intlCache = new Map());

export async function loadLocale(language, promapList = [], callBack = (e) => e, initFetch) {
  const { routerData, needLanguage } = getUserConfigInfo();
  const currentPath = window.location.pathname;
  const filterRouter = Object.values(routerData).find((val) => val.path === currentPath);
  const code = [...promapList, ...(filterRouter?.promptKey?.split(',') || [])];
  let currentLanguage = null;
  if (language && currentLanguage !== language) {
    // 必须要 language 有值
    currentLanguage = language;
    let currentCacheLang;
    if (cache.has(language)) {
      currentCacheLang = cache.get(language);
    } else {
      currentCacheLang = new Map();
      cache.set(language, currentCacheLang);
    }
    let promptKey = '';
    const multipleCode = [];
    if (isString(code)) {
      if (!currentCacheLang.get(code)) {
        promptKey = code;
        currentCacheLang.set(code, true);
      }
    } else if (isArray(code)) {
      code.forEach((c) => {
        if (!currentCacheLang.get(c)) {
          currentCacheLang.set(c, true);
          multipleCode.push(c);
        }
      });
      promptKey = multipleCode.join(',');
    }
    if (promptKey) {
      try {
        const organizationId = getCurrentOrganizationId() || 0;
        window.menuCache = window.menuCache || {};
        if (!window.menuCache[currentPath] && !initFetch) {
          const menu = await fetchMeunId();
          window.menuCache[currentPath] = menu;
        }
        if (needLanguage) {
          const data = await intlLoadPromise(organizationId, language, promptKey);
          if (data) {
            intl.load({
              [language]: data,
            });
            return;
          }
        }
        // 语言没有加载成功
        if (isArray(code)) {
          code.forEach((c) => {
            currentCacheLang.delete(c);
          });
        } else {
          currentCacheLang.delete(code);
        }
      } finally {
        callBack();
      }
    } else {
      callBack();
    }
  }
}

function initIntl(lang, promapList = [], updateStore = (e) => e, initFetch) {
  if (lang) {
    loadLocale(
      lang,
      promapList,
      () => {
        updateStore();
        if (intl?.init) {
          intl.init({
            currentLocale: lang,
            locales: intl.options.locales,
          });
        }
      },
      initFetch
    );
  }
}

export default initIntl;

import { isEmpty } from 'lodash';

import { getCurrentLanguage } from 'utils/utils';
import request from 'utils/request';

export default function usePromaptInsert() {
  if (window.promaptInsertTimer) {
    clearTimeout(window.promaptInsertTimer);
  }
  window.promaptInsertTimer = setTimeout(() => {
    if (getCurrentLanguage() === 'zh_CN') {
      const allKeys = Array.from(
        new Set(
          Object.keys(window.intl?.options?.locales['zh_CN']).map((p) => {
            return p.split('.').slice(0, 2).join('.');
          })
        )
      );
      const missKeys = Array.from(
        new Set(
          window.intl?.missPrompt
            .map((p) => p.key)
            .map((p) => {
              return p.split('.').slice(0, 2).join('.');
            })
        )
      );
      const errorKeys = [];
      missKeys.forEach((m) => {
        if (!allKeys.some((a) => a === m)) {
          errorKeys.push(m);
        }
      });
      if (!isEmpty(errorKeys)) {
        console.error(`当前页面缺失以下多语言模板${errorKeys}`);
      }
      request('/hpfm/v1/prompt-translate/insert', {
        method: 'POST',
        body: JSON.stringify(window.intl?.missPrompt || []),
        swal: false,
      }).then(() => {
        window.intl.missPrompt = [];
      });
    }
  }, 1000);
}

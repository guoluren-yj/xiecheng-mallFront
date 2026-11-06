import React from 'react';
import { BackTop } from 'choerodon-ui';

import { getUserConfigInfo } from 'utils/utils';
import useScroll from '@/hooks/useScroll';

export default function BotomBackTop() {
  const { scrollBottom } = useScroll();
  const {
    constants: { footerPaddingBottom },
  } = getUserConfigInfo();
  return (
    <BackTop
      style={{
        right: (window.innerWidth - 1190 - 50 - 80) / 2,
        bottom:
          scrollBottom - footerPaddingBottom + 82 > 0
            ? 82
            : 82 - (scrollBottom - footerPaddingBottom + 82),
      }}
      visibilityHeight={1.5 * window.innerHeight}
      target={() => document.body}
    />
  );
}

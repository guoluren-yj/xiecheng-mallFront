import React from 'react';

import components from 'cuxTools/components';

export default function CuxWrapper({ path, value = {}, children }) {
  const Cux = components?.[path]?.component || components?.[path];
  if (!components) {
    console.error(`【${path}】组件异常`);
  }
  if (path && Cux) {
    return <Cux {...(value || {})}>{children}</Cux>;
  } else {
    return children || null;
  }
}

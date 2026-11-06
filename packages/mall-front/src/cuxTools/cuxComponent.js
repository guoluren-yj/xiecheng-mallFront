import React from 'react';

import components from 'cuxTools/components';

export default function cuxComponent({ path, isFn }) {
  const Cux = components?.[path]?.component || components?.[path];
  if (!components) {
    console.error(`【${path}】组件异常`);
  }
  return (Component) => {
    function CuxComponent(props) {
      if (path && Cux) {
        return <Cux {...props} />;
      } else {
        return <Component {...props} />;
      }
    }
    if (isFn) {
      return Cux || Component;
    }
    return CuxComponent;
  };
}

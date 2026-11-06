import React from 'react';

import ComRouter from 'mall-front/lib/router';
import Layout from './layout/LayoutWraper';

export default function App(props) {
  return <ComRouter {...props} ConvertLayout={Layout} />;
}

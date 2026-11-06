import React from 'react';

import ComRouter from 'mall-front/lib/router';
import Layout from './Layout';

export default function App(props) {
  return <ComRouter {...props} ConvertLayout={Layout} />;
}

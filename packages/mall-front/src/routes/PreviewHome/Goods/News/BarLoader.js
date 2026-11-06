import React from 'react';
import { Skeleton } from 'choerodon-ui';
// import ContentLoader from 'react-content-loader';

export default function BarLoader({ rows }) {
  return <Skeleton active paragraph={{ width: '100%', rows }} title={false} />;
}

// const BarLoader = props => (
//   <ContentLoader
//     height={400}
//     width={1186}
//     speed={1}
//     primaryColor="#efefef"
//     secondaryColor="#dfdfdf"
//     {...props}
//   >
//     <rect x="0" y="14" rx="5" ry="5" width="226" height="212" />
//     <rect x="240" y="14" rx="5" ry="5" width="226" height="212" />
//     <rect x="480" y="14" rx="5" ry="5" width="226" height="212" />
//     <rect x="720" y="14" rx="5" ry="5" width="226" height="212" />
//     <rect x="960" y="14" rx="5" ry="5" width="226" height="212" />
//     <rect x="1" y="240" rx="4" ry="4" width="61" height="13" />
//     <rect x="80" y="240" rx="4" ry="4" width="120" height="13" />
//     <rect x="1" y="260" rx="4" ry="4" width="140" height="13" />

//     <rect x="241" y="240" rx="4" ry="4" width="61" height="13" />
//     <rect x="320" y="240" rx="4" ry="4" width="120" height="13" />
//     <rect x="241" y="260" rx="4" ry="4" width="140" height="13" />

//     <rect x="481" y="240" rx="4" ry="4" width="61" height="13" />
//     <rect x="560" y="240" rx="4" ry="4" width="120" height="13" />
//     <rect x="481" y="260" rx="4" ry="4" width="140" height="13" />

//     <rect x="721" y="240" rx="4" ry="4" width="61" height="13" />
//     <rect x="800" y="240" rx="4" ry="4" width="120" height="13" />
//     <rect x="721" y="260" rx="4" ry="4" width="140" height="13" />

//     <rect x="961" y="240" rx="4" ry="4" width="61" height="13" />
//     <rect x="1040" y="240" rx="4" ry="4" width="120" height="13" />
//     <rect x="961" y="260" rx="4" ry="4" width="140" height="13" />
//   </ContentLoader>
// );

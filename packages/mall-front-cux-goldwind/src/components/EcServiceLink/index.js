import React, { useState, useEffect } from 'react';
import { getEcServiceLink } from '@/services';

export default function EcServiceLink(props) {
  const { params } = props;
  const [linkUrl, setLinkUrl] = useState(null);

  useEffect(() => {
    if (!linkUrl) {
      getEcServiceLink(params).then((res) => {
        if (res) {
          setLinkUrl(res.url);
        }
      });
    }
  }, [params.orderSourceFrom]);

  return (
    <a className="primary-color" target="_blank" rel="noopener noreferrer" href={linkUrl}>
      联系客服
    </a>
  );
}

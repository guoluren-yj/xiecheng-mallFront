import { useEffect } from 'react';
import { getUserConfigInfo } from 'utils/utils';
import * as HmallConfig from 'mall-front/lib/utils/api-config';

export default function ComplaintWorkbench(props) {
  const { history } = props;
  useEffect(() => {
    const {
      webConfig: { isSecondWebSite, srmUrl },
    } = getUserConfigInfo();
    const url = `${
      isSecondWebSite ? `${srmUrl}/app` : HmallConfig.srmPath
    }/scux/complaint-workbench/list`;
    window.open(url, '_blank');
    history.goBack();
  }, [history]);
  return null;
}

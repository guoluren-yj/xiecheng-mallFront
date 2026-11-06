import { useEffect, useRef } from 'react';
import { isEmpty } from 'lodash';

const useValidKeyword = (locationParams) => {
  const validKeyWordFlag = useRef(true);
  const reKeyWordFunc = (keyword) => {
    // 校验仅特殊字符时
    const numberRe = /\d/;
    const englishRe = /[a-zA-z]/;
    const chineseRe = /[\u4E00-\u9FA5]/;
    return ![numberRe, englishRe, chineseRe].some((r) => keyword?.match(r));
  };
  useEffect(() => {
    // 监听搜索关键字 路由搜索关键字不合法进行拦截 不进行搜索
    if (
      isEmpty(locationParams) ||
      (Object.keys(locationParams).length < 3 && (locationParams.keyword?.trim() ?? '') === '') ||
      (locationParams && locationParams.keyword && reKeyWordFunc(locationParams.keyword))
    ) {
      validKeyWordFlag.current = false;
    } else {
      validKeyWordFlag.current = true;
    }
  }, [locationParams]);
  return validKeyWordFlag;
};

export default useValidKeyword;

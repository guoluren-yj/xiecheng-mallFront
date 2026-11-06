import { math } from 'choerodon-ui/dataset';

import BigNumber from 'bignumber.js';
import { getCurrentLanguage } from './utils';

/**
 * 格式化大数值并返回字符串
 * @param v 大数值
 * @param dp 保留的位数
 * @param rm 舍入规则
 * @param format 格式，详见：https://mikemcl.github.io/bignumber.js/#toFor
 * @returns {string}
 */
export const toFormat = (
  v,
  dp,
  rm = BigNumber.ROUND_HALF_CEIL,
  format = NumberLocale[getCurrentLanguage()] || NumberLocale.zh_CN
) => {
  return new BigNumber(v).toFormat(dp, rm, format);
};

export const NumberLocale = {
  ar_SA: {
    language: 'Arabic', // 语言
    desc: 'Arabic (Saudi Arabia)', // 描述,
    prefix: '', // 格式化前缀
    decimalSeparator: '٫', // 小数分隔符
    groupSeparator: '٬', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  bn_BD: {
    language: 'Bangla',
    desc: 'Bangladesh Bangla (Bangladesh)',
    prefix: '', // 格式化前缀
    decimalSeparator: '.', // 小数分隔符
    groupSeparator: ',', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 2, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  bn_IN: {
    language: 'Bangla',
    desc: 'India Bangla (India)',
    prefix: '', // 格式化前缀
    decimalSeparator: '.', // 小数分隔符
    groupSeparator: ',', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 2, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  cs_CZ: {
    language: 'Czech',
    desc: 'Czech Republic Czech (Czech Republic)',
    prefix: '', // 格式化前缀
    decimalSeparator: ',', // 小数分隔符
    groupSeparator: ' ', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  da_DK: {
    language: 'Danish',
    desc: 'Denmark Danish (Denmark)',
    prefix: '', // 格式化前缀
    decimalSeparator: ',', // 小数分隔符
    groupSeparator: '.', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  de_AT: {
    language: 'German',
    desc: 'Austria Austrian German',
    prefix: '', // 格式化前缀
    decimalSeparator: ',', // 小数分隔符
    groupSeparator: ' ', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  de_CH: {
    language: 'German',
    desc: 'Switzerland  German',
    prefix: '', // 格式化前缀
    decimalSeparator: '.', // 小数分隔符
    groupSeparator: '’', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  de_DE: {
    language: 'German',
    desc: 'Germany Standard German (as spoken in Germany)',
    prefix: '', // 格式化前缀
    decimalSeparator: ',', // 小数分隔符
    groupSeparator: '.', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  el_GR: {
    language: 'Greek',
    desc: 'Greece Modern Greek',
    prefix: '', // 格式化前缀
    decimalSeparator: ',', // 小数分隔符
    groupSeparator: '.', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  en_AU: {
    language: 'English',
    desc: 'Australia Australian English',
    prefix: '', // 格式化前缀
    decimalSeparator: '.', // 小数分隔符
    groupSeparator: ',', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  en_CA: {
    language: 'English',
    desc: 'Canada Canadian English',
    prefix: '', // 格式化前缀
    decimalSeparator: '.', // 小数分隔符
    groupSeparator: ',', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  en_GB: {
    language: 'English',
    desc: 'United Kingdom British English',
    prefix: '', // 格式化前缀
    decimalSeparator: '.', // 小数分隔符
    groupSeparator: ',', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  en_IE: {
    language: 'English',
    desc: 'Ireland Irish English',
    prefix: '', // 格式化前缀
    decimalSeparator: '.', // 小数分隔符
    groupSeparator: ',', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  en_IN: {
    language: 'English',
    desc: 'India Indian English',
    prefix: '', // 格式化前缀
    decimalSeparator: '.', // 小数分隔符
    groupSeparator: ',', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 2, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  en_NZ: {
    language: 'English',
    desc: 'New Zealand New Zealand English',
    prefix: '', // 格式化前缀
    decimalSeparator: '.', // 小数分隔符
    groupSeparator: ',', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  en_US: {
    language: 'English',
    desc: 'United States US English',
    prefix: '', // 格式化前缀
    decimalSeparator: '.', // 小数分隔符
    groupSeparator: ',', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  en_ZA: {
    language: 'English',
    desc: 'South Africa English (South Africa)',
    prefix: '', // 格式化前缀
    decimalSeparator: ',', // 小数分隔符
    groupSeparator: ' ', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  es_AR: {
    language: 'Spanish',
    desc: 'Argentina Argentine Spanish',
    prefix: '', // 格式化前缀
    decimalSeparator: ',', // 小数分隔符
    groupSeparator: '.', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  es_CL: {
    language: 'Spanish',
    desc: 'Chile Chilean Spanish',
    prefix: '', // 格式化前缀
    decimalSeparator: ',', // 小数分隔符
    groupSeparator: '.', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  es_CO: {
    language: 'Spanish',
    desc: 'Columbia Colombian Spanish',
    prefix: '', // 格式化前缀
    decimalSeparator: ',', // 小数分隔符
    groupSeparator: '.', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  es_ES: {
    language: 'Spanish',
    desc: 'Spain Castilian Spanish (as spoken in Central_Northern Spain)',
    prefix: '', // 格式化前缀
    decimalSeparator: ',', // 小数分隔符
    groupSeparator: '.', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  es_MX: {
    language: 'Spanish',
    desc: 'Mexico Mexican Spanish',
    prefix: '', // 格式化前缀
    decimalSeparator: '.', // 小数分隔符
    groupSeparator: ',', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  es_US: {
    language: 'Spanish',
    desc: 'United States American Spanish',
    prefix: '', // 格式化前缀
    decimalSeparator: '.', // 小数分隔符
    groupSeparator: ',', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  fi_FI: {
    language: 'Finnish',
    desc: 'Finland Finnish (Finland)',
    prefix: '', // 格式化前缀
    decimalSeparator: ',', // 小数分隔符
    groupSeparator: ' ', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  fr_BE: {
    language: 'French',
    desc: 'Belgium Belgian French',
    prefix: '', // 格式化前缀
    decimalSeparator: ',', // 小数分隔符
    groupSeparator: ' ', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  fr_CA: {
    language: 'French',
    desc: 'Canada Canadian French',
    prefix: '', // 格式化前缀
    decimalSeparator: ',', // 小数分隔符
    groupSeparator: ' ', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  fr_CH: {
    language: 'French',
    desc: 'Switzerland  French',
    prefix: '', // 格式化前缀
    decimalSeparator: ',', // 小数分隔符
    groupSeparator: ' ', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  fr_FR: {
    language: 'French',
    desc: 'France Standard French (especially in France)',
    prefix: '', // 格式化前缀
    decimalSeparator: ',', // 小数分隔符
    groupSeparator: ' ', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  he_IL: {
    language: 'Hebrew',
    desc: 'Israel Hebrew (Israel)',
    prefix: '', // 格式化前缀
    decimalSeparator: '.', // 小数分隔符
    groupSeparator: '’', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  hi_IN: {
    language: 'Hindi',
    desc: 'India Hindi (India),',
    prefix: '', // 格式化前缀
    decimalSeparator: '.', // 小数分隔符
    groupSeparator: '’', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 2, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  hu_HU: {
    language: 'Hungarian',
    desc: 'Hungary Hungarian (Hungary),',
    prefix: '', // 格式化前缀
    decimalSeparator: ',', // 小数分隔符
    groupSeparator: ' ', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  id_ID: {
    language: 'Indonesian',
    desc: 'Indonesia Indonesian (Indonesia),',
    prefix: '', // 格式化前缀
    decimalSeparator: ',', // 小数分隔符
    groupSeparator: '.', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  it_CH: {
    language: 'Italian',
    desc: 'Switzerland  Italian',
    prefix: '', // 格式化前缀
    decimalSeparator: '.', // 小数分隔符
    groupSeparator: '’', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  it_IT: {
    language: 'Italian',
    desc: 'Italy Standard Italian (as spoken in Italy)',
    prefix: '', // 格式化前缀
    decimalSeparator: ',', // 小数分隔符
    groupSeparator: '.', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  jp_JP: {
    language: 'Japanese',
    desc: 'Japan Japanese (Japan),',
    prefix: '', // 格式化前缀
    decimalSeparator: '.', // 小数分隔符
    groupSeparator: ',', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  ko_KR: {
    language: 'Korean',
    desc: 'Republic of Korea Korean (Republic of Korea),',
    prefix: '', // 格式化前缀
    decimalSeparator: '.', // 小数分隔符
    groupSeparator: ',', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  nl_BE: {
    language: 'Dutch',
    desc: 'Belgium Belgian Dutch,',
    prefix: '', // 格式化前缀
    decimalSeparator: ',', // 小数分隔符
    groupSeparator: '.', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  nl_NL: {
    language: 'Dutch',
    desc: 'The Netherlands Standard Dutch (as spoken in The Netherlands),',
    prefix: '', // 格式化前缀
    decimalSeparator: ',', // 小数分隔符
    groupSeparator: '.', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  no_NO: {
    language: 'Norwegian',
    desc: 'Norway Norwegian (Norway),',
    prefix: '', // 格式化前缀
    decimalSeparator: ',', // 小数分隔符
    groupSeparator: ' ', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  pl_PL: {
    language: 'Polish',
    desc: 'Poland Polish (Poland),',
    prefix: '', // 格式化前缀
    decimalSeparator: ',', // 小数分隔符
    groupSeparator: ' ', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  pt_BR: {
    language: 'Portugese',
    desc: 'Brazil Brazilian Portuguese',
    prefix: '', // 格式化前缀
    decimalSeparator: ',', // 小数分隔符
    groupSeparator: '.', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  pt_PT: {
    language: 'Portugese',
    desc: 'Portugal European Portuguese (as written and spoken in Portugal)',
    prefix: '', // 格式化前缀
    decimalSeparator: ',', // 小数分隔符
    groupSeparator: ' ', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  ro_RO: {
    language: 'Romanian',
    desc: 'Romania Romanian (Romania),',
    prefix: '', // 格式化前缀
    decimalSeparator: ',', // 小数分隔符
    groupSeparator: '.', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  ru_RU: {
    language: 'Russian',
    desc: 'Russian Federation Russian (Russian Federation),',
    prefix: '', // 格式化前缀
    decimalSeparator: ',', // 小数分隔符
    groupSeparator: ' ', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  sk_SK: {
    language: 'Slovak',
    desc: 'Slovakia Slovak (Slovakia),',
    prefix: '', // 格式化前缀
    decimalSeparator: ',', // 小数分隔符
    groupSeparator: ' ', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  sv_SE: {
    language: 'Swedish',
    desc: 'Sweden Swedish (Sweden),',
    prefix: '', // 格式化前缀
    decimalSeparator: ',', // 小数分隔符
    groupSeparator: ' ', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  ta_IN: {
    language: 'Tamil',
    desc: 'India Indian Tamil',
    prefix: '', // 格式化前缀
    decimalSeparator: '.', // 小数分隔符
    groupSeparator: ',', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 2, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  ta_LK: {
    language: 'Tamil',
    desc: 'Sri Lanka Sri Lankan Tamil',
    prefix: '', // 格式化前缀
    decimalSeparator: '.', // 小数分隔符
    groupSeparator: ',', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 2, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  th_TH: {
    language: 'Thai',
    desc: 'Thailand Thai (Thailand),',
    prefix: '', // 格式化前缀
    decimalSeparator: '.', // 小数分隔符
    groupSeparator: ',', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  tr_TR: {
    language: 'Turkish',
    desc: 'Turkey Turkish (Turkey)',
    prefix: '', // 格式化前缀
    decimalSeparator: ',', // 小数分隔符
    groupSeparator: '.', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  zh_CN: {
    language: 'Chinese',
    desc: 'China Mainland China, simplified characters',
    prefix: '', // 格式化前缀
    decimalSeparator: '.', // 小数分隔符
    groupSeparator: ',', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  zh_HK: {
    language: 'Chinese',
    desc: 'Hond Kong Hong Kong, traditional characters',
    prefix: '', // 格式化前缀
    decimalSeparator: '.', // 小数分隔符
    groupSeparator: ',', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
  zh_TW: {
    language: 'Chinese',
    desc: 'Taiwan Taiwan, traditional characters',
    prefix: '', // 格式化前缀
    decimalSeparator: '.', // 小数分隔符
    groupSeparator: ',', // 千分位分隔符
    groupSize: 3, // 千分位位数
    secondaryGroupSize: 0, // 第二级分割位数
    fractionGroupSeparator: '', // 小数千分位分隔符
    fractionGroupSize: 0, // 小数千分位大小
    suffix: '', // 格式化后缀
  },
};

export const getNumberLocalized = (value, precision, language = getCurrentLanguage()) => {
  // 语言环境传入
  // 中文：zh_CN 英文：en_US 德语：de_DE 日语：ja_JP
  // 小数位数
  // const decimalPointCount = math.dp(value);

  const format = NumberLocale[language] || NumberLocale.zh_CN;

  if (!math.isNaN(value)) {
    // 精度是否大于或等于小数位标识 // 最长10位
    // const isPrecisionFlag = precision - decimalPointCount >= 0;
    if (
      precision !== '' &&
      typeof precision !== 'undefined' &&
      precision !== null &&
      !isNaN(Number(precision))
      // isPrecisionFlag
    ) {
      return toFormat(value, precision, BigNumber.ROUND_HALF_CEIL, format);
    }
    // 最多显示20位小数
    return toFormat(value, Math.min(math.dp(value), 20), BigNumber.ROUND_HALF_CEIL, format);
  }
  return value;
};

/*
 * 保留小数
 * @param {*} value 数值
 * @param {*} precision 财务精度
 * @param {*} type 是否为需要展示财务精度的价格 财务精度需要补0，单价精度不补0，
 * // 保留2-10位小数
 */

export default function numberRender(value, precison = 0, type) {
  if (Array.isArray(value)) {
    const [product, key] = value;
    return (
      product?.[`${key}Meaning`] ?? product?._innerMap?.[`${key}Meaning`] ?? product?.[key] ?? '-'
    );
  }
  if (typeof value === 'string' && value.includes('*')) {
    // 商品详情页、购物车页价格隐藏取后端返回
    const showHiddenPrice = [
      '/product-detail',
      '/cata-product-detail',
      '/new-product-detail',
      '/cart',
      '/req-open-cart',
      '/before-order',
      '/my-mall/my-order',
    ].includes(window.location.pathname);
    return showHiddenPrice ? value : '***';
  }
  if (math.isNaN(value) && value !== undefined) {
    return '***';
  }
  if (
    // 空检查
    value === null ||
    value === undefined ||
    value === '' ||
    // 非法数值的检查
    +value === Infinity ||
    +value === -Infinity ||
    math.isNaN(+value)
  ) {
    return '-';
  }
  // const ret = math.toFixed(10);
  // const retList = String(ret).split('.');
  // const floatNum = retList[1] || '';
  const _precison = math.dp(value);
  return getNumberLocalized(value, type ? precison : _precison);
}

/**
 * Constants 常量
 */

/* 设置每页请求条数 */
export const GLOBAL_PAGE_SIZE = 10;
/* 指定每页可以显示多少条，第一个值需保持与 GLOBAL_PAGE_SIZE 一致 */
export const PAGE_SIZE_OPTIONS = ['10', '20', '30'];
/* 默认最大金额 */
export const DEFAULT_MAX = 99999999999999999999;
export const SHOW_DEFAULT_MAX = 999999;

/* 默认前后端交互格式-日期 */
export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD';

/* 默认前后端交互格式-日期时间 */
export const DEFAULT_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/* 默认前后端交互格式-时间 */
export const DEFAULT_TIME_FORMAT = 'HH:mm:ss';

/* 特定格式的日期处理格式，时分秒指定为00:00:00 */
export const DATETIME_MIN = 'YYYY-MM-DD 00:00:00';
/* 特定格式的日期处理格式，时分秒指定为23:59:59 */
export const DATETIME_MAX = 'YYYY-MM-DD 23:59:59';

// 顶部浮动时的空白占位
export const HEADER_NULL_PADDING_TOP = 168;

// 底部占位高度
export const FOOTER_PADDING_BOTTOM = 140;

/* 时区 对应的 moment.utcOffset */
export const timeZone2MomentUTC = {
  'GMT-12': -12,
  'GMT-11': -11,
  'GMT-10': -10,
  'GMT-9': -9,
  'GMT-8': -8,
  'GMT-7': -7,
  'GMT-6': -6,
  'GMT-5': -5,
  'GMT-4': -4,
  'GMT-3': -3,
  'GMT-2': -2,
  'GMT-1': -1,
  GMT: 0,
  'GMT+1': 1,
  'GMT+2': 2,
  'GMT+3': 3,
  'GMT+4': 4,
  'GMT+5': 5,
  'GMT+6': 6,
  'GMT+7': 7,
  'GMT+8': 8,
  'GMT+9': 9,
  'GMT+10': 10,
  'GMT+11': 11,
  'GMT+12': 12,
};

export const accept = [
  '.rar',
  '.zip',
  '.doc',
  '.docx',
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.xls',
  '.xlsx',
  '.csv',
  '.mht',
  '.pptx',
  '.msg',
];

export const imageAccept = ['.jpg', '.jpeg', '.png'];

export const colorMapping = {
  success: {
    bgColor: '#EBF7F1',
    borderColor: '#D3EEE1',
    fontColor: '#47B883',
  },
  danger: {
    bgColor: '#FFEEEB',
    borderColor: '#FDDAD3',
    fontColor: '#F56649',
  },
  warning: {
    bgColor: '#FEF4E2',
    borderColor: '#FEE8C3',
    fontColor: '#FCA400',
  },
  failure: {
    bgColor: '#F0F0F0',
    borderColor: '#CCCCCC',
    fontColor: '#666666',
  },
  blue: {
    bgColor: '#EAF4FD',
    borderColor: '#CEE5FB',
    fontColor: '#3095F2',
  },
  purple: {
    bgColor: '#EBEEF7',
    borderColor: '#D0D8ED',
    fontColor: '#3F5BB5',
  },
};

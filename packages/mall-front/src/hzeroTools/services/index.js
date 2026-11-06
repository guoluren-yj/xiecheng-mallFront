import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
/**
 * 查询TL多语言
 * {HZERO_PLATFORM}/v1/multi-language
 * @export
 * @param {object} params - 查询参数
 * @param {string} params.fieldName - 查询的表单域名称
 * @param {string} params._token - token
 */
export async function queryTL(params) {
  return request(`/hpfm/v1/multi-language`, {
    method: 'GET',
    query: params,
  });
}
/**
 * 值集 值集视图
 * @email WY <yang.wang06@hand-china.com>
 * @creationDate 2019/12/25
 * @copyright HAND ® 2019
 */

/**
 * 统一查询独立、SQL、URL类型的值集
 * {HZERO_PLATFORM}/v1/lovs/data
 * @param {String} lovCode - 值集code
 * @param {Object} params - 额外的查询参数
 */
export async function queryUnifyIdpValue(lovCode, params = {}) {
  return request(`/hpfm/v1/${getCurrentOrganizationId()}/lovs/data`, {
    query: {
      lovCode,
      ...params,
    },
  });
}

/**
 * 查询单个独立值集值
 * {HZERO_PLATFORM}/v1/lovs/value
 * @param {String} lovCode
 */
export async function queryIdpValue(lovCode) {
  return request(`/hpfm/v1/${getCurrentOrganizationId()}/lovs/value`, {
    query: {
      lovCode,
    },
  });
}

/**
 * 批量查询独立值集值
 * {HZERO_PLATFORM}/v1/lovs/value/batch
 * @param {Object} params
 * @example queryMapIdpValue({ level: 'HPFM.LEVEL', dir: 'HPFM.DIRECTION' })
 */
export async function queryMapIdpValue(params) {
  return request(`/hpfm/v1/${getCurrentOrganizationId()}/lovs/value/batch`, {
    query: params,
  });
}
/**
 * 查询 LOV 配置.
 * {HZERO_PLATFORM}/v1/lov-view/info
 * @param {Object} params 参数
 */
export async function queryLov(params) {
  return request(`/hpfm/v1/${getCurrentOrganizationId()}/lov-view/info`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询 LOV 数据.
 * @param {string} url URL
 * @param {Object} params 参数
 */
export async function queryLovData(url, params) {
  return request(url, {
    query: params,
  });
}

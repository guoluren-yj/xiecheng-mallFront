import { getOrganizationId } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';

export function fetchOuterLinkApi(params) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/marmot/v1/${organizationId}/marmot-api/QibT6aibf1XY8Fn2sibicrnYs92PYzjHk7HDtlJSndiaSea4`;
  return request(url, {
    method: 'get',
    query: params,
  });
}

export function fetchApprovalRecordApi(params) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/marmot/v1/${organizationId}/marmot-api/PUnQrmBaCzcB5m7LcOpLuFXGmfZfriaR3ickkR74SU8d68a22bsLVaLMwceelZHRc3`;
  return request(url, {
    method: 'get',
    query: params,
  });
}

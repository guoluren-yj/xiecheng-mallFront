import { coverToolsSet } from 'srm-front-scuz/lib/utils/toolsSet';
import request from 'utils/request';
import intl from 'utils/intl';
import {
  getCurrentOrganizationId,
  getOrganizationId,
  createPagination,
  getCurrentUser,
} from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import { notification } from 'choerodon-ui';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { numberRender } from 'hzero-front/lib/utils/renderer';
import { queryFileList } from 'hzero-front/lib/services/api';
// import C7NUpload from 'srm-front-boot/lib/components/C7NUpload';
import EmbedPage from 'srm-front-boot/lib/components/EmbedPage';
import Lov from './hzeroTools/Lov';
import LovC7N from './hzeroTools/LovC7N';
import TLEditor from './hzeroTools/TLEditor';
import { queryMapIdpValue, queryLov, queryLovData } from './hzeroTools/services';

coverToolsSet({
  getResponse(v) {
    return v;
  },
  request,
  notification,
  intl,
  Lov,
  LovC7N,
  TLEditor,
  yesOrNoRender,
  EmbedPage,
  queryFileList,
  DEFAULT_DATE_FORMAT,
  createPagination,
  queryMapIdpValue,
  queryLovData,
  queryLov,
  getCurrentOrganizationId,
  getUserOrganizationId: getOrganizationId,
  numberRender,
  getCurrentUser,
});

/**
 *通用导入模块
 * @since 2018-9-12
 * @version 0.0.1
 * @author  fushi.wang <fushi.wang@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Button, Upload } from 'hzero-ui';

import Swal from 'components/swal';
import request from 'utils/request';
import HmallConfig from 'utils/api-config';
import intl from 'utils/intl';

const API_HOST = HmallConfig.apiGateway;
export default class UploadExcel extends React.Component {
  state = {
    uploadLoading: false,
  };

  beforeUpload = (file) => {
    const {
      args,
      sync,
      auto,
      prefixPatch,
      templateCode,
      param = {},
      success = (e) => e,
      tenantId,
    } = this.props;
    const formData = new FormData();
    formData.append('excel', file, file.name);
    if (args) {
      formData.append('param', JSON.stringify(args));
    }
    if (prefixPatch && templateCode) {
      const url = auto
        ? `${API_HOST}${prefixPatch}/v1/${tenantId}/import/data/sync/auto-import?templateCode=${templateCode}`
        : sync
        ? `${API_HOST}${prefixPatch}/v1/${tenantId}/import/data/sync/data-upload?templateCode=${templateCode}`
        : `${API_HOST}${prefixPatch}/v1/${tenantId}/import/data/data-upload?templateCode=${templateCode}`;
      this.setState({
        uploadLoading: true,
      });
      request(url, {
        method: 'POST',
        query: param,
        body: formData,
        dataType: 'text',
      })
        .then((res) => {
          if (this.isJson(res) && JSON.parse(res).failed) {
            Swal(JSON.parse(res).message);
          } else if (res) {
            success(res);
          }
        })
        .finally(() => {
          this.setState({
            uploadLoading: false,
          });
        });
    }
    return false;
  };

  isJson = (res) => {
    let result;
    try {
      result = JSON.parse(res);
    } catch (e) {
      return false;
    }
    return typeof result === 'object' && typeof result !== 'string';
  };

  render() {
    const { uploadLoading } = this.state;
    const { disabled = false } = this.props;
    const uploadProps = {
      accept: '.xls,.xlsx,.csv',
      beforeUpload: this.beforeUpload,
      showUploadList: false,
      style: {
        margin: '0 12px',
      },
    };
    return (
      <Upload {...uploadProps}>
        <Button className="label-btn" icon="upload" loading={uploadLoading} disabled={disabled}>
          {intl.get(`mallf.commonImport.view.button.dataUpload`).d('数据上传')}
        </Button>
      </Upload>
    );
  }
}

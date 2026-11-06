import React, { useEffect, useState } from 'react';
import { Radio, Spin } from 'choerodon-ui';
import { Button, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import qs from 'qs';

import HmallConfig from 'utils/api-config';
import { getHeader } from 'utils/request';
import { fetchExportColunms } from 'services/api';
import style from './index.less';
import { getUserConfigInfo } from '@/utils/utils';

export default function ExportExcel(props) {
  const {
    buttonText = intl.get('hzero.common.button.export').d('导出'),
    requestUrl,
    pagination = {
      number: 0,
      size: 10,
    },
    otherButtonProps,
    queryParams = {},
  } = props;

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState('all');
  const [exportColunms, setExportColunms] = useState([]);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      // 获取导出列
      fetchExportColunms(requestUrl)
        .then((res) => {
          if (res) {
            const defaultList = [];
            const exTreeKey = (data) => {
              if (data) {
                defaultList.push(data.id);
                if (Array.isArray(data.children)) {
                  for (let i = 0; i < data.children.length; i++) {
                    exTreeKey(data.children[i]);
                  }
                }
              }
            };
            exTreeKey(res);
            setExportColunms(defaultList);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [visible]);

  function handleExport() {
    setLoading(true);
    const { size, number } = pagination;
    const paginationParams = {
      size,
      page: number,
      pageSize: size,
    };
    const { channel } = getUserConfigInfo();
    let params = {
      type: exportType === 'all' ? 'all' : null,
      size: 10,
      page: 0,
      pageSize: 10,
      async: false,
      exportType: 'DATA',
      fillerType: 'single-sheet',
      singleSheetMaxRow: 1048575,
      singleExcelMaxSheetNum: 5,
      ids: exportColunms,
      queryFlag: queryParams.queryFlag,
      companyId: queryParams.companyId,
      channel,
      ...queryParams,
    };
    if (exportType === 'currentPage') {
      params = {
        ...params,
        ...paginationParams,
      };
    }
    let fileName = '';
    const newUrl =
      !requestUrl.startsWith('/api') && !requestUrl.startsWith('http')
        ? `${HmallConfig.apiGateway}${requestUrl}?`
        : `${requestUrl}?`;
    const newRequestUrl = `${newUrl}${qs.stringify(params, { arrayFormat: 'repeat' })}`;
    fetch(newRequestUrl, {
      method: 'GET',
      responseType: 'blob',
      headers: getHeader(),
    })
      .then((res) => {
        try {
          const { headers } = res;
          // 提取文件名
          const temp = headers
            .get('content-disposition')
            .match(/[fF][iI][Ll][Ee][Nn][Aa][Mm][Ee]=(.*)/)[1];
          fileName = temp;
          if (fileName[0] === "'" || fileName[0] === '"') {
            fileName = fileName.substring(1, fileName.length - 1);
          }
          return res.blob();
        } catch (e) {
          const enc = new TextDecoder('utf-8');
          let err = {};
          err = JSON.parse(enc.decode(new Uint8Array(res)));
          throw err;
        }
      })
      .then((resp) => {
        // 将二进制流转为blob
        const blob = new Blob([resp], { type: 'application/octet-stream' });
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
          // 兼容IE，window.navigator.msSaveBlob：以本地方式保存文件
          window.navigator.msSaveBlob(blob, decodeURI(fileName));
        } else {
          // 创建新的URL并指向File对象或者Blob对象的地址
          const blobURL = window.URL.createObjectURL(blob);
          // 创建a标签，用于跳转至下载链接
          const tempLink = document.createElement('a');
          tempLink.style.display = 'none';
          tempLink.href = blobURL;
          tempLink.setAttribute('download', decodeURI(fileName));
          // 兼容：某些浏览器不支持HTML5的download属性
          if (typeof tempLink.download === 'undefined') {
            tempLink.setAttribute('target', '_blank');
          }
          // 挂载a标签
          document.body.appendChild(tempLink);
          tempLink.click();
          document.body.removeChild(tempLink);
          // 释放blob URL地址
          window.URL.revokeObjectURL(blobURL);
        }
        return true;
      })
      .finally(() => {
        setLoading(false);
        setVisible(false);
      });
  }

  function handleCancel() {
    setVisible(false);
    setExportType('all');
  }

  return (
    <>
      <Button
        {...otherButtonProps}
        icon="unarchive"
        funcType="flat"
        color="primary"
        onClick={() => setVisible(true)}
      >
        {buttonText}
      </Button>
      {visible && (
        <Modal
          border={false}
          style={{ zIndex: 9 }}
          title={intl.get('mallf.common.title.exportConfirm').d('导出确认')}
          visible={visible}
          onOk={handleExport}
          confirmLoading={loading}
          className={style['export-modal']}
          onCancel={handleCancel}
          okText={intl.get('hzero.common.button.confrim').d('确定')}
          cancelText={intl.get('hzero.common.btn.cancel').d('取消')}
          maskClosable={false}
        >
          <Spin spinning={loading}>
            <p className="export-title">
              {intl.get('mallf.common.view.selectExportType').d('您正在导出，请选择您要导出的数据')}
            </p>
            <Radio.Group onChange={(e) => setExportType(e.target.value)} value={exportType}>
              <Radio style={{ display: 'block', marginBottom: 10 }} value="currentPage">
                {intl.get('mallf.common.view.exportCurrentPage').d('当前页面显示数据')}
              </Radio>
              <Radio style={{ display: 'block' }} value="all">
                {intl.get('mallf.common.view.exportAll').d('全部数据')}
              </Radio>
            </Radio.Group>
          </Spin>
        </Modal>
      )}
    </>
  );
}

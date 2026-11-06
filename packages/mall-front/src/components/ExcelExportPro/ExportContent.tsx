import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Spin,
  Form,
  NumberField,
  Select,
  TextField,
  Tree,
  Button,
  DataSet,
  Modal,
  Icon,
  Tooltip,
} from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { FormLayout, LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { NodeRenderer } from 'choerodon-ui/pro/lib/tree/util';
import { ShowHelp } from 'choerodon-ui/pro/lib/field/enum';
import { Renderer } from 'choerodon-ui/pro/lib/field/FormField';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
// import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react-lite';
import { isUndefined } from 'lodash';
// import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'hzero-front/lib/utils/constants';
import notification from 'hzero-front/lib/utils/notification';
import { getCurrentOrganizationId, getResponse } from 'hzero-front/lib/utils/utils';
import { getEnvConfig } from 'hzero-front/lib/utils/iocUtils';
import { ExportTypeEnum, ExportTemplateTypeEnum } from './util';
import OptionMenu from './OptionMenu';
import RenameModal from './RenameModal';
// import styles from './index.less';

const { Option, OptGroup } = Select;

const { HZERO_HMDE } = getEnvConfig();
// const isTenant = isTenantRoleLevel();

const ExportContent: React.FC<any> = observer(props => {
  const {
    queryArea,
    treeArea,
    // exportAsync,
    queryFormItem,
    templateCode,
    modal,
    handleExport,
  } = props;

  const defaultData = {
    templateCode: 'default',
    templateType: ExportTemplateTypeEnum.DEFAULT,
    singleExcelMaxSheetNum: 5,
  };
  const [templateList, setTemplateList] = useState<any>([defaultData]);
  const [currentTemplate, setCurrentTemplate] = useState<any>(defaultData);
  const [showMore, setShowMore] = useState<boolean>(false);
  const [selectValue, setSelectValue] = useState<String>('default');

  const treeParams = queryArea.getState('treeParams');
  const openFlag = treeArea.getState('openFlag');
  // const enableAsync = !!treeParams?.enableAsync || false;
  const showAsync = isUndefined(treeParams?.defaultRequestMode) || true;
  const exportType = treeParams?.type || ExportTypeEnum.Class;
  const changeFlag = treeArea.getState('changeFlag');
  const organizationId = getCurrentOrganizationId();

  const nodeRenderer: NodeRenderer = ({ record }) => {
    return <span style={{ fontWeight: record?.children ? 600 : 400 }}>{record?.get('title')}</span>;
  };

  useEffect(() => {
    if (templateCode && openFlag) {
      queryTemplateList();
    }
  }, [templateCode, openFlag]);

  useEffect(() => {
    if (openFlag) {
      modal.update({
        footer: (
          <>
            <Button
              color={ButtonColor.primary}
              onClick={async () => {
                const flag = await handleExport();
                if (flag) {
                  modal.close();
                }
              }}
            >
              {intl.get('hzero.common.button.confirm.export').d('导出')}
            </Button>
            <Button
              onClick={() => {
                modal.close();
              }}
            >
              {intl.get('hzero.common.button.close').d('关闭')}
            </Button>
          </>
        ),
      });
    }
  }, [openFlag]);

  const queryTemplateList = useCallback(() => {
    axios({
      url: `${HZERO_HMDE}/v1/${organizationId}/business-objects-user-export-templates/list-with-predefined`,
      method: 'GET',
      params: {
        templateCode,
      },
    })
      .then((res: any) => {
        if (getResponse(res)) {
          setTimeout(() => {
            setTemplateList([...res, defaultData]);
          }, 0);
          const first = res.filter(i => i.templateType === ExportTemplateTypeEnum.PREDEFINED);
          if (first?.length > 0) {
            setSelectValue(first[0].templateCode);
            setCurrentTemplate(first[0]);
            resetTreeArea();
            treeArea.setQueryParameter('templateType', first[0].templateType);
            treeArea.setQueryParameter('templateCode', first[0].templateCode);
            treeArea.query();
            const queryData = {
              fillerType: first[0].exportType,
              maxDataCount: first[0].maxDataCount,
              singleExcelMaxSheetNum: first[0].maxSheetCount,
              fileType: first[0].fileType,
              async: 'true',
            };
            queryArea.loadData([queryData]);
          }
        }
      })
      .catch(err => {
        notification.error({
          message: err.message,
        });
      });
  }, []);

  const handleSave = (templateName?: string, isAs?: boolean): void => {
    const columnList: any = [];
    const treeData = treeArea.toData();
    treeData.forEach(i => {
      if (i.businessObjectFieldCode) {
        const lineData = {
          businessObjectFieldCode: i.businessObjectFieldCode,
          businessObjectCode: i.businessObjectCode,
          defaultExportFlag: i.checked,
        };
        columnList.push(lineData);
      }
    });
    axios({
      url: `${HZERO_HMDE}/v1/${organizationId}/business-objects-user-export-templates`,
      method: isAs ? 'POST' : 'PUT',
      data: {
        templateName: isAs ? templateName : currentTemplate.templateName,
        businessObjectExportTemplateId:
          currentTemplate.templateId || currentTemplate.businessObjectExportTemplateId,
        businessObjectUserExportTemplateId: isAs
          ? ''
          : currentTemplate.userTemplateId || currentTemplate.businessObjectUserExportTemplateId,
        columnList,
      },
    })
      .then((res: any) => {
        if (getResponse(res)) {
          if (isAs) {
            // eslint-disable-next-line no-shadow
            const { columnList, ...other } = res;
            templateList.push(other);
            setTemplateList(templateList);
            // queryTemplateList();
            setSelectValue(res.templateCode);
            changeTemplate(res.templateCode);
          } else {
            treeArea.query({
              templateCode: currentTemplate.templateCode,
              templateType: currentTemplate.templateType,
            });
          }
          resetTreeArea();
          notification.success({});
        }
      })
      .catch(err => {
        notification.error({
          message: err.message,
        });
      });
  };

  const handleRename = (templateName: string, templateId) => {
    axios({
      url: `${HZERO_HMDE}/v1/${organizationId}/business-objects-user-export-templates`,
      method: 'PUT',
      data: {
        templateName,
        businessObjectExportTemplateId: templateId,
        businessObjectUserExportTemplateId: currentTemplate.userTemplateId,
      },
    }).then((res: any) => {
      if (getResponse(res)) {
        queryTemplateList();
        notification.success({});
      }
    });
  };

  const handleDelete = templateId => {
    axios({
      url: `${HZERO_HMDE}/v1/${organizationId}/business-objects-user-export-templates`,
      method: 'DELETE',
      data: {
        businessObjectUserExportTemplateId: templateId,
      },
    }).then((res: any) => {
      if (!res?.failed) {
        queryTemplateList();
        notification.success({});
      }
    });
  };

  const handleSaveAs = () => {
    const formDS = new DataSet({
      fields: [
        {
          name: 'templateName',
          type: FieldType.intl,
          required: true,
          label: intl.get('hzero.common.components.export.v.hd.rename.template').d('模板名称'),
        },
      ],
    });
    Modal.open({
      key: 'saveAs',
      className: 'save-modal',
      title: intl.get('hzero.common.components.export.v.hd.saveAs').d('保存导出列模板'),
      children: <RenameModal dataSet={formDS} />,
      onOk: async () => {
        const saveData: any = formDS.toData()[0];
        handleSave(saveData?.templateName, true);
      },
      onCancel: () => {
        formDS.reset();
      },
      onClose: () => {
        formDS.reset();
      },
    });
  };

  const renderOption = item => {
    return (
      <Option className="export-select-option" value={item.templateCode} key={item.templateCode}>
        <span>{item.templateName}</span>
        {item.templateType === ExportTemplateTypeEnum.PREDEFINED && (
          <Tooltip
            placement="top"
            title={intl
              .get('hzero.common.components.export.icon.tooltip')
              .d('由管理员预定义的模版')}
          >
            <Icon className="export-select-option-icon" type="help" />
          </Tooltip>
        )}
        {item.templateType === ExportTemplateTypeEnum.CUSTOM && (
          <span
            className="export-select-option-menu"
            onClick={event => {
              event.stopPropagation();
            }}
          >
            <OptionMenu data={item} onRename={handleRename} onDelete={handleDelete} />
          </span>
        )}
      </Option>
    );
  };

  const renderer: Renderer = ({ text }) => {
    return (
      <div style={{ width: '100%' }}>
        <span>{text}</span>
        {changeFlag && currentTemplate?.templateType !== ExportTemplateTypeEnum.DEFAULT && (
          <span className="export-select-selected-has-changed">
            {intl.get('hzero.common.view.title.alreadyEdited').d('已修改')}
          </span>
        )}
      </div>
    );
  };

  const changeTemplate = useCallback(
    (value: string) => {
      const template = templateList.find(i => i.templateCode === value);
      if (template || value === 'default') {
        setSelectValue(value);
        setCurrentTemplate(template);
        resetTreeArea();
        treeArea.setQueryParameter('templateType', template.templateType);
        treeArea.setQueryParameter(
          'templateCode',
          value === 'default' ? templateCode : template.templateCode
        );
        treeArea.query();
        const queryData = {
          fillerType: template.exportType,
          maxDataCount: template.maxDataCount,
          singleExcelMaxSheetNum: template.maxSheetCount,
          fileType: template.fileType,
          async: 'true',
        };
        queryArea.loadData([queryData]);
      }
    },
    [templateList]
  );

  const resetTreeArea = () => {
    treeArea.reset();
    treeArea.setState('changeFlag', false);
  };

  return (
    <Spin dataSet={treeArea}>
      <Card
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={intl.get('hzero.common.view.baseInfo').d('基本信息')}
      >
        <Form
          dataSet={queryArea}
          columns={2}
          className="export-search-form"
          labelLayout={LabelLayout.float}
        >
          <TextField name="fileName" />
          <Select name="fileType" />
          {showMore && (
            <>
              <Select name="fillerType" />
              <NumberField
                name="singleExcelMaxSheetNum"
                help={intl
                  .get('hzero.common.components.export.maxSheetTip')
                  .d(
                    '限制单个excel的sheet页数量，当数据量超过一个excel时，会分片成多个excel，以压缩包形式导出。'
                  )}
                showHelp={ShowHelp.tooltip}
              />
              {showAsync && <Select name="async" disabled />}
              {!templateCode && (
                <NumberField
                  name="singleSheetMaxRow"
                  help={intl
                    .get('hzero.common.components.export.singleSheetTip')
                    .d(
                      '限制excel中单个sheet页的数据量，当数据量超过单sheet页最大数量时，会自动分片到下一个sheet页。'
                    )}
                  showHelp={ShowHelp.tooltip}
                />
              )}
            </>
          )}
        </Form>
        <a onClick={() => setShowMore(!showMore)}>
          {showMore
            ? intl.get('hzero.common.button.export.collected').d('收起')
            : intl.get(`hzero.common.button.export.more`).d('更多选项')}
          {showMore ? <Icon type="expand_less" /> : <Icon type="expand_more" />}
        </a>
      </Card>
      {exportType === ExportTypeEnum.Class && (
        <>
          {queryFormItem && (
            <Card
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={intl.get('hzero.common.view.otherInfo').d('其他信息')}
            >
              {queryFormItem}
            </Card>
          )}
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl.get('hzero.common.components.export.choose.column').d('选择要导出的列')}
          >
            {templateCode && (
              <div className="export-template">
                <Form
                  layout={FormLayout.none}
                  className="export-template-form"
                  labelLayout={LabelLayout.float}
                  columns={6}
                >
                  <Select
                    label={intl
                      .get('hzero.common.components.export.choose.column')
                      .d('选择导出列模版')}
                    className="export-select"
                    onChange={changeTemplate}
                    value={selectValue}
                    clearButton={false}
                    popupCls="export-select-popup"
                    renderer={renderer}
                  >
                    <Option value="default" key="default">
                      {intl.get('hzero.common.button.default').d('默认')}
                    </Option>
                    {templateList
                      .filter(i => i.templateType === ExportTemplateTypeEnum.PREDEFINED)
                      .map(item => renderOption(item))}
                    <OptGroup
                      label={intl
                        .get('hzero.common.components.export.custom.template')
                        .d('自定义模板')}
                    >
                      {templateList
                        .filter(i => i.templateType === ExportTemplateTypeEnum.CUSTOM)
                        .map(item => renderOption(item))}
                    </OptGroup>
                  </Select>
                </Form>
                {changeFlag && currentTemplate?.templateType !== ExportTemplateTypeEnum.DEFAULT && (
                  <div className="export-template-buttons">
                    <Button onClick={handleSaveAs}>
                      {intl.get('hzero.common.button.saveAs').d('另存为')}
                    </Button>
                    {currentTemplate.templateType === ExportTemplateTypeEnum.CUSTOM && (
                      <Button onClick={() => handleSave('', false)}>
                        {intl.get('hzero.common.button.save').d('保存')}
                      </Button>
                    )}
                    <Button onClick={resetTreeArea}>
                      {intl.get('hzero.common.button.reset').d('重置')}
                    </Button>
                  </div>
                )}
              </div>
            )}
            {openFlag && (
              <Tree
                dataSet={treeArea}
                showLine={{
                  showLeafIcon: false,
                }}
                showIcon={false}
                checkable
                selectable={false}
                defaultExpandedKeys={[`${treeParams?.id}`]}
                renderer={nodeRenderer}
              />
            )}
          </Card>
        </>
      )}
    </Spin>
  );
});

export default ExportContent;

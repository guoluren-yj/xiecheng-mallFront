import { isNil, isEmpty } from 'lodash';

import { saveUserConfigService } from 'services/headerService';
import { getUserConfigInfo, getCurrentUserId, filterNullValueObject } from 'utils/utils';
import CuxFn from '../../cuxTools/cuxFn';

export function setInitData({ dataSet, isNew }) {
    const { purchaseUnit: userConfig, unitDimensionData } = getUserConfigInfo();
    const { currentList = [] } = unitDimensionData || {};
    const data = {
        'PURCHASE_ORGANIZATION': {
            unitName: '',
        },
    };
    currentList.forEach(field => {
        const { name: code, dimensionType, lovViewInfo } = field;
        const { displayField: textField, valueField } = lovViewInfo || {};
        const codeData = filterNullValueObject({
            [valueField]: dimensionType === 'FIXED' && !isNew ? userConfig[valueField] : userConfig?.customDimensionMap?.[code]?.value,
            [textField]: dimensionType === 'FIXED' && !isNew ? userConfig[textField] : userConfig?.customDimensionMap?.[code]?.meaning,
        });
        data[code] = isEmpty(codeData) ? null : codeData;
    });
    if (currentList?.length === 1 && data.PURCHASE_ORGANIZATION && !isNew) {
        data.PURCHASE_ORGANIZATION.unitName = userConfig.aliasName;
    }
    const cuxData = CuxFn({
      name: 'ChooseUnit-fn-initData',
      value: {
        data,
        isNew,
        userConfig,
      },
    })(() => data)();
    dataSet.loadData([cuxData]);
};

export async function handleSubmit({ dataSet }) {
    const { purchaseUnit: userConfig, unitDimensionData } = getUserConfigInfo();
    const { currentList = [], versionHash = '', ...other} = unitDimensionData || {};
    const flag = await dataSet.validate();
    if (!flag) return;
    const data = dataSet.current?.toData();
    if (!isNil(data.__dirty)) delete data.__dirty;
    const params = {
        versionHash,
        userId: getCurrentUserId(),
        customDimensionMap: {},
    };
    currentList.forEach((field) => {
        if (field.editFlag === 1) {
            const code = field.name;
            const valueField = dataSet.getField(code)?.get('valueField');
            const textField = dataSet.getField(code)?.get('textField');
            if (field.dimensionType === 'FIXED') {
                params[valueField] = data[code]?.[valueField];
            } else {
                params.customDimensionMap[code] = {
                    value: data[code]?.[valueField],
                    meaning: data[code]?.[textField],
                };
            }
        }
    });
        // 可编辑从dataSet里面拿
        // 不可编辑 从config拿
        // 针对采买组织 PURCHASE_ORGANIZATION 不展示也要传默认值（不展示则从config拿）
    other.unitDimensionList.filter((p) => p.editFlag !== 1 && p.dimensionCode === 'PURCHASE_ORGANIZATION').forEach((field) => {
          const { valueField } = field.lovView || {};
          const newValueField = userConfig[valueField];
           params[valueField] = newValueField;
    });
    const res = await saveUserConfigService(params);
    if (!isEmpty(res)) window.location.reload();
}
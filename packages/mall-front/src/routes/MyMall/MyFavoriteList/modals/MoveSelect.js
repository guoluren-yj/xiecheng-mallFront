import React, { useCallback, useState } from 'react';
import { Observer } from 'mobx-react';
import { Form, Select, TextField, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { fetchCreateGroup } from '../api';

const SelectContent = ({ children, dataSet, textField, valueField, setPopup, store }) => {
  const [value, setValue] = useState('');
  const handleAdd = useCallback(() => {
    if (!value) return;
    fetchCreateGroup([...store.favoriteGroupList, { categoryName: value }]).then((res) => {
      store.changeStore({
        favoriteGroupList: res,
      });
      setValue('');
    });
  }, [dataSet, textField, valueField, value]);
  const handleClose = useCallback(() => {
    setPopup(false);
  }, [setPopup]);
  return (
    <>
      {children}
      <div style={{ position: 'relative', padding: '0 5px 5px 5px' }}>
        <TextField required value={value} onChange={setValue} style={{ width: '60%' }} />
        <div style={{ position: 'absolute', right: 10, top: 0, height: 32 }}>
          <Button color="primary" onClick={handleAdd} style={{ height: '100%', marginLeft: 10 }}>
            {intl.get(`mallf.common.button.add`).d('新建')}
          </Button>
          <Button onClick={handleClose} style={{ height: '100%' }}>
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>
        </div>
      </div>
    </>
  );
};

export default function MoveSelect({ initDs, dataSet: store }) {
  const renderPopupContent = useCallback(
    ({ content, dataSet, textField, valueField, setPopup }) => (
      <SelectContent
        dataSet={dataSet}
        textField={textField}
        valueField={valueField}
        setPopup={setPopup}
        store={store}
      >
        {content}
      </SelectContent>
    ),
    []
  );
  return (
    <>
      <p
        style={{
          fontSize: 14,
          color: '#191919',
          lineHeight: '22px',
          fontWeight: 400,
          marginBottom: 20,
        }}
      >
        {intl.get('mallf.myFavorite.view.batchMove.desc').d('将选中商品移动至下方收藏夹中')}
      </p>
      <Observer>
        {() => {
          return (
            <Form labelLayout="float" columns={1} dataSet={initDs}>
              <Select popupContent={renderPopupContent} name="favoriteCategoryId">
                {store.favoriteGroupList.map((group) => {
                  return (
                    <Select.Option value={group.categoryId}>{group.categoryName}</Select.Option>
                  );
                })}
              </Select>
            </Form>
          );
        }}
      </Observer>
    </>
  );
}

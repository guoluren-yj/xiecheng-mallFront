import React from 'react';
import { Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getPrimaryColor } from 'utils/utils';
import CuxFn from 'cuxTools/cuxFn';

export function footerRender({
  noFetchFlag,
  showBuyNow,
  manualFlag,
  templateUpdateFlag,
  loading,
  readOnly,
  locationFrom,
  handleSave = (e) => e,
  handleClose = (e) => e,
}) {
  // 提交
  const SubmitButton = (prop) => (
    <Button
      waitType="throttle"
      wait={500}
      {...prop}
      style={{ height: 32 }}
      loading={loading}
      onClick={() => handleSave('submit')}
    >
      {intl.get(`mallf.common.button.submitButton`).d('提交')}
    </Button>
  );
  // 加入购物车
  const AddCartButton = (prop) => (
    <Button
      waitType="throttle"
      wait={500}
      {...prop}
      id="add-cart"
      style={{ height: 32 }}
      loading={loading}
      onClick={() => handleSave('addCart')}
    >
      {intl.get(`mallf.common.button.addCart`).d('加入购物车')}
    </Button>
  );
  // 立即购买
  const BuyNowButton = (prop) => (
    <Button
      waitType="throttle"
      wait={500}
      {...prop}
      id="add-cart"
      style={{ height: 32 }}
      loading={loading}
      onClick={() => handleSave('buyNow')}
    >
      {intl.get('mallf.common.view.buyNow').d('立即购买')}
    </Button>
  );
  // 取消
  const CancelButton = (prop) => (
    <Button {...prop} style={{ height: 32 }} onClick={() => handleClose()}>
      {intl.get('hzero.common.button.cancel').d('取消')}
    </Button>
  );
  // 关闭
  const CloseButton = (prop) => (
    <Button {...prop} style={{ height: 32 }} onClick={() => handleClose()}>
      {intl.get('hzero.common.button.close').d('关闭')}
    </Button>
  );
  // 保存
  const SaveButton = (prop) => (
    <Button
      waitType="throttle"
      wait={500}
      {...prop}
      style={{ height: 32 }}
      disabled={loading}
      loading={loading}
      onClick={() => handleSave()}
    >
      {intl.get('mallf.common.button.save').d('保存')}
    </Button>
  );
  // 保存并关闭
  const SaveAndCloseButton = (prop) => (
    <Button
      waitType="throttle"
      wait={500}
      {...prop}
      style={{ height: 32 }}
      disabled={loading}
      loading={loading}
      onClick={() => handleSave('close')}
    >
      {intl.get('mallf.common.button.saveAndClose').d('保存并关闭')}
    </Button>
  );
  if (templateUpdateFlag) {
    return [<SaveAndCloseButton color="primary" />, <CancelButton />];
  }
  // 手工申请
  if (manualFlag) {
    // 购物车手工申请
    if (locationFrom === 'CART') {
      return [<SaveAndCloseButton color="primary" />, <CancelButton />];
    }
    return [<SubmitButton color="primary" />, <AddCartButton />, <CancelButton />];
  }
  if (noFetchFlag) {
    return [
      showBuyNow ? <BuyNowButton color="primary" /> : <AddCartButton color="primary" />,
      <CancelButton />,
    ];
  }
  if (readOnly) {
    return [<CloseButton color="primary" />];
  }
  return [<SaveButton color="primary" />, <SaveAndCloseButton />, <CloseButton />];
}

export function buttonRender({
  ds,
  headerIndex,
  noCreateFlag,
  noFetchFlag,
  showBuyNow,
  manualFlag,
  handleCreate = (e) => e,
  handleCopy = (e) => e,
}) {
  const getButtons = CuxFn({
    name: 'ProductAllocation-fn-getButtons',
  })(() => (
    <Button
      funcType="flat"
      icon="playlist_add"
      // size="small"
      onClick={() => handleCreate(headerIndex)}
      style={{ color: getPrimaryColor() }}
    >
      {intl.get(`mallf.common.button.addLine`).d('新建行')}
    </Button>
  ));
  // 复制
  const CopyButton = (
    <Button
      funcType="flat"
      icon="baseline-file_copy"
      // size="small"
      onClick={() => handleCopy(headerIndex)}
      disabled={ds.selected.length === 0}
      style={{ color: getPrimaryColor() }}
    >
      {intl.get('mallf.common.view.copy').d('复制')}
    </Button>
  );
  if (manualFlag && noFetchFlag) {
    return [getButtons(), CopyButton];
  }
  if (noCreateFlag || showBuyNow) {
    return [];
  }
  return [getButtons()];
}

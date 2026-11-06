import React, { useState, useEffect } from 'react';
import { Icon, Popover } from 'choerodon-ui';

import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import PersonInfoModal from './PersonInfoModal';
import { fetchComGroupInfoService, fetchOrgStructureService } from '../../services';

export default function PersonInfo(props) {
  const { product = {}, orderData, setOrderData, orderIndex, products } = props;
  let productIndex = 0;
  products.forEach((p, i) => {
    if (p.productId === product.productId) {
      productIndex = i;
    }
  });

  useEffect(() => {
    setCardInfo(props.cardInfo);
  }, [props.cardInfo]);

  const [cardInfo, setCardInfo] = useState({});

  const [comList, setComGroupInfoList] = useState([]);
  const [orgList, setOrgStructureList] = useState([]);
  const [comListPage, setComGroupInfoPage] = useState({});
  const [orgListPage, setOrgStructurePage] = useState({});
  const [personVisible, setPersonVisible] = useState(false);
  const [shopCartIndex, setShopCartIndex] = useState({ productIndex: -1, orderIndex: -1 });
  const [personInfoLoading, setPersonInfoLoading] = useState(false);

  const { userId, unitCode } = getUserConfigInfo();

  // 打开人员信息选择框
  const openPersonInfo = () => {
    setPersonVisible(true);
    setPersonInfoLoading(true);
    setShopCartIndex({ productIndex, orderIndex });
    const params = { page: 0, size: 10 };
    Promise.all([
      fetchComGroupInfoService({ ...params, unitCode }),
      fetchOrgStructureService({ ...params, userId }),
    ]).then((result) => {
      setPersonInfoLoading(false);
      const { content: comListContent, ...comPage } = result[0];
      const { content: orgListContent, ...orgPage } = result[1];
      setComGroupInfoList(comListContent.filter((i) => i.enabledFlag !== 0));
      setOrgStructureList(orgListContent.filter((i) => i.enabledFlag !== 0));
      setComGroupInfoPage(comPage);
      setOrgStructurePage(orgPage);
    });
  };

  // 关闭人员信息选择框
  const closePersonInfo = () => {
    setPersonVisible(false);
    setShopCartIndex({ productIndex: -1, orderIndex: -1 });
  };

  // 替换人员信息卡片
  const setPersonInfoIntoShop = (person = {}, ind = {}) => {
    if (!person.name) {
      closePersonInfo();
      return;
    }
    // eslint-disable-next-line no-shadow
    const { orderIndex, productIndex } = shopCartIndex || ind;
    const newData = orderData.map((order, ind1) => {
      const { shoppingCartDTOList = [] } = order;
      return ind1 === orderIndex
        ? {
            ...order,
            // eslint-disable-next-line no-shadow
            shoppingCartDTOList: shoppingCartDTOList.map((product, ind2) => {
              if (ind2 === productIndex) {
                const newPerson = person;
                newPerson.cartUserId = userId;
                [
                  'mobile',
                  'name',
                  'email',
                  'attributeLongtext1',
                  'cartUserId',
                  'cartUserType',
                  'attributeLongtext2',
                ].forEach((name) => product?.DS?.set(name, newPerson[name]));
                return { ...product, ...person };
              }
              return product;
            }),
          }
        : { ...order, shoppingCartDTOList };
    });
    setCardInfo(person);
    setOrderData(newData);
    closePersonInfo();
  };

  // 查询常用组人员信息
  const fetchComGroupInfo = (params = { page: 0, size: 10 }) => {
    setPersonInfoLoading(true);
    fetchComGroupInfoService({ ...params }).then((res) => {
      if (res) {
        const { content, ...pagination } = res;
        setPersonInfoLoading(false);
        setComGroupInfoList(content.filter((i) => i.enabledFlag !== 0));
        setComGroupInfoPage(pagination);
      }
    });
  };

  // 查询组织架构人员信息
  const fetchOrgStructure = (params = { page: 0, size: 10 }) => {
    setPersonInfoLoading(true);
    fetchOrgStructureService({ ...params, userId }).then((res) => {
      if (res) {
        const { content, ...pagination } = res;
        setPersonInfoLoading(false);
        setOrgStructureList(content.filter((i) => i.enabledFlag !== 0));
        setOrgStructurePage(pagination);
      }
    });
  };

  const personInfoProps = {
    userId,
    comList,
    orgList,
    comListPage,
    orgListPage,
    visible: personVisible,
    onCancel: closePersonInfo,
    loading: personInfoLoading,
    onSave: setPersonInfoIntoShop,
    fetchComList: fetchComGroupInfo,
    fetchOrgList: fetchOrgStructure,
  };

  function handleCard() {
    return (
      <div>
        <p style={{ lineHeight: '18px', marginBottom: 5 }}>
          <div style={{ display: 'inline-block', verticalAlign: 'top', width: 48 }}>
            {intl.get('mallf.myMall.model.companyOrder.name').d('姓名')}：
          </div>
          <span>{cardInfo?.name}</span>
        </p>
        <p style={{ lineHeight: '18px', marginBottom: 5 }}>
          <div style={{ display: 'inline-block', verticalAlign: 'top', width: 48 }}>
            {intl.get('mallf.myMall.model.companyOrder.phone').d('电话')}：
          </div>
          <span>{cardInfo?.mobile}</span>
        </p>
        <p style={{ lineHeight: '18px', marginBottom: 5 }}>
          <div style={{ display: 'inline-block', verticalAlign: 'top', width: 48 }}>
            {intl.get('mallf.myMall.model.companyOrder.email').d('邮箱')}：
          </div>
          <span>{cardInfo?.email}</span>
        </p>
        {(cardInfo?.attributeLongtext1 || cardInfo?.attributeLongtext2) && (
          <p>
            <div style={{ display: 'inline-block', verticalAlign: 'top', width: 48 }}>
              {intl.get('mallf.common.view.qrcode').d('二维码')}：
            </div>
            {cardInfo?.attributeLongtext1 && (
              <div style={{ display: 'inline-block', marginRight: 15 }}>
                <img
                  style={{ width: 50, height: 50, display: 'block' }}
                  alt=""
                  src={cardInfo?.attributeLongtext1}
                />
                <p style={{ width: 50, textAlign: 'center' }}>
                  {intl.get('mallf.common.view.choukuan').d('筹款')}
                </p>
              </div>
            )}
            {cardInfo?.attributeLongtext2 && (
              <div style={{ display: 'inline-block' }}>
                <img
                  style={{ width: 50, height: 50, display: 'block' }}
                  alt=""
                  src={cardInfo?.attributeLongtext2}
                />
                <p style={{ width: 50, textAlign: 'center' }}>
                  {intl.get('mallf.common.view.wechat').d('微信')}
                </p>
              </div>
            )}
          </p>
        )}
      </div>
    );
  }

  return (
    <div style={{ cursor: 'pointer' }}>
      {product.businessCardFlag && (
        <Popover
          content={handleCard()}
          title={
            <p
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>{intl.get('mallf.myMall.model.companyOrder.personInfo').d('人员信息')}</span>
              <span>
                <a style={{ color: 'rgb(245, 99, 73)' }} onClick={() => openPersonInfo()}>
                  {intl.get('mallf.myMall.model.companyOrder.choose').d('选择')}
                </a>
              </span>
            </p>
          }
        >
          <Icon
            type="assignment_ind-o"
            style={{
              fontSize: 14,
              marginRight: 6,
              color: 'rgba(0, 0, 0, 0.5)',
              position: 'relative',
              top: -1,
            }}
          />
          <span>{cardInfo?.name}</span>
        </Popover>
      )}
      <PersonInfoModal {...personInfoProps} />
    </div>
  );
}

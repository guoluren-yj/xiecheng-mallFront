import intl from 'utils/intl';

export default function getNeededDate({ order }) {
  return [
    {
      title: intl.get(`mallf.common.model.companyOrder.itemTwoCategoryName`).d('二级品类'),
      dataIndex: 'itemTwoCategoryName',
      key: 'itemTwoCategoryName',
      width: 80,
      render: (v, product, index) => order.watsonsShoppingCartDTOList[index]?.itemTwoCategoryName,
    },
    {
      title: intl.get(`mallf.common.model.CMS.num`).d('CMS合同号'),
      dataIndex: 'cmsNumber',
      key: 'cmsNumber',
      width: 120,
      render: (v, product, index) => order.watsonsShoppingCartDTOList[index].cmsNumber,
    },
    {
      title: intl.get('mallf.common.view.rule').d('运费规则'),
      dataIndex: 'postageRule',
      key: 'postageRule',
      width: 120,
      render: (v, product, index) => order.watsonsShoppingCartDTOList[index].postageRule,
    },
  ];
}

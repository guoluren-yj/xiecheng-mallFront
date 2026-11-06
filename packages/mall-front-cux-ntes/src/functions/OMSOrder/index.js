import swalAlert from 'components/swal';
import { openPage } from 'utils/utils';
import intl from 'utils/intl';

const openAcceptSwal = (product) => {
  if (product.receiptFlag === 2) {
    const { attributeVarchar4 = '' } = product;
    swalAlert(
      intl
        .get('mallf.myOrder.view.ntes.receiptMsg', { value: attributeVarchar4 })
        .d(
          `该订单暂不支持本平台确认收货，请前往${attributeVarchar4}进行收货确认，如有疑问请咨询资产管理员，感谢配合`
        )
    );
  }
};

const openAccept = ({ product, subList, onAccept }) => {
  if (product.receiptFlag === 1) {
    onAccept(subList || [product]);
  }
  openAcceptSwal(product);
};

const openDetailAccept = ({ product, index, order, subList, onAccept }) => {
  if (product.receiptFlag === 1) {
    if (order.orderTypeCode !== 'CATA' && order.orderTypeCode !== 'MANUAL' && index === 0) {
      onAccept(subList);
    } else {
      onAccept([product]);
    }
  }
  openAcceptSwal(product);
};

const handleGoToSaleReq = ({ product, url }) => {
  if (product.afterSaleFlag === 2) {
    const { attributeVarchar4 = '' } = product;
    swalAlert(
      intl
        .get('mallf.myOrder.view.ntes.afterSaleMsg', { value: attributeVarchar4 })
        .d(
          `该订单暂不支持本平台售后，请前往${attributeVarchar4}进行售后，如有疑问请咨询资产管理员，感谢配合。`
        )
    );
    return;
  }
  openPage(url);
};

export { openAccept, openDetailAccept, handleGoToSaleReq };

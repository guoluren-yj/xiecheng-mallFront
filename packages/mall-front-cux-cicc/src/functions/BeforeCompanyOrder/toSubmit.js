import { isEmpty } from 'lodash';

import Swal from 'components/swal';

export default function toSubmitOrder({ toSubmit, orderData }) {
  let lines = [];
  if (orderData) {
    orderData.forEach((order) => {
      lines = [...lines, ...order?.shoppingCartDTOList];
    });
  }
  const errorList = lines.filter(
    (p) => p.attributeVarchar10 && p.attributeVarchar6Lov?.unitCode !== p.attributeVarchar10
  );
  if (!isEmpty(errorList)) {
    Swal(
      {
        msg: `存在${errorList.length}个商品行的职能管控部门和职能管控部门联系人所在部门不一致，确认无误，请点击"确定”，如需修改，请点击返回`,
        cancelText: '返回',
      },
      true
    ).then(({ value }) => {
      if (value) {
        toSubmit();
      }
    });
  } else {
    toSubmit();
  }
}

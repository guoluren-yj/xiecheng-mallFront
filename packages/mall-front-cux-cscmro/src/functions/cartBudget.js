import request from 'utils/request';
import { getUserConfigInfo } from 'utils/utils';
import { isEmpty } from 'lodash';

/* 查询默认的一挑预算信息 */
export const queryDefaultBudget = ({ tableDs, setBudgetLoading, uuId }) => {
  const SMAL = '/smal';
  const { organizationId, companyId } = getUserConfigInfo();

  request(`${SMAL}/v1/${organizationId}/cscro-budget-defaults/get?companyId=${companyId}`).then(
    (res) => {
      if (res && !isEmpty(res)) {
        const { account, accountMeaning, costCode, costCodeMeaning, subject, subjectMeaning } = res;
        tableDs.loadData([
          {
            costCode,
            account,
            budget: JSON.stringify({
              costCode,
              costCodeMeaning,
              subject,
              subjectMeaning,
              account,
              accountMeaning,
            }),
            subject,
            costCodeMeaning,
            subjectMeaning,
            accountMeaning,
            uuId,
          },
        ]);
        setBudgetLoading(false);
      } else {
        setBudgetLoading(false);
      }
    }
  );
};

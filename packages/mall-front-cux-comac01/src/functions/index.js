import { isEmpty } from 'lodash';
import { getUserConfigInfo } from 'utils/utils';

export function getFields({ fields }) {
  const { unitId, unitName } = getUserConfigInfo();
  const newFields = fields.map((p) => {
    if (p.name === 'unitIdLov') {
      return {
        ...p,
        defaultValue: { unitId, unitName },
        dynamicProps() {
          return {
            disabled: true,
          };
        },
      };
    }
    if (p.name === 'budget') {
      return {
        ...p,
        transformResponse: (_, record) => {
          const budget = JSON.parse(record.budget);
          return !isEmpty(budget)
            ? record.budget
            : JSON.stringify({ unitId, unitIdMeaning: unitName });
        },
      };
    }
    return p;
  });
  return newFields;
}

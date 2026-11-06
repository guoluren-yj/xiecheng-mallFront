import intl from 'utils/intl';

export default function lineDs() {
  return {
    fields: [
      {
        name: 'neededDate',
        type: 'date',
        // defaultValue: moment(timestampToTime())
        //   .add(deliveryCycle || 7, 'days')
        //   .format(DEFAULT_DATETIME_FORMAT),
        label: intl.get('mallf.myMall.model.requestDate').d('需求日期'),
      },
    ],
  };
}

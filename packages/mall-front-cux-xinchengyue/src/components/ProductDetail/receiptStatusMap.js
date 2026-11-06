// 同款反馈单据映射
export const receiptStatusMap = {
  // 新建
  NEW: {
    leftTitle: '问题反馈',
  },
  // 已提交
  SUBMIT: {
    leftTitle: '问题反馈',
    statusText: '已收到您的反馈，问题处理中，请耐心等待',
  },
  // 已处理
  PROCESSED: {
    leftTitle: '上次问题反馈',
    statusText: '处理结果：已处理',
  },
  // 审批通过
  APPROVED: {
    leftTitle: '上次问题反馈',
    statusText: '处理结果：审批通过',
  },
  // 审批拒绝
  REJECTED: {
    leftTitle: '上次问题反馈',
    statusText: '处理结果：审批拒绝',
  },
};

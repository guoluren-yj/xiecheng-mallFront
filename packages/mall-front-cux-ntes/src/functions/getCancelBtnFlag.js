export default function getCancelBtnFlag({ requestHeader }) {
  return ['NEW', 'RETURNED', 'REJECTED', 'ACCEPTING', 'SUBMITTED'].includes(
    requestHeader.requestStatus
  );
}

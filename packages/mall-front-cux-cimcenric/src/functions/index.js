export function openListAccept({ setState, params, type }) {
  if (params.length === 0) return;
  setState({
    asnLineIds: params.map((p) => ({ consignmentEntryId: p.consignmentEntryId })),
    acceptVisible: true,
    acceptType: type,
  });
}

export function openDetailAccept({ openOldAccept }) {
  openOldAccept();
}

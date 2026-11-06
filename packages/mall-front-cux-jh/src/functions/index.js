function getAttachmentRequired({ order }) {
  if (+order.attachmentFixFlag === 1) {
    // eslint-disable-next-line no-param-reassign
    order.attachmentRequired = 1;
  }
  if (+order.outerAttachmentFixFlag === 1) {
    // eslint-disable-next-line no-param-reassign
    order.outerAttachmentRequired = 1;
  }
  if (+order.remarkFixFlag === 1) {
    // eslint-disable-next-line no-param-reassign
    order.remarkRequired = 1;
  }
}

export { getAttachmentRequired };

import React from 'react';
import { Anchor } from 'choerodon-ui';
import { isEmpty } from 'lodash';

const { Link } = Anchor;
export default function AllocationAnchor({ allocationData }) {
  return (
    <div className="header-product-name">
      {!isEmpty(allocationData) && (
        <div className="allocation-anchor">
          <Anchor
            targetOffset={window.innerHeight / 2 - 100}
            getContainer={() => document.querySelector('.c7n-modal-body')}
          >
            {allocationData.map((allocation, index) => {
              return (
                <Link
                  className="anchor-item"
                  title={`${index + 1 < 10 ? `0${index + 1}` : index + 1}`}
                  href={`#${index}`}
                />
              );
            })}
          </Anchor>
        </div>
      )}
    </div>
  );
}

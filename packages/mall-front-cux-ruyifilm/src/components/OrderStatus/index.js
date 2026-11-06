import React from 'react';

const Index = (props) => {
  const { poLineList, statusInfo } = props;
  const WAITING_RECEIVE =
    poLineList?.some((item) => item?.mallOrderEntryStatus === 'WAITING_RECEIVE') || false;
  const { orderEntryId } =
    poLineList?.find((item) => item?.mallOrderEntryStatus === 'WAITING_RECEIVE') || {};
  if (WAITING_RECEIVE) {
    return (
      <>
        {poLineList.map((product) => {
          // if (index === 0) {
          console.log('product?.orderEntryId', product?.orderEntryId);
          console.log('orderEntryId', orderEntryId);
          if (
            product?.orderEntryId === orderEntryId &&
            product?.mallOrderEntryStatus === 'WAITING_RECEIVE'
          ) {
            return (
              <li
                className="product-info-handle"
                style={{ height: `${(1 / poLineList.length) * 100}%` }}
              >
                {statusInfo(product, poLineList)}
              </li>
            );
          }
          if (product?.mallOrderEntryStatus === 'FINISH') {
            return (
              <li
                className="product-info-handle"
                style={{ height: `${(1 / poLineList.length) * 100}%` }}
              >
                {statusInfo(product, poLineList)}
              </li>
            );
          }
          return <></>;
        })}
      </>
    );
  } else {
    return (
      <>
        {poLineList.map((product) => {
          return (
            <li
              className="product-info-handle"
              style={{ height: `${(1 / poLineList.length) * 100}%` }}
            >
              {statusInfo(product, poLineList)}
            </li>
          );
        })}
      </>
    );
  }
  // return (
  //   <>
  //     {poLineList.map((product, index) => {
  //       console.log('mallOrderEntryStatus', product?.mallOrderEntryStatus);
  //       if (mallOrderEntryStatusFlag) {
  //         if (index === 0) {
  //           return (
  //             <li
  //               className="product-info-handle"
  //               style={{ height: `${(1 / poLineList.length) * 100}%` }}
  //             >
  //               {statusInfo(product, poLineList)}
  //             </li>
  //           );
  //         }
  //         return <></>;
  //       }
  //       return (
  //         <>
  //           <li
  //             className="product-info-handle"
  //             style={{ height: `${(1 / poLineList.length) * 100}%` }}
  //           >
  //             {statusInfo(product)}
  //           </li>
  //         </>
  //       );
  //     })}
  //   </>
  // );
};

export default Index;

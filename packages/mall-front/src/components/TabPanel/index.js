import React, { useState, useEffect } from 'react';

import './index.less';

const Tabs = (props) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let tmpIndex = 0;
    React.Children.forEach(props.children, (element, index) => {
      if (element && element.props.active) {
        tmpIndex = index;
        return false;
      }
    });
    setCurrentIndex(tmpIndex);
  }, []);

  const getActiveClasses = (index) => {
    return index === currentIndex ? 'active' : null;
  };

  // const childrenHead = () => {
  //   return React.Children.map(props.children, (element, index) => {
  //     if (element) {
  //       return (
  //         <div
  //           key={element.key || index}
  //           className={getActiveClasses(index)}
  //           style={{ width: element.props.width }}
  //           onClick={(e) => {
  //             if (element.props.onClick != null) {
  //               element.props.onClick(e, element.key || index);
  //             }
  //             setCurrentIndex(index);
  //           }}
  //         >
  //           <h2>{element.props.title}</h2>
  //           {element.props && !!element.props.tips && (
  //             <span className="tab-tips">{element.props.tips}</span>
  //           )}
  //         </div>
  //       );
  //     }
  //   });
  // };

  const childrenContent = () => {
    return React.Children.map(props.children, (element, index) => {
      if (element) {
        return (
          <div key={element.key || index} className={getActiveClasses(index)}>
            {element.props.children}
          </div>
        );
      }
    });
  };

  return (
    <div
      className="h-tab-panel"
      id={props.id}
      style={{ width: props.width }}
      onClick={props.onClick}
    >
      <div className="h-tab-head h-clearfix">
        {/* {childrenHead()} */}
        {props.rightBtn}
      </div>
      <div className="h-tab-body">{childrenContent()}</div>
    </div>
  );
};

const TabPane = () => {};

export { TabPane, Tabs };

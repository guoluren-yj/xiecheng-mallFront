import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Controller } from 'react-spring';
import { clamp } from 'lodash';
import { useDrag } from 'react-use-gesture';

export const swap = (arr, from, to) => {
  const _arr = arr.slice(0);
  const val = _arr[from];
  _arr.splice(from, 1);
  _arr.splice(to, 0, val);
  return _arr;
};

const useAnimatedItems = ({
  items,
  itemDimensions,
  columnLength,
  handleDragging = (e) => e,
  handleDragStart = (e) => e,
  handleDragEnd = (e) => e,
  handleDebounceDragEnd = (e) => e,
  orderField = '__orderSeq',
}) => {
  const getSpringValue = useCallback(
    ({ position }) => {
      const { width, height } = itemDimensions;
      return {
        x: (position % columnLength) * width,
        y: Math.floor(position / columnLength) * height,
        scale: 1,
        zIndex: '0',
        width,
        height,
      };
    },
    [itemDimensions]
  );

  const [animatedItemsMap, setAnimatedItemsMap] = useState({});
  const orderRef = useRef([]);

  useEffect(() => {
    const newIds = items.map((item) => item.id);
    orderRef.current = orderRef.current.filter((id) => newIds.includes(id));

    setAnimatedItemsMap((_animatedItemsMap) =>
      items.reduce((acc, { id, ...rest }) => {
        if (_animatedItemsMap[id]) {
          acc[id] = {
            ...rest,
            controller: _animatedItemsMap[id].controller,
          };
        } else {
          orderRef.current.push(id);
          const position = orderRef.current.length - 1;
          acc[id] = {
            ...rest,
            controller: new Controller(getSpringValue({ position })),
          };
        }
        return acc;
      }, {})
    );
  }, [items, getSpringValue]);

  const animatedItems = useMemo(
    () =>
      Object.entries(animatedItemsMap).map(([id, rest]) => {
        return { id, ...rest, [orderField]: orderRef.current.indexOf(id) };
      }),
    [(animatedItemsMap, orderRef.current)]
  );

  useEffect(() => {
    animatedItems.forEach(({ id, controller }) => {
      const position = orderRef.current.indexOf(id);
      if (position === -1) {
        return;
      }
      const immediate = controller.springs?.width?.get() !== itemDimensions.width;
      controller.start({ ...getSpringValue({ position }), immediate });
    });
  }, [itemDimensions, getSpringValue, animatedItems]);

  const move = (params) => {
    const {
      args: [draggedId],
      first,
      last,
      down,
      movement: [movementX, movementY],
    } = params;
    const curPosition = orderRef.current.indexOf(draggedId);
    const x = (curPosition % columnLength) * itemDimensions.width + movementX;
    const y = Math.floor(curPosition / columnLength) * itemDimensions.height + movementY;
    const numRows = Math.ceil(orderRef.current.length / columnLength);
    const newPosition =
      clamp(Math.round(x / itemDimensions.width), 0, columnLength - 1) +
      clamp(Math.round(y / itemDimensions.height), 0, numRows - 1) * columnLength;
    const newOrder = swap(orderRef.current, curPosition, newPosition);

    animatedItems.forEach(({ id, controller }, index) => {
      const position = newOrder.indexOf(id);
      if (position === -1) {
        return;
      }
      animatedItems[index][orderField] = position;
      controller.start(
        down && id === draggedId
          ? {
              x,
              y,
              scale: 1.1,
              zIndex: '1',
              immediate: (key) => key !== 'scale',
            }
          : getSpringValue({ position })
      );
    });
    if (!down) {
      orderRef.current = newOrder;
    }

    const inDebounce = Math.abs(movementY) >= 30 || Math.abs(movementX) >= 30;

    const dragParams = {
      draggedId,
      animatedItems: animatedItems.map(({ controller, ...rest }) => rest),
      animatedItem: animatedItems.find((p) => p.id === draggedId),
      inDebounce,
    };

    // 可以自己封装好start，draging，end
    if (first) {
      handleDragStart(dragParams);
    }
    handleDragging(dragParams);

    // 防抖，因为点击的时候也算触发
    if (last) {
      if (inDebounce) {
        // 发抖之后
        handleDragEnd(dragParams);
      } else {
        // 点击操作
        handleDebounceDragEnd(dragParams);
      }
    }
  };

  // { event, first, last, distance, cancel, canceled, ...state }
  const bindGesture = useDrag((params) => {
    move(params);
  });

  return { animatedItems, bindGesture };
};

export default useAnimatedItems;

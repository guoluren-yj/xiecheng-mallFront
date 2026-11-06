import React, { useMemo } from 'react';
import uuidV4 from 'uuid/v4';
import Icons from 'components/Icons';

import style from './index.less';

let counterTimer;

export default function Counter(props) {
  const Add = () => {
    const { add, delay } = props;
    if (delay) {
      clearTimeout(counterTimer);
      counterTimer = setTimeout(() => {
        if (add) {
          add();
        }
      }, delay);
    } else if (add) {
      add();
    }
  };

  const uuid = useMemo(() => uuidV4(), []);

  const Minus = () => {
    const { minus, delay } = props;
    if (delay) {
      clearTimeout(counterTimer);
      counterTimer = setTimeout(() => {
        if (minus) {
          minus();
        }
      }, delay);
    } else if (minus) {
      minus();
    }
  };

  function addOrMinus(e) {
    if (e.keyCode === 38) {
      Add();
    } else if (e.keyCode === 40) {
      Minus();
    }
  }

  const {
    value,
    changeVal,
    onBlur,
    id,
    minBtnClass,
    maxBtnClass,
    minCountMsg,
    maxCountMsg,
  } = props;

  return (
    <div className={style['counter-wrapper']}>
      <div className="counter">
        <input
          type="text"
          id={uuid}
          value={value}
          onChange={(event) => {
            changeVal(event);
          }}
          onBlur={(event) => {
            onBlur(event);
          }}
          onKeyDown={(event) => addOrMinus(event)}
          onFocus={() => {
            document.getElementById(`${uuid}`).select();
          }}
        />
        <div className="add-reduce-btn">
          <div
            id={id}
            className={`add-img ${maxBtnClass}`}
            onClick={() => {
              if (maxBtnClass === '' || !maxBtnClass) {
                Add();
              }
            }}
          >
            {maxCountMsg && (
              <div className="count-msg">
                <Icons className="primary-color" type="warning" style={{ marginRight: 6 }} />
                <span>{maxCountMsg}</span>
              </div>
            )}
            <Icons size={12} type="pull" />
          </div>
          <div
            onClick={() => {
              if (minBtnClass === '' || !minBtnClass) {
                Minus();
              }
            }}
            className={`minus-img ${minBtnClass}`}
          >
            {minCountMsg && (
              <div className="count-msg">
                <Icons className="primary-color" type="warning" style={{ marginRight: 6 }} />
                <span>{minCountMsg}</span>
              </div>
            )}
            <Icons size={12} type="down" />
          </div>
        </div>
      </div>
    </div>
  );
}

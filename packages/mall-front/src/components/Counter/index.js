import React from 'react';

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
    onBlur = e => e,
    onFocus = e => e,
    id,
    minBtnClass,
    maxBtnClass,
    minCountMsg,
    maxCountMsg,
    uomName,
  } = props;

  return (
    <div className={style['counter-wrapper']}>
      <div className="counter">
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
        </div>
        <input
          type="text"
          value={value}
          onChange={event => {
            changeVal(event);
          }}
          onBlur={event => {
            onBlur(event);
          }}
          onFocus={e => onFocus(e)}
          onKeyDown={event => addOrMinus(event)}
        />
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
        </div>
        {uomName && <div className="count-uom">{uomName}</div>}
      </div>
    </div>
  );
}

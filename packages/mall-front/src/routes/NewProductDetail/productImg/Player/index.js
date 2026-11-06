import React from 'react';
import { Player } from 'video-react';
import CuxFn from '@/cuxTools/cuxFn';

import styles from './index.less';
import 'video-react/dist/video-react.css';

export default function VideoPlayer(props) {
  const { imagePath, imgInfo } = props;
  return (
    <div className={styles['img-container']}>
      <Player src={imagePath} muted />
      {CuxFn({
        name: 'Image-fn-renderTag',
        value: { imgInfo },
      })(function () {})()}
    </div>
  );
}

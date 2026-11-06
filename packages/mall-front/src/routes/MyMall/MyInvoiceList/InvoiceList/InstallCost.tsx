import React from 'react';
import { getPrimaryColor } from 'utils/utils';

const InstallCost: React.FC = () => {
  return (
    <svg width="40px" height="40px" viewBox="0 0 82 82" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
      <title>安装费</title>
      <defs>
        <rect id="path-1" x="0" y="0" width="82" height="82" />
      </defs>
      <g id="控件" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="page/我的发票" transform="translate(-410, -578)">
          <g id="编组-23" transform="translate(125, 129)">
            <g id="编组-19" transform="translate(200, 0)">
              <g id="编组-17" transform="translate(20, 138)">
                <g id="编组-20" transform="translate(20, 260)">
                  <g id="Group-14" transform="translate(0, 15)">
                    <g id="安装费" transform="translate(45, 36)">
                      <mask id="mask-2" fill="white">
                        <use xlinkHref="#path-1" />
                      </mask>
                      <use id="Mask" fill="#F8F8F8" xlinkHref="#path-1" />
                      <g id="编组" mask="url(#mask-2)">
                        <g transform="translate(19, 19)">
                          <path d="M2,10 L42,10 C43.1045695,10 44,10.8954305 44,12 L44,40 C44,41.1045695 43.1045695,42 42,42 L2,42 C0.8954305,42 1.02344917e-15,41.1045695 0,40 L0,12 C-1.3527075e-16,10.8954305 0.8954305,10 2,10 Z" id="矩形" fill="#EBEBEB" />
                          <path d="M29.6145089,4.03627219 L32,10 L32,10 L8,10 L24.1117477,1.94412613 C26.0876617,0.956169139 28.4903539,1.75706653 29.4783109,3.73298052 C29.5278939,3.8321465 29.5733324,3.93333111 29.6145089,4.03627219 Z" id="矩形" fill={getPrimaryColor()} />
                          <g id="编组-2" strokeWidth="1" fill="none" transform="translate(28, 22)">
                            <path d="M4,0 L14,0 L14,0 L14,8 L4,8 C1.790861,8 2.705415e-16,6.209139 0,4 C-2.705415e-16,1.790861 1.790861,4.05812251e-16 4,0 Z" id="矩形" fill="#FFFFFF" />
                            <circle id="椭圆形" fill="#D6D6D6" cx="4" cy="4" r="2" />
                          </g>
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};

export default InstallCost;

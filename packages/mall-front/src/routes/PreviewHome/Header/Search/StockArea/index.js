import React, { useState, useEffect, useRef, useMemo } from 'react';
import { setStorage, getUserConfigInfo, getStorage, removeStorage } from 'utils/utils';
import { getGetDefaultCountryId } from 'services/api';
import {
  fetchProvinceService,
  fetchCityInfoService,
  // fetchAddressService,
  queryAddress,
} from 'services/addressService';

import intl from 'utils/intl';
import style from './index.less';

export default function StockArea(props) {
  const stockArea = useRef(null);
  const [shengOptions, setShengOptions] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState('');
  const [defaultAddressInfo, setDefaultAddressInfo] = useState(null);

  const [currentShiData, setShiData] = useState({
    parentCode: undefined,
    data: [],
  });

  const [currentXianData, setXianData] = useState({
    parentCode: undefined,
    data: [],
  });
  const [currentXiangzhenData, setXiangzhenData] = useState({
    parentCode: undefined,
    data: [],
  });

  const [countryId, setCountryId] = useState('');

  const { userId: strorageName, companyId } = getUserConfigInfo();
  const { first, second, third, fourth } = getStorage(`${strorageName}_region`) || {};
  const { shengName, shengId, sheng } = first || {};
  const { shiName, shiId, shi } = second || {};
  const { xianName, xianId, xian } = third || {};
  const { xiangzhenName, xiangzhenId } = fourth || {};

  const [selectSheng, setSelectSheng] = useState(shengName || '');
  const [selectShi, setSelectShi] = useState(shiName || '');
  const [selectXian, setSelectXian] = useState(xianName || '');
  const [selectXiangzhen, setSelectXiangzhen] = useState(xiangzhenName || '');
  const [lastNode, setLastNode] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);

  // const [areaId3, setAreaId3] = useState(xiangzhenId); // 乡镇code
  const [areaId2, setAreaId2] = useState(xianId); // 县code
  const [areaId1, setAreaId1] = useState(shiId); // 市code
  const [areaId0, setAreaId0] = useState(shengId); // 省code
  // const [addressRgId3, setAddressRgId3] = useState(xiangzhen); // 乡镇匹配id到name
  const [addressRgId2, setAddressRgId2] = useState(xian); // 县匹配id到name
  const [addressRgId1, setAddressRgId1] = useState(shi); // 市匹配id到name
  const [addressRgId0, setAddressRgId0] = useState(sheng); // 省匹配id到name

  /**
   * fetchProvince 查询省份
   */
  const fetchProvince = (cId = '') => {
    const id = cId === '' ? countryId : cId;
    if (id) {
      fetchProvinceService({ countryId: id })
        .then((res) => {
          const options = res.content.map((item) => ({
            ...item,
            value: item.regionId,
            meaning: item.regionName,
          }));
          setShengOptions(options);
        })
        .catch(() => {});
    }
  };

  /**
   * 查询市,县，乡镇
   */
  const fetchCityInfo = ({ type, code, name, id }) => {
    const params = {
      regionCode: code,
    };
    fetchCityInfoService(params).then((res) => {
      const options = res.content.map((i) => ({
        ...i,
        value: i.regionId,
        meaning: i.regionName,
      }));
      if (options.length > 0) {
        if (type === 'shiOptions') {
          setShiData({
            parentCode: code,
            data: options,
          });
        } else if (type === 'xianOptions') {
          setXianData({
            parentCode: code,
            data: options,
          });
        } else if (type === 'xiangzhenOptions') {
          setXiangzhenData({
            parentCode: code,
            data: options,
          });
        }
      } else {
        props.setVisible(false);
        if (type === 'xiangzhenOptions') {
          setStorage(`${strorageName}_region`, {
            first: { shengName: selectSheng, shengId: areaId0, sheng: addressRgId0 },
            second: { shiName: selectShi, shiId: areaId1, shi: addressRgId1 },
            third: { xianName: name, xianId: code, xian: id },
          });
        }
        window.location.reload();
      }
    });
  };

  /**
   * 请求地址数据
   * @param {Object} params - 查询地址参数
   * @param {Boolean} loading - 请求时是否开启loading
   */
  const fetchAddress = () => {
    const newParams = {
      addressType: 'RECEIVER',
      companyId,
    };
    queryAddress(newParams).then((res) => {
      const { content = [] } = res;
      if (content.length === 0) {
        removeStorage(`${strorageName}_defaultAddressName`);
        removeStorage(`${strorageName}_defaultAddressCode`);
        removeStorage(`${strorageName}_defaultAddressId`);
      }
      if (content.length > 0) {
        setDefaultAddressInfo(content[0]);
        setDefaultAddress(content && content[0].fullAddress);
        setSelectSheng(shengName || content[0].regionNameList[0]);
        setSelectShi(shiName || content[0].regionNameList[1]);
        setSelectXian(xianName || content[0].regionNameList[2]);
        setSelectXiangzhen(
          xiangzhenName === '' ? '' : xiangzhenName || content[0].regionNameList[3]
        );
        setAreaId0(shengId || content[0].regionCodeList[0]);
        setAreaId1(shiId || content[0].regionCodeList[1]);
        setAreaId2(xianId || content[0].regionCodeList[2]);
        setAddressRgId0(sheng || content[0].regionIdList[0]);
        setAddressRgId1(shi || content[0].regionIdList[1]);
        setAddressRgId2(xian || content[0].regionIdList[2]);
        // setAreaId3(xiangzhenId || content[0].regionCodeList[3]);
        props.setVisible(true);
        const xiangzhenDom = document.getElementById('xiangzhen');

        if (
          ((content[0].regionCodeList.length === 3 && !xiangzhenId) || (third && !fourth)) &&
          xiangzhenDom
        ) {
          xiangzhenDom.style.display = 'none';
        }
      } else if (!third) {
        props.setWhite();
        window.addEventListener(
          'click',
          (e) => {
            if (stockArea.current && !stockArea.current.contains?.(e.target)) {
              props.setblack();
            }
          },
          true
        );
      }
    });
  };

  useEffect(() => {
    if (companyId) {
      fetchAddress();
    }
    // fetchAddress();
    getGetDefaultCountryId().then((res) => {
      setCountryId(res[0]?.countryId);
      fetchProvince(res[0]?.countryId);
    });
  }, []);

  const getDetailArea = useMemo(() => {
    const dataMap = {
      0: shengOptions || [],
      1: areaId0 === currentShiData.parentCode ? currentShiData.data : [],
      2: areaId1 === currentXianData.parentCode ? currentXianData.data : [],
      3: areaId2 === currentXiangzhenData.parentCode ? currentXiangzhenData.data : [],
    };
    const data = dataMap[currentLevel];
    return data.map((item) => {
      return (
        <li className="select-option" title={item.regionName} onClick={() => handleChoose(item)}>
          {item.regionName}
        </li>
      );
    });
  }, [shengOptions, currentShiData, currentXianData, currentXiangzhenData]);

  // 点击地址选择
  function handleChoose(item) {
    const chooseMap = {
      0: () => {
        document.getElementById('shi').style.display = 'block';
        document.getElementById('xian').style.display = 'none';
        document.getElementById('xiangzhen').style.display = 'none';
        document.getElementById('sheng').setAttribute('class', '');
        document.getElementById('shi').setAttribute('class', 'shi-name');
        setCurrentLevel(1);
        if (!(item.regionCode === areaId0 && currentShiData.data.length > 0)) {
          fetchCityInfo({ type: 'shiOptions', code: item.regionCode });
          setSelectShi(undefined);
          setSelectSheng(item.regionName);
          setAreaId0(item.regionCode);
          setAddressRgId0(item.regionId);
        }
      },
      1: () => {
        document.getElementById('xian').style.display = 'block';
        document.getElementById('xiangzhen').style.display = 'none';
        document.getElementById('shi').setAttribute('class', '');
        document.getElementById('xian').setAttribute('class', 'xian-name');
        setCurrentLevel(2);
        if (!(item.regionCode === areaId1 && currentXianData.data.length > 0)) {
          fetchCityInfo({ type: 'xianOptions', code: item.regionCode });
          setSelectShi(item.regionName);
          setSelectXian(undefined);
          setAreaId1(item.regionCode);
          setAddressRgId1(item.regionId);
        }
      },
      2: () => {
        document.getElementById('xiangzhen').style.display = 'block';
        document.getElementById('xian').setAttribute('class', '');
        document.getElementById('xiangzhen').setAttribute('class', 'xiangzhen-name');
        setCurrentLevel(3);
        if (!(item.regionCode === areaId2 && currentXiangzhenData.data.length > 0)) {
          fetchCityInfo({
            type: 'xiangzhenOptions',
            code: item.regionCode,
            name: item.regionName,
            id: item.regionId,
          });
          setSelectXian(item.regionName);
          setSelectXiangzhen(undefined);
          setLastNode(true);
          setAreaId2(item.regionCode);
          setAddressRgId2(item.regionId);
        }
      },
      3: () => {
        let regionName = String(item.regionName);
        if (item.virtualFlag) {
          // 暂不选择不展示
          regionName = '';
        }
        setSelectXiangzhen(regionName);
        setStorage(`${strorageName}_region`, {
          first: { shengName: selectSheng, shengId: areaId0, sheng: addressRgId0 },
          second: { shiName: selectShi, shiId: areaId1, shi: addressRgId1 },
          third: { xianName: selectXian, xianId: areaId2, xian: addressRgId2 },
          fourth: {
            xiangzhenName: regionName,
            xiangzhenId: item.regionCode,
            xiangzhen: item.regionId,
          },
        });
        props.setVisible(false);
        window.location.reload();
      },
    };
    chooseMap[currentLevel]();
  }

  // 将默认地址设为库存查询地区
  function setDefaultArea() {
    if (defaultAddressInfo) {
      const { regionNameList, regionCodeList, regionIdList } = defaultAddressInfo;
      setStorage(`${strorageName}_region`, {
        first: { shengName: regionNameList[0], shengId: regionCodeList[0], sheng: regionIdList[0] },
        second: { shiName: regionNameList[1], shiId: regionCodeList[1], shi: regionIdList[1] },
        third: { xianName: regionNameList[2], xianId: regionCodeList[2], xian: regionIdList[2] },
        fourth: {
          xiangzhenName: regionNameList[3],
          xiangzhenId: regionCodeList[3],
          xiangzhen: regionIdList[3],
        },
      });
      window.location.reload();
    }
  }

  function showProvince() {
    fetchProvince();
    document.getElementById('sheng').setAttribute('class', 'sheng-name');
    document.getElementById('shi').setAttribute('class', '');
    document.getElementById('xian').setAttribute('class', '');
    setCurrentLevel(0);
    if (document.getElementById('xiangzhen')) {
      document.getElementById('xiangzhen').setAttribute('class', '');
    }
  }

  function showShi() {
    fetchCityInfo({ type: 'shiOptions', code: areaId0 });
    document.getElementById('shi').setAttribute('class', 'shi-name');
    document.getElementById('sheng').setAttribute('class', '');
    document.getElementById('xian').setAttribute('class', '');
    setCurrentLevel(1);
    if (document.getElementById('xiangzhen')) {
      document.getElementById('xiangzhen').setAttribute('class', '');
    }
  }

  function showXian() {
    fetchCityInfo({ type: 'xianOptions', code: areaId1 });
    document.getElementById('xian').setAttribute('class', 'xian-name');
    document.getElementById('sheng').setAttribute('class', '');
    document.getElementById('shi').setAttribute('class', '');
    setCurrentLevel(2);
    if (document.getElementById('xiangzhen')) {
      document.getElementById('xiangzhen').setAttribute('class', '');
    }
  }

  function showXiangzhen() {
    fetchCityInfo({ type: 'xiangzhenOptions', code: areaId2, name: selectXian, id: addressRgId2 });
    document.getElementById('xiangzhen').setAttribute('class', 'xiangzhen-name');
    document.getElementById('sheng').setAttribute('class', '');
    document.getElementById('shi').setAttribute('class', '');
    document.getElementById('xian').setAttribute('class', '');
    setCurrentLevel(3);
  }

  return (
    <React.Fragment>
      <div
        id="area-wrapper"
        className={style['area-wrapper']}
        onMouseLeave={() => {
          props.setVisible(!(third || defaultAddressInfo));
        }}
        ref={stockArea}
      >
        <div className="default-address">
          {intl.get('mallf.common.view.default.address').d('默认地址')}
        </div>
        <div className="address-value" onClick={() => setDefaultArea()}>
          {defaultAddress || intl.get('mallf.common.view.no.defaultAddress').d('暂无默认地址')}
        </div>
        <div className="stock-search">
          {intl.get('mallf.common.view.address.choose').d('地址选择')}
        </div>
        <div className="all-city">
          <div className="select-city">
            <span
              id="sheng"
              className="sheng-name"
              onClick={() => showProvince()}
              style={{ marginRight: '4px' }}
            >
              {selectSheng || intl.get('mallf.common.model.provincePlaceholder').d('请选择省')}
            </span>
            <span
              id="shi"
              className=""
              style={{ display: selectSheng ? 'block' : 'none', marginRight: '4px' }}
              onClick={() => showShi()}
            >
              {selectShi || intl.get('mallf.common.model.cityPlaceholder').d('请选择市')}
            </span>
            <span
              id="xian"
              className=""
              style={{ display: selectShi ? 'block' : 'none' }}
              onClick={() => showXian()}
            >
              {selectXian || intl.get('mallf.common.model.countyPlaceholder').d('请选择县')}
            </span>
            {/* {!(addressArr.length === 4 && !xiangzhenId)&& ( */}
            <span
              id="xiangzhen"
              className=""
              style={{ display: (selectXian && selectXiangzhen) || lastNode ? 'block' : 'none' }}
              onClick={() => showXiangzhen()}
            >
              {selectXiangzhen || intl.get('mallf.common.model.townPlaceholder').d('请选择乡镇')}
            </span>
            {/* )} */}
          </div>
          <ul className="ul-container">
            <div className="li-container">{getDetailArea}</div>
          </ul>
        </div>
      </div>
    </React.Fragment>
  );
}

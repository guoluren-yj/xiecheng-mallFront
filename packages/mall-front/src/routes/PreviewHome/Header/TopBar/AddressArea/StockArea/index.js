import React, { useState, useEffect, useRef, useMemo } from 'react';
import { isEmpty } from 'lodash';
import { setStorage, getUserConfigInfo, getStorage, removeStorage } from 'utils/utils';
import {
  fetchProvinceService,
  fetchCityInfoService,
  // fetchAddressService,
  queryAddress,
} from 'services/addressService';
import { fetchCountryList } from 'services/api';

import intl from 'utils/intl';
import style from './index.less';

export default function StockArea(props) {
  const stockArea = useRef(null);
  const [countryOptions, setCountryOptions] = useState([]);
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

  const { userId: strorageName, companyId } = getUserConfigInfo();
  const { first, second, third, fourth } = getStorage(`${strorageName}_region`) || {};
  const country = getStorage(`${strorageName}_country`) || {};
  const { shengName, shengId, sheng } = first || {};
  const { shiName, shiId, shi } = second || {};
  const { xianName, xianId, xian } = third || {};
  const { xiangzhenName, xiangzhenId } = fourth || {};

  const [selectCountry, setSelectCountry] = useState(country.countryName || '');
  const [countryId, setCountryId] = useState(country.countryId || '');
  const [selectSheng, setSelectSheng] = useState(shengName || '');
  const [selectShi, setSelectShi] = useState(shiName || '');
  const [selectXian, setSelectXian] = useState(xianName || '');
  const [selectXiangzhen, setSelectXiangzhen] = useState(xiangzhenName || '');
  const [lastNode, setLastNode] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(-1); // -1 代表先选国家

  // const [areaId3, setAreaId3] = useState(xiangzhenId); // 乡镇code
  const [areaId2, setAreaId2] = useState(xianId); // 县code
  const [areaId1, setAreaId1] = useState(shiId); // 市code
  const [areaId0, setAreaId0] = useState(shengId); // 省code
  // const [addressRgId3, setAddressRgId3] = useState(xiangzhen); // 乡镇匹配id到name
  const [addressRgId2, setAddressRgId2] = useState(xian); // 县匹配id到name
  const [addressRgId1, setAddressRgId1] = useState(shi); // 市匹配id到name
  const [addressRgId0, setAddressRgId0] = useState(sheng); // 省匹配id到name

  /**
   * fetchCountry 查询国家
   */
  const fetchCountry = () => {
    fetchCountryList().then((res) => {
      const options = res.content?.map((item) => ({
        ...item,
        value: item.countryId,
        meaning: item.countryName,
      }));
      setCountryOptions(options);
    });
    if (!isEmpty(country)) {
      setSelectCountry(country?.countryName);
      setCountryId(country?.countryId);
      fetchProvince(country?.countryId);
    }
  };

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
  const fetchCityInfo = ({ type, code, name, id, item }) => {
    const params = {
      regionCode: code,
    };
    fetchCityInfoService(params).then((res) => {
      const options = res.content.map((i) => {
        const isNAFlag = i?.regionIdList?.length >= 2;
        const meaning = isNAFlag // 判断是否为N/A
          ? intl.get(`mallf.common.view.address.NANotSelectTmep`).d('暂不选择')
          : i.regionName;
        const regionName = isNAFlag // 判断是否为N/A
          ? intl.get(`mallf.common.view.address.NANotSelectTmep`).d('暂不选择')
          : i.regionName;
        return {
          ...i,
          value: i.regionId,
          meaning,
          regionName,
          isNAFlag,
        };
      });
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
        const { levelPath = '', regionIdList, isNAFlag } = item || {};
        const regionCodeList = String(levelPath).split('.') || [];
        if (type === 'shiOptions') {
          // 选二级查三级，此时只有两级
          setStorage(`${strorageName}_region`, {
            first: { shengName: selectSheng, shengId: areaId0, sheng: addressRgId0 },
            second: { shiName: '', shiId: '', shi: '' },
            third: { xianName: '', xianId: '', xian: '' },
          });
        } else if (type === 'xianOptions') {
          // 选二级查三级，此时只有两级
          setStorage(`${strorageName}_region`, {
            first: { shengName: selectSheng, shengId: areaId0, sheng: addressRgId0 },
            // 判断是否选择了N/A，此时，code为完整的levelpath id为N/A所有的id isNAFlag标识给保存后展示
            second: {
              shiName: name,
              shiId: isNAFlag ? regionCodeList?.[1] : code,
              shi: isNAFlag ? regionIdList?.[0] : id,
              isNAFlag,
            },
            third: {
              xianName: '',
              xianId: isNAFlag ? regionCodeList?.[2] || '' : '',
              xian: isNAFlag ? regionIdList?.[1] || '' : '',
              isNAFlag,
            },
          });
        } else if (type === 'xiangzhenOptions') {
          // 选三级查四级，此时只有三级
          setStorage(`${strorageName}_region`, {
            first: { shengName: selectSheng, shengId: areaId0, sheng: addressRgId0 },
            second: { shiName: selectShi, shiId: areaId1, shi: addressRgId1 },
            third: {
              xianName: name,
              xianId: isNAFlag ? regionCodeList?.[2] || '' : code,
              xian: isNAFlag ? regionIdList?.[0] : id,
              isNAFlag,
            },
          });
        }
        setStorage(`${strorageName}_country`, {
          countryId,
          countryName: selectCountry,
        });
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
        setDefaultAddress(`none`);
      }
      if (content.length > 0) {
        setDefaultAddressInfo(content[0]);
        setDefaultAddress(`${content[0]?.regionNameList.join('')}${content[0]?.address}`);
        setSelectSheng(shengName || content[0].regionNameList[0]);
        setSelectShi(shiName || content[0].regionNameList[1]);
        setSelectXian(xianName === '' ? '' : xianName || content[0].regionNameList[2]);
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
    fetchCountry();
  }, []);

  const getDetailArea = useMemo(() => {
    const dataMap = {
      '-1': countryOptions || [], // -1代表先选国家
      0: shengOptions || [],
      1: areaId0 === currentShiData.parentCode ? currentShiData.data : [],
      2: areaId1 === currentXianData.parentCode ? currentXianData.data : [],
      3: areaId2 === currentXiangzhenData.parentCode ? currentXiangzhenData.data : [],
    };
    const data = dataMap[currentLevel];
    return data.map((item) => {
      return (
        <li
          className="select-option"
          title={item.regionName || item.meaning}
          onClick={() => handleChoose(item)}
        >
          {item.regionName || item.meaning}
        </li>
      );
    });
  }, [countryOptions, shengOptions, currentShiData, currentXianData, currentXiangzhenData]);

  // 点击地址选择
  function handleChoose(item) {
    const chooseMap = {
      '-1': () => {
        document.getElementById('sheng').style.display = 'block';
        document.getElementById('shi').style.display = 'none';
        document.getElementById('xian').style.display = 'none';
        document.getElementById('xiangzhen').style.display = 'none';
        document.getElementById('country').setAttribute('class', '');
        document.getElementById('sheng').setAttribute('class', 'sheng-name');
        setCurrentLevel(0);
        fetchProvince(item.countryId);
        setSelectSheng(undefined);
        setCountryId(item?.countryId);
        setSelectCountry(item.countryName);
      },
      0: () => {
        document.getElementById('shi').style.display = 'block';
        document.getElementById('xian').style.display = 'none';
        document.getElementById('xiangzhen').style.display = 'none';
        document.getElementById('country').setAttribute('class', '');
        document.getElementById('sheng').setAttribute('class', '');
        document.getElementById('shi').setAttribute('class', 'shi-name');
        setCurrentLevel(1);
        if (!(item.regionCode === areaId0 && currentShiData.data.length > 0)) {
          fetchCityInfo({
            type: 'shiOptions',
            code: item.regionCode,
            name: item.regionName,
            id: item.regionId,
            item,
          });
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
          fetchCityInfo({
            type: 'xianOptions',
            code: item.regionCode,
            name: item.regionName,
            id: item.regionId,
            item,
          });
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
            item,
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
        setStorage(`${strorageName}_country`, {
          countryId,
          countryName: selectCountry,
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
      const {
        regionNameList,
        regionCodeList,
        regionIdList,
        countryName,
        countryId: sotrageCountryId,
      } = defaultAddressInfo;
      setStorage(`${strorageName}_region`, {
        first: { shengName: regionNameList[0], shengId: regionCodeList[0], sheng: regionIdList[0] },
        second: {
          shiName: regionNameList[1],
          shiId: regionCodeList[1],
          shi: regionIdList[1],
          isNAFlag: regionIdList[1] && !regionNameList[1],
        }, // 处理选择为NA的默认地址设置为当前定位
        third: {
          xianName: regionNameList[2],
          xianId: regionCodeList[2],
          xian: regionIdList[2],
          isNAFlag: regionIdList[2] && !regionNameList[2],
        },
        fourth: {
          xiangzhenName: regionNameList[3],
          xiangzhenId: regionCodeList[3],
          xiangzhen: regionIdList[3],
        },
      });
      setStorage(`${strorageName}_country`, {
        // 设置国家，用来展示
        countryId: sotrageCountryId,
        countryName,
      });
      window.location.reload();
    }
  }

  function showCountry() {
    fetchProvince();
    document.getElementById('country').setAttribute('class', 'country-name');
    document.getElementById('sheng').setAttribute('class', '');
    document.getElementById('shi').setAttribute('class', '');
    document.getElementById('xian').setAttribute('class', '');
    setCurrentLevel(-1);
    if (document.getElementById('xiangzhen')) {
      document.getElementById('xiangzhen').setAttribute('class', '');
    }
  }

  function showProvince() {
    fetchProvince();
    document.getElementById('country').setAttribute('class', '');
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
    document.getElementById('country').setAttribute('class', '');
    document.getElementById('shi').setAttribute('class', 'shi-name');
    document.getElementById('sheng').setAttribute('class', '');
    document.getElementById('xian').setAttribute('class', '');
    setCurrentLevel(1);
    if (document.getElementById('xiangzhen')) {
      document.getElementById('xiangzhen').setAttribute('class', '');
    }
  }

  function showXian() {
    if (!selectXian) return;
    fetchCityInfo({ type: 'xianOptions', code: areaId1 });
    document.getElementById('country').setAttribute('class', '');
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
    document.getElementById('country').setAttribute('class', '');
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
        <div className="address-title">
          {intl.get('mallf.common.view.default.address').d('默认地址')}
        </div>
        <div className="address-value" onClick={() => setDefaultArea()}>
          {defaultAddress === 'none'
            ? intl.get('mallf.common.view.no.defaultAddress').d('暂无默认地址')
            : defaultAddress}
        </div>
        <div className="address-title">
          {intl.get('mallf.common.view.address.choose').d('地址选择')}
        </div>
        <div className="all-city">
          <div className="select-city">
            <span
              id="country"
              className="country-name"
              onClick={() => showCountry()}
              style={{ marginRight: '4px' }}
              title={
                selectCountry || intl.get('mallf.common.model.countryPlaceholder').d('请选择国家')
              }
            >
              {selectCountry || intl.get('mallf.common.model.countryPlaceholder').d('请选择国家')}
            </span>
            <span
              id="sheng"
              className=""
              onClick={() => showProvince()}
              style={{ marginRight: '4px' }}
              title={
                selectSheng || intl.get('mallf.common.model.provincePlaceholder').d('请选择省')
              }
            >
              {selectSheng || intl.get('mallf.common.model.provincePlaceholder').d('请选择省')}
            </span>
            <span
              id="shi"
              className=""
              style={{ display: selectSheng ? 'block' : 'none', marginRight: '4px' }}
              onClick={() => showShi()}
              title={selectShi || intl.get('mallf.common.model.cityPlaceholder').d('请选择市')}
            >
              {selectShi || intl.get('mallf.common.model.cityPlaceholder').d('请选择市')}
            </span>
            <span
              id="xian"
              className=""
              style={{ display: selectShi ? 'block' : 'none' }}
              onClick={() => showXian()}
              title={
                selectXian ||
                (!isEmpty(currentXianData.data) &&
                  intl.get('mallf.common.model.countyPlaceholder').d('请选择县'))
              }
            >
              {selectXian ||
                (!isEmpty(currentXianData.data) &&
                  intl.get('mallf.common.model.countyPlaceholder').d('请选择县'))}
            </span>
            {/* {!(addressArr.length === 4 && !xiangzhenId)&& ( */}
            <span
              id="xiangzhen"
              className=""
              style={{ display: (selectXian && selectXiangzhen) || lastNode ? 'block' : 'none' }}
              onClick={() => showXiangzhen()}
              title={
                selectXiangzhen || intl.get('mallf.common.model.townPlaceholder').d('请选择乡镇')
              }
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

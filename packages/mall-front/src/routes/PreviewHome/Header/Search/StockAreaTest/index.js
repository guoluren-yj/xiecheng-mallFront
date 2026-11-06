import React, { useEffect, useRef } from 'react';
import { Spin } from 'hzero-ui';
import { setStorage, getUserConfigInfo, getStorage } from 'utils/utils';
import { getGetDefaultCountryId } from 'services/api';
import {
  fetchProvinceService,
  fetchCityInfoService,
  fetchAddressService,
} from 'services/addressService';
import useState from '@/hooks/useState';
import intl from 'utils/intl';
import style from './index.less';

export default function StockArea(props) {
  const stockArea = useRef(null);
  const { userId, companyId } = getUserConfigInfo();
  const region = getStorage(`${userId}_regionCode`);
  const regionName = getStorage(`${userId}_regionName`);
  const [state, setState] = useState({
    options: [],
    loading: false,
    currentLevel: 0,
    defaultAddress: '',
    regionNames: [],
    regionCodes: [],
    countryId: undefined,
  });
  const [regionInfo, setRegion] = useState({
    shengName: regionName[0],
    shiName: regionName[1],
    xianName: regionName[2],
    xiangzhenName: regionName[3],
    shengCode: region[0],
    shiCode: region[1],
    xianCode: region[2],
    xiangzhenCode: region[3],
  });

  /**
   * fetchProvince 查询省份
   */
  const fetchProvince = (cId = '') => {
    const id = cId === '' ? state.countryId : cId;
    if (id) {
      setState({ loading: true });
      fetchProvinceService({ countryId: id })
        .then((res) => {
          const options = res.content.map((item) => ({
            ...item,
            value: item.regionId,
            meaning: item.regionName,
            regionCode: item.regionCode,
          }));
          setState({
            options,
            loading: false,
          });
        })
        .finally(() => setState({ loading: false }))
        .catch(() => {});
    }
  };

  /**
   * 查询市,县，乡镇
   */
  const fetchCityInfo = (regions, isClearNext = false) => {
    const params = {
      regionCode: regions.regionCode,
    };
    setState({
      currentLevel: regions.regionLevel,
      loading: true,
    });
    handleControlCurrentClass(regions.regionLevel);
    if (isClearNext) {
      if (state.currentLevel === 0) {
        setRegion({
          shengName: regions.regionName,
          shiName: '',
          xianName: '',
          xiangzhenName: '',
          shengCode: regions.regionCode,
          shiCode: '',
          xianCode: '',
          xiangzhenCode: '',
        });
      }
      if (state.currentLevel === 1) {
        setRegion({
          shiName: regions.regionName,
          xianName: '',
          xiangzhenName: '',
          shiCode: regions.regionCode,
          xianCode: '',
          xiangzhenCode: '',
        });
      }
      if (state.currentLevel === 2) {
        setRegion({
          xianName: regions.regionName,
          xiangzhenName: '',
          xianCode: regions.regionCode,
          xiangzhenCode: '',
        });
      }
      if (state.currentLevel === 3) {
        setRegion({
          xiangzhenName: regions.regionName,
          xiangzhenCode: regions.regionCode,
        });
      }
    }
    fetchCityInfoService(params)
      .then((res) => {
        const options = res.content.map((i) => ({
          ...i,
          value: i.regionId,
          meaning: i.regionName,
          regionCode: i.regionCode,
        }));
        if (options.length > 0) {
          setState({
            options,
            loading: false,
          });
          if (state.currentLevel === 3) {
            document.getElementById('xiangzhen').style.display = 'block';
          }
        } else {
          props.setVisible(false);
          let selCode = [];
          let selName = [];
          if (state.currentLevel === 2) {
            selName = [regionInfo.shengName, regionInfo.shiName, regions.regionName];
            selCode = [regionInfo.shengCode, regionInfo.shiCode, regions.regionCode];
          }
          if (state.currentLevel === 3) {
            selName = [
              regionInfo.shengName,
              regionInfo.shiName,
              regionInfo.xianName,
              regions.regionName,
            ];
            selCode = [
              regionInfo.shengCode,
              regionInfo.shiCode,
              regionInfo.xianCode,
              regions.regionCode,
            ];
          }
          setStorage(`${userId}_regionCode`, selCode);
          setStorage(`${userId}_regionName`, selName);
          window.location.reload();
        }
      })
      .finally(() => setState({ loading: false }));
  };

  useEffect(() => {
    fetchAddress({ enabledFlag: 1, defaultFlag: 1, userId, companyId });
  }, []);

  /**
   * 请求地址数据
   * @param {Object} params - 查询地址参数
   * @param {Boolean} loading - 请求时是否开启loading
   */
  const fetchAddress = (params = { enabledFlag: 1, defaultFlag: 1 }) => {
    const newParams = {
      addressType: 'RECEIVER',
      ...params,
    };
    fetchAddressService(newParams).then((res) => {
      const { content = [] } = res;
      if (content.length > 0) {
        setState({
          defaultAddress: content[0].fullAddress,
          regionNames: content[0].regionNameList,
          regionCodes: content[0].regionCodeList,
        });
        if (!region) {
          setRegion({
            shengName: content[0].regionNameList[0],
            shiName: content[0].regionNameList[1],
            xianName: content[0].regionNameList[2],
            xiangzhenName: content[0].regionNameList[3],
            shengCode: content[0].regionCodeList[0],
            shiCode: content[0].regionCodeList[1],
            xianCode: content[0].regionCodeList[2],
            xiangzhenCode: content[0].regionCodeList[3],
          });
        }
        props.setVisible(true);
        if (content[0].regionIdList.length === 3) {
          document.getElementById('xiangzhen').style.display = 'none';
        }
      } else if (!region) {
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
    getGetDefaultCountryId().then((res) => {
      setState({
        countryId: res[0].countryId,
      });
      fetchProvince(res[0].countryId);
    });
  }, []);

  function getDetailArea() {
    return (
      state.options &&
      state.options.map((item) => {
        return (
          <li
            className="select-option"
            onClick={() => {
              fetchCityInfo(item, true);
            }}
          >
            {item.regionName}
          </li>
        );
      })
    );
  }

  // 将默认地址设为库存查询地区
  function setDefaultArea() {
    if (state.defaultAddress) {
      setStorage(`${userId}_regionCode`, state.regionCodes);
      setStorage(`${userId}_regionName`, state.regionNames);
      window.location.reload();
    }
  }

  function showProvince() {
    fetchProvince();
    document.getElementById('sheng').setAttribute('class', 'sheng-name');
    document.getElementById('shi').setAttribute('class', '');
    document.getElementById('xian').setAttribute('class', '');
    if (document.getElementById('xiangzhen')) {
      document.getElementById('xiangzhen').setAttribute('class', '');
    }
  }

  function handleControlCurrentClass(level) {
    if (level === 1) {
      document.getElementById('shi').setAttribute('class', 'shi-name');
      document.getElementById('sheng').setAttribute('class', '');
      document.getElementById('xian').setAttribute('class', '');
      if (document.getElementById('xiangzhen')) {
        document.getElementById('xiangzhen').setAttribute('class', '');
      }
    }
    if (level === 2) {
      document.getElementById('shi').setAttribute('class', '');
      document.getElementById('sheng').setAttribute('class', '');
      document.getElementById('xian').setAttribute('class', 'xian-name');
      if (document.getElementById('xiangzhen')) {
        document.getElementById('xiangzhen').setAttribute('class', '');
      }
    }
    if (level === 3) {
      document.getElementById('shi').setAttribute('class', '');
      document.getElementById('sheng').setAttribute('class', '');
      document.getElementById('xian').setAttribute('class', '');
      document.getElementById('xiangzhen').setAttribute('class', 'xiangzhen-name');
    }
  }

  function showCity(item) {
    fetchCityInfo(item);
  }

  return (
    <React.Fragment>
      <div
        id="area-wrapper"
        className={style['area-wrapper']}
        onMouseLeave={() => {
          props.setVisible(!region);
        }}
        ref={stockArea}
      >
        <div className="default-address">
          {intl.get('mallf.common.view.default.address').d('默认地址')}
        </div>
        <div className="address-value" onClick={() => setDefaultArea()}>
          {state.defaultAddress ||
            intl.get('mallf.common.view.no.default.address').d('暂无默认地址')}
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
              {regionInfo.shengName ||
                intl.get(`mallf.common.model.provincePlaceholder`).d('请选择省')}
            </span>
            <span
              id="shi"
              className=""
              style={{ display: state.defaultAddress ? 'block' : 'none', marginRight: '4px' }}
              onClick={() =>
                showCity({
                  regionName: regionInfo.shengName,
                  regionCode: regionInfo.shengCode,
                  regionLevel: 1,
                })
              }
            >
              {regionInfo.shiName || intl.get(`mallf.common.model.cityPlaceholder`).d('请选择市')}
            </span>
            <span
              id="xian"
              className=""
              style={{ display: state.defaultAddress ? 'block' : 'none' }}
              onClick={() =>
                showCity({
                  regionName: regionInfo.shiName,
                  regionCode: regionInfo.shiCode,
                  regionLevel: 2,
                })
              }
            >
              {regionInfo.xianName ||
                intl.get(`mallf.common.model.countyPlaceholder`).d('请选择县')}
            </span>
            {/* {!(addressArr.length === 4 && !xiangzhenId)&& ( */}
            <span
              id="xiangzhen"
              className=""
              style={{ display: state.defaultAddress ? 'block' : 'none' }}
              onClick={() =>
                showCity({
                  regionName: regionInfo.xianName,
                  regionCode: regionInfo.xianCode,
                  regionLevel: 3,
                })
              }
            >
              {regionInfo.xiangzhenName ||
                intl.get(`mallf.common.model.townPlaceholder`).d('请选择乡镇')}
            </span>
            {/* )} */}
          </div>
          <ul className="ul-container">
            <Spin spinning={state.loading}>
              <div className="li-container">{getDetailArea()}</div>
            </Spin>
          </ul>
        </div>
      </div>
    </React.Fragment>
  );
}

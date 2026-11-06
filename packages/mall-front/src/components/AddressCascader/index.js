import React, { useState, useEffect } from 'react';
import { isEmpty } from 'lodash';
import { Input, Icon, Cascader, Tooltip, LocaleProvider as C7NLocaleProvider } from 'choerodon-ui';

import intl from 'utils/intl';
import { getUserConfigInfo, getStorage } from 'utils/utils';
import { fetchCityInfoService } from 'services/addressService';
import { getGetDefaultCountryId, fetchCountryList } from 'services/api';
import { getC7nLocale } from 'services/localeApi';
import styles from './index.less';

export default function AddressCascader(props) {
  const {
    label,
    displayValue,
    disabled: regionDisabled,
    onChange,
    tooltip,
    style,
    selectCity = [],
  } = props;
  const { userId: strorageName, language } = getUserConfigInfo();

  const [countryData, setCountryData] = useState([]);
  const [cityData, setCityData] = useState([selectCity]);
  const [addressName, setAddressName] = useState();

  const [c7nLocale, setC7nLocale] = useState({});
  useEffect(() => {
    if (language) {
      getC7nLocale(language).then((langData) => {
        setC7nLocale(langData);
      });
    }
  }, []);

  useEffect(() => {
    setAddressName(displayValue);
  }, [displayValue]);

  // useEffect(() => {
  //   fetchCityInfoService().then((resp) => {
  //     if (resp) {
  //       const newRes = resp.content.map((item) => {
  //         const { regionName, regionId } = item;
  //         return {
  //           ...item,
  //           label: regionName,
  //           value: regionId,
  //         };
  //       });
  //       setCityData(newRes);
  //     }
  //   });
  // }, []);

  function getProvince(cid, list) {
    fetchCityInfoService({ countryId: cid }).then((resp) => {
      if (resp) {
        const newRes = resp.content.map((item) => {
          const { regionName, regionId } = item;
          return {
            ...item,
            label: regionName,
            value: regionId,
          };
        });
        list.forEach((c) => {
          if (c.countryId === cid) {
            // eslint-disable-next-line no-param-reassign
            c.children = newRes;
          }
        });
        setCityData(list);
      }
    });
  }

  // useEffect(() => {
  //   fetchCountry();
  // }, []);

  /**
   * fetchCountry 查询国家
   */
  const fetchCountry = (e) => {
    if (e.target?.nodeName !== 'I') return;
    const country = getStorage(`${strorageName}_country`) || {};
    // fetchCountryList()//getGetDefaultCountryId
    fetchCountryList().then((res) => {
      const options = (res.content || res)?.map((item) => ({
        ...item,
        children: null,
        countryFlag: true,
        isLeaf: false,
        regionName: item.countryName,
        value: item.countryId,
        label: item.countryName,
      }));
      setCityData(options);
      if (!isEmpty(country)) {
        setCountryData({
          countryId: country?.countryId,
          countryName: country?.countryName,
        });
        getProvince(country?.countryId, options);
      } else {
        getGetDefaultCountryId(language.split('_')?.[1]).then((r) => {
          setCountryData({
            countryId: r[0]?.countryId,
            countryName: r[0]?.countryName,
          });
          getProvince(country?.countryId, options);
        });
      }
    });
  };

  // 地址异步加载
  function addressLoadData(selectedOptions) {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    if (targetOption.countryId) {
      setCountryData({
        countryId: targetOption.countryId,
        countryName: targetOption.countryName,
      });
    }
    targetOption.loading = true;
    fetchCityInfoService({
      regionCode: targetOption.regionCode,
      countryId: targetOption.countryId,
    }).then((res) => {
      if (res) {
        targetOption.loading = false;
        const newRes = res.content.map((item) => {
          const { regionName, regionId, regionIdList } = item;
          const isNAFlag = Array.isArray(regionIdList) && regionIdList?.length >= 2; // 判断是否为NA
          return {
            ...item,
            label: !isNAFlag
              ? regionName
              : intl.get(`mallf.common.view.address.NANotSelectTmep`).d('暂不选择'),
            value: regionId,
            isNAFlag,
          };
        });
        targetOption.children = newRes;
        setCityData([...cityData]);
      }
    });
  }

  /**
   * 选择地区拼接
   */
  function handleSelectRegion(idList, selectedOptions = []) {
    const nameList = selectedOptions
      .map(
        (option) =>
          !option.countryFlag && !option.virtualFlag && !option.isNAFlag && option.regionName
      ) // 过滤展示的内容 na不展示
      .filter((n) => !!n);
    const codeList = selectedOptions
      .map((option) => !option.countryFlag && option.regionCode)
      .filter((n) => !!n);
    const isLeafFlag = selectedOptions.some((n) => n.isLeaf);
    const newIdList = selectedOptions
      .map((option) => !option.countryFlag && !option.virtualFlag && option.regionId)
      .filter((n) => !!n);
    if (onChange) {
      onChange(newIdList, nameList, isLeafFlag, codeList, countryData);
    }
    setAddressName(nameList.join('/'));
  }

  const addressCascader = (
    <C7NLocaleProvider locale={c7nLocale}>
      <Cascader
        disabled={regionDisabled}
        style={{ width: '100%' }}
        options={cityData}
        menuMode="single"
        changeOnSelect
        loadData={(option) => addressLoadData(option)}
        onChange={handleSelectRegion}
      >
        <Icon
          type="arrow_drop_down"
          style={{
            fontSize: '16px',
            color: '#191919',
            cursor: regionDisabled ? 'not-allowed' : 'pointer',
          }}
        />
      </Cascader>
    </C7NLocaleProvider>
  );

  return (
    <Tooltip title={tooltip || ''} placement="bottom">
      <div className={styles['address-cascader']} onClick={fetchCountry}>
        <Input
          label={label || null}
          suffix={addressCascader}
          disabled={regionDisabled}
          readOnly
          value={addressName}
          style={style}
        />
      </div>
    </Tooltip>
  );
}

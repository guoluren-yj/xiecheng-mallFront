/* eslint-disable prefer-destructuring */
import React, { useEffect, useRef, useMemo } from 'react';
import qs from 'qs';
import { isEmpty } from 'lodash';
import { Observer } from 'mobx-react-lite';
import { Icon, Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import {
  getUserConfigInfo,
  catchHttpError,
  getStorage,
  setStorage,
  convertImg,
  getNANId,
  // numberRender,
} from 'utils/utils';
import Image from 'components/Image';
import BreadCrumbs from 'components/BreadCrumbs';
import PriceCompare from 'components/ComparePrice';
import Loading from 'components/loading';
import useState from '@/hooks/useState';
import formatterCollections from 'utils/intl/formatterCollections';
import { fetchZoneListService } from 'services/zoneProductService';
import {
  fetchProduct,
  fetchCurrentCategoryService,
  fetchBannerDetail,
  fetchCustomDetail,
  fetchZhuanquDetail,
} from 'services/productListService';
import {
  getProductDetail,
  getProductSku,
  fetchSubInvoiceList,
  fetchSubPurchaseList,
  queryAddress,
} from 'services/productDetailService';
import useDimensTemplates from '@/hooks/useDimensTemplates';
import useValidKeyword from '@/hooks/useValidKeyword';
import { math } from 'choerodon-ui/dataset';
import { ShowCompare } from 'utils/renderer';
import { numberRender, getCacheAddress } from '@/utils/utils';
import CuxFn from '@/cuxTools/cuxFn';
// import SearchRow from './searchRow';
import AttributeRow, { AttributeProRow, CatalogRow } from './AttributeRow';
// import SearchConditions from './searchConditions';
import ContentList from './contentList';
import Attribute from './Attribute';
import SearchCompare from './SearchCompare';
import style from './index.less';
// const productContentHeight = 1000; // 商品内容区高度
const productAttrs = {};
let offset; // 偏移量 后端返回给前端后更新
let scrollId; // 后端返回给前端后更新
let noMore;
let allEle; // 采用原分页逻辑
const times = 10;
let fetchCount = 0; // 不足20条则请求两次
const maxPage = 19; // 最多20页

function ProductList(props) {
  const [subInvoice, SetSubInvoice] = useState([]);
  const [subPurchase, SetSubPurchase] = useState([]);
  const count = useRef(0);
  const levelName = [
    intl.get('mallf.productList.view.productList.OneLevel').d('一级目录'),
    intl.get('mallf.productList.view.productList.twoLevel').d('二级目录'),
    intl.get('mallf.productList.view.productList.threeLevel').d('三级目录'),
  ];
  // 获取url的相关信息
  const { search } = props.location;
  const {
    userId,
    levelPath,
    companyId,
    custWebConfig: { defaultSort, stockMode = 0 },
    pickSupplierFlag,
    tenantId,
  } = getUserConfigInfo();
  let { regionId, addressInfo } = getUserConfigInfo();
  const onlyInStock = useRef(
    qs.parse(window.location.search.substring(1))?.onlyInStock
      ? +qs.parse(window.location.search.substring(1))?.onlyInStock
      : +stockMode
  ); // 查有货还是包括无货

  const [currentAddress, setCurrentAddress] = useState({
    addressId: undefined, // 地址id
    regionId: undefined, // 二级区域id
    countyCode: '', // 三级区域code
    addressName: '', // 全部地址信息
    regionIdList: [],
    regionCodeList: [],
    invOrganizationId: undefined,
  });

  useEffect(() => {
    if (companyId) {
      queryAddress({
        addressType: 'RECEIVER',
        companyId,
        enabledFlag: 1,
        userId,
        defaultFlag: 1,
      }).then((res) => {
        if (res) {
          const address = getCacheAddress();
          const defaultAddress = res?.content?.[0];
          setCurrentAddress(defaultAddress || address);
          setState({ currentAddress: defaultAddress || address || {} });
          if (!regionId && !isEmpty(defaultAddress)) {
            // 如果头上数据没还加载出地址，就走这个地址查询后查询列表数据 并更新当前地址信息
            regionId = defaultAddress?.regionIdList?.[1];
            addressInfo = {
              address: addressInfo.address || defaultAddress?.regionNameList?.join(''),
              provinceId: addressInfo.provinceId || defaultAddress?.regionCodeList?.[0],
              cityId: addressInfo.cityId || defaultAddress?.regionCodeList?.[1],
              countyId: addressInfo.countyId || defaultAddress?.regionCodeList?.[2],
            };
            fetchProductList(
              { ...getProductSort(), keyword: locationParams.keyword },
              ['order'],
              true,
              true
            );
          }
        }
      });
    }
  }, []);

  function getProductSort() {
    let sortObj = {};
    if (priceOrder || salesSort) {
      return {
        conditionType: priceOrder ? 'price' : salesSort ? 'sales' : 'all',
        order: priceOrder || salesSort || 'asc',
      };
    }
    switch (defaultSort) {
      case 'priceDesc':
        sortObj = {
          conditionType: 'price',
          order: 'desc',
          priceOrder: 'desc',
        };
        break;
      case 'priceAsc':
        sortObj = {
          conditionType: 'price',
          order: 'asc',
          priceOrder: 'asc',
        };
        break;
      case 'saleDesc':
        sortObj = {
          conditionType: 'sales',
          order: 'desc',
          salesSort: 'desc',
        };
        break;
      case 'saleAsc':
        sortObj = {
          conditionType: 'sales',
          order: 'asc',
          salesSort: 'asc',
        };
        break;
      default:
      // sortObj = {
      //   conditionType: priceOrder ? 'price' : salesSort ? 'sales' : 'all',
      //   order: priceOrder || salesSort || 'asc',
      // };
    }
    return sortObj;
  }

  useEffect(() => {
    setState({
      ...getProductSort(),
    });
  }, [defaultSort]);

  const locationParams = qs.parse(search.substr(1));
  const validKeyWordFlag = useValidKeyword(locationParams);

  const { priceOrder, salesSort } = locationParams || {};

  if (locationParams.activityId) {
    locationParams.activityId = JSON.parse(locationParams.activityId);
  }
  if (locationParams.catalogIds) {
    locationParams.catalogIds = JSON.parse(locationParams.catalogIds);
  }
  if (locationParams.supplierCompanyIds) {
    locationParams.supplierCompanyIds = JSON.parse(locationParams.supplierCompanyIds);
  }
  if (locationParams.attribute) {
    locationParams.attribute = {
      [locationParams.groupTypeName]: JSON.parse(
        locationParams.attribute[locationParams.groupTypeName]
      ),
    };
  }

  // [[{ label, value, attrStr: 'xxx' }, { label, value, attrStr: 'xxx' }], []]

  const defaultListType = CuxFn({
    name: 'ProductList-fn-defaultListType',
  })(() => 'block')();

  const [state, setState] = useState({
    allProduct: [],
    productList: {},
    loading: true,
    platProductloading: false, // 平台商品查询
    spining: false,
    levelList: [],
    catalogItems: [],
    fetchParams: { ...locationParams },
    minPrice: locationParams.minPrice !== undefined ? Number(locationParams.minPrice) : '',
    maxPrice: locationParams.maxPrice !== undefined ? Number(locationParams.maxPrice) : '',
    conditionType: 'all',
    order: 'asc',
    rewriterKeyword: null,
    pagination: { page: 0, size: 2 * times },
    budget: {},
    listType: getStorage(`product-list-listDisplay.${tenantId}.${userId}`) || defaultListType,
    bannerDetail: {},
    customDetail: {},
  });

  const attr = useMemo(() => {
    const _attr = new Attribute({
      query: () => fetchProductList({ page: 0, needContinue: false }, [], true),
    });

    const { attribute } = locationParams || {};
    _attr.query = attribute || {};
    return _attr;
  }, []);

  const searchCompare = useMemo(() => new SearchCompare(), []);

  useEffect(() => {
    attr.addEvent('query', () => fetchProductList({ page: 0, needContinue: false }, [], true));
  }, [attr, state.fetchParams]);

  useEffect(() => {
    setStorage(`product-list-listDisplay.${tenantId}.${userId}`, state.listType);
  }, [state.listType]);

  useEffect(() => {
    if (pickSupplierFlag && locationParams.keyword) {
      const data = { keyword: locationParams.keyword, tenantId };
      setState({
        platProductloading: true,
      });
      fetchZoneListService(data)
        .then((res) => {
          setState({
            platProductList: res?.productList?.content || [],
            hasPlatformProduct: res?.productList?.content?.length > 0,
          });
        })
        .finally(() => {
          setState({
            platProductloading: false,
          });
        });
    }
  }, [locationParams.keyword, pickSupplierFlag]);

  useEffect(() => {
    if (companyId) {
      fetchsubInvoiceList();
      fetchsubPurchaseList();
    }
  }, []);

  const [dimensTemplates, dimensLoading] = useDimensTemplates({ needLoadFlag: true });
  useEffect(() => {
    if (locationParams.isCustom && locationParams.customId) {
      fetchCustomDetail(locationParams.customId).then((res) => {
        if (!isEmpty(res)) {
          setState({
            customDetail: res,
          });
        } else {
          props.history.push('/');
        }
      });
    } else if (locationParams.currentBannerId) {
      fetchBannerDetail(locationParams.currentBannerId).then((res) => {
        if (!isEmpty(res)) {
          setState({
            bannerDetail: res,
          });
        } else {
          props.history.push('/');
        }
      });
    } else if (locationParams.blockId) {
      fetchZhuanquDetail(locationParams.blockId).then((res) => {
        if (!isEmpty(res)) {
          setState({
            bannerDetail: res,
          });
        } else {
          props.history.push('/');
        }
      });
    }
  }, []);

  useEffect(() => {
    if (state.productList?.content?.length >= 20) fetchCount = 0;
    else if (state.productList?.content && !noMore && state.pagination.page < maxPage) {
      fetchProductList(
        { ...locationParams, ...state.fetchParams, needContinue: true },
        [],
        false,
        true
      );
    }
  }, [state.productList?.content?.length]);

  function changePage(p) {
    // 接口合并allEle始终为undefined
    if (allEle) {
      // 原分页逻辑
      setState({ pagination: p });
      fetchProductList({ ...state.fetchParams, ...p, needContinue: true }, [], false, true);
    } else {
      const { allProduct: all } = state;
      setState({ pagination: p });
      const { page, size } = p;
      if (page >= maxPage) {
        setState({
          productList: {
            ...all,
            content: all.slice(page * size, (Number(page) + 1) * size),
          },
        });
        return;
      }
      const allPage = math.ceil(all.length / size) - 1;
      if (allPage === page && !noMore) {
        fetchProductList({ ...state.fetchParams, ...p, needContinue: true }, [], false, true);
      } else if (all.slice(page * size, (Number(page) + 1) * size).length < size) {
        fetchProductList(
          { ...state.fetchParams, ...p, needContinue: true, noMax: true },
          [],
          false,
          true
        );
      } else {
        setState({
          productList: {
            ...all,
            content: all.slice(page * size, (Number(page) + 1) * size),
          },
        });
      }
    }
    document.querySelector('body').scrollTop = 0;
  }

  const fetchsubInvoiceList = () => {
    fetchSubInvoiceList().then((res) => {
      if (res) {
        const { content = [] } = res;
        if (content.length > 0) {
          SetSubInvoice(content);
        }
      }
    });
  };
  const fetchsubPurchaseList = () => {
    fetchSubPurchaseList().then((res) => {
      if (res) {
        const { content = [] } = res;
        if (content.length > 0) {
          SetSubPurchase(content);
        }
      }
    });
  };

  const catalogParam = {
    catalogId: getNANId(locationParams?.catalogId),
    catalogLevel: getNANId(locationParams?.catalogLevel),
    catalogName: locationParams?.catalogName,
  };

  const [priceCompareControl, setPriceCompareControl] = useState({
    warning: false,
    update: false,
  });

  // 结构化面包屑中目录的json
  function flatCategory(CategoryData) {
    const _flat = (initValue, sourceValue) => {
      const { catalogId, catalogName, level: catalogLevel } = sourceValue;
      const ret = [...initValue, { catalogId, catalogName, catalogLevel }];
      if (sourceValue.subCatalogs && sourceValue.subCatalogs.length > 0) {
        return _flat(ret, sourceValue.subCatalogs[0]);
      } else {
        return ret;
      }
    };
    return _flat([], CategoryData);
  }
  // 获取目录
  const fetchCurrentCategory = (params) => {
    const queryParams = params || {
      catalogId: catalogParam.catalogId,
      catalogLevel: catalogParam.catalogLevel,
    };
    fetchCurrentCategoryService(queryParams.catalogId).then((json) => {
      const tmpCatalogItems = flatCategory(json);
      setState({
        catalogItems: tmpCatalogItems,
      });
    });
  };
  // 结构化目录栏的数据
  const getCategoryRow = (params) => {
    const queryParams = params || catalogParam;
    const levelMenu = JSON.parse(sessionStorage.getItem('levelMenu')) || {};
    const tmpList = levelMenu[`level${queryParams.catalogLevel + 1}`];
    if (tmpList !== undefined) {
      const levelList = tmpList
        .filter((l) => l.parentCatalogId === queryParams.catalogId)
        .map((l) => ({
          value: l.catalogId,
          meaning: l.catalogName,
        }));
      setState({
        levelList,
      });
    } else {
      setState({
        levelList: [],
      });
    }
  };

  // 获取产品及筛选条件信息
  const fetchProductList = (
    params = {}, // 新的查询参数
    removeAttrs = [], // 所需要移除的参数名或者属性名
    loadingStatus = true, // 是否开启loading
    spiningStatus = false // 是否开启spining
  ) => {
    if (!validKeyWordFlag.current) {
      // 不允许搜索
      setState({
        productList: {},
        loading: false,
        spining: false,
      });
      return false;
    }
    if (!regionId) {
      return false;
    }
    if (fetchCount >= 2 && params.needContinue && count.current > 0) {
      fetchCount = 0;
      return;
    } // 最多请求两次
    fetchCount += 1;

    const {
      visitConfig: { companyId: preCompanyId },
    } = getUserConfigInfo();
    if (!companyId && !preCompanyId) {
      setState({
        loading: false,
        spining: false,
      });
      return;
    }

    // 属性筛选参数
    const { sourceFrom, ...attribute } = attr.getQuery();
    const queryParams = {
      ...locationParams,
      ...state.fetchParams,
      ...params,
      sourceFrom,
      regionId,
      attribute,
      ...addressInfo,
    };

    // 批量移除不需要添加的查询参数
    if (removeAttrs.length > 0) {
      removeAttrs.forEach((item) => {
        delete queryParams[item];
      });
    }

    let { page = 0 } = params;
    if (page || page === 0) {
      page = String(page);
    }
    queryParams.page = !params.needContinue ? 0 : page || locationParams.page || 0;
    page = queryParams.page;
    queryParams.size = params.size || locationParams.size || 2 * times;
    if (!params.needContinue) {
      setState({
        pagination: { page: queryParams.page, size: queryParams.size },
      });
    }
    queryParams.sourceFrom =
      queryParams.sourceFrom && queryParams.sourceFrom !== 'ALL'
        ? typeof queryParams.sourceFrom === 'string'
          ? [queryParams.sourceFrom]
          : queryParams.sourceFrom
        : undefined;
    // 处理销量
    if (
      locationParams.listType === 'sale' &&
      +Math.ceil(+state.allProduct?.length / (2 * times)) === +page + 1 &&
      +state.allProduct?.length >= +locationParams.salesRank &&
      params.needContinue
    ) {
      setState({
        productList: {
          ...state.productList,
          content: state.allProduct.slice(page * 2 * times, (Number(page) + 1) * 2 * times),
        },
      });
      return;
    }

    queryParams.onlyInStock = onlyInStock.current;
    if (params.needContinue) {
      queryParams.offset = offset;
      queryParams.scrollId = scrollId;
    } else {
      queryParams.offset = 0;
    }
    if (queryParams.page >= 19) return;
    // 深拷贝queryParams
    const newQueryparams = JSON.parse(JSON.stringify(queryParams));

    setState({ loading: loadingStatus, spining: spiningStatus });
    fetchProduct(newQueryparams)
      .then((json) => {
        const {
          brandMap,
          productList,
          rewriterKeyword,
          attributeMap = {},
          attributeList,
          ...other
        } = json || {};

        attr.brandMap = brandMap || {};
        attr.attributeMap = attributeMap; // 挂载一下，避免设置进state

        attr.load(attributeList);

        offset = json?.offset;
        scrollId = json?.scrollId;
        noMore = json?.noMore;
        if (noMore) {
          fetchCount = 0;
        }

        // const resultList = queryParams.barId || queryParams.bannerId ? json : productList; // 接口合并不需要区分返回值
        let all = productList?.content?.filter((item) => item) || [];
        if (params.needContinue) {
          all = state.allProduct.concat(productList?.content);
        }
        // 销量的总数量
        if (locationParams.listType === 'sale' && all.length > +locationParams.salesRank) {
          all = all.slice(0, +locationParams.salesRank);
        }
        const newState = {
          ...other,
          allProduct: all,
          rewriterKeyword,
          productList: {
            ...productList,
            content: all.slice(page * 2 * times, (Number(page) + 1) * 2 * times),
          },
          fetchParams: { ...queryParams },
        };
        // 埋点二开、自动比价商品记录
        CuxFn({
          name: 'search-fn-cacheProducts',
          value: {
            products: all,
            searchUuid: newState.searchUuid,
            queryParams: newQueryparams,
          },
        })(() => {
          // 先清空旧缓存
          searchCompare.clearCache();
          // 必输属性全部搜索时
          if (attr.validationRecords.length < 1) {
            searchCompare.query(newQueryparams, newState.searchUuid);
          }
        })();

        if (params.noMax) {
          newState.productList = {
            ...state.resultList,
            content: all.slice(page * 2 * times, (Number(page) + 1) * 2 * times),
          };
        }
        // 接口合并allEle始终为undefined
        if (allEle) {
          newState.productList = {
            ...state.resultList,
            content: json.content, // 原分页逻辑直接赋值content
          };
        }
        setState(newState);
      })
      .catch(() => {
        catchHttpError();
      })
      .finally(() => {
        setState({
          loading: false,
          spining: false,
        });
      });
  };

  useEffect(() => {
    const loadingStatus = true;
    fetchProductList(
      { ...getProductSort(), keyword: locationParams.keyword },
      ['order'],
      loadingStatus,
      true
    ); // 返回时取路由的查询keyword
    if (locationParams.catalogLevel) {
      fetchCurrentCategory();
      getCategoryRow();
    }
    count.current += 1;
  }, [locationParams.page, locationParams.keyword]);

  // 切换有货无货商品
  function changeProduct(val) {
    // 重置查询次数
    fetchCount = 0;
    onlyInStock.current = val;
    fetchProductList({ ...state.fetchParams, needContinue: false }, [], false, true);
  }

  function updatePriceCompareList(type, item = {}, list = []) {
    const priceCompareObj = getStorage(`${userId}_price_compare`) || {};
    const tmpPriceCompareObj = { ...priceCompareObj };
    const tmpList = tmpPriceCompareObj.data || [];
    const { invoiceOrgId } = getUserConfigInfo();
    switch (type) {
      case 'close': {
        setStorage(`${userId}_price_compare`, {
          ...priceCompareObj,
          visible: false,
        });
        setPriceCompareControl({
          ...priceCompareControl,
          update: !priceCompareControl.update,
        });
        break;
      }
      case 'add': {
        setStorage('priceCompareVisible', true);
        setStorage(`${userId}_price_compare`, {
          ...tmpPriceCompareObj,
          visible: true,
        });
        if (tmpList?.find((tmp) => tmp.productId === item.productId)) {
          setPriceCompareControl({
            ...priceCompareControl,
            update: !priceCompareControl.update,
          });
        } else {
          setStorage(`${userId}_price_compare`, {
            data: [
              {
                sourceFrom: item.sourceFromCode || item.sourceFrom,
                productName: item.skuName || item.productName,
                productId: item.productId,
                productNum: item.skuCode || item.productNum,
                imagePath: convertImg(item.imagePath, 1, item.sourceFromCode || item.sourceFrom),
                supplierCompanyName: item.supplierCompanyName,
                price: item.sellPrice,
                priceMeaning: numberRender([item, 'sellPrice']),
                // similarData: res[0] || [],
                // productSkuAttrDTOS: res[1].productSkuAttrDTOS || [],
                checked: false,
                deleteFlag: 0,
                type: 1,
                currencySymbol: item.currencySymbol,
                deliveryCycle: item.deliveryCycle,
                labelList: item.labelList,
              },
              ...tmpList,
            ],
            visible: true,
          });
          setPriceCompareControl({
            ...priceCompareControl,
            update: !priceCompareControl.update,
          });
          if (!productAttrs[item.productId]) {
            Promise.all([
              getProductSku({
                sourceFrom: item.sourceFromCode || item.sourceFrom,
                productId: item.productId,
                regionId,
              }),
              getProductDetail({
                regionId,
                levelPath,
                countyCode: addressInfo.countyId,
                sourceFrom: item.sourceFromCode || item.sourceFrom,
                productId: item.productId,
                invOrganizationId: invoiceOrgId,
              }),
            ])
              .then((res) => {
                productAttrs[item.productId] = {
                  similarData: (res[0] || []).map((p) => ({
                    dim: p.dim,
                    saleName: p.saleName,
                    saleAttrList: p.saleAttr,
                  })),
                  productSkuAttrDTOS: res[1].productSkuAttrDTOS || [],
                };
                let newData = [...(getStorage(`${userId}_price_compare`)?.data || [])];
                for (const i in productAttrs) {
                  if (i) {
                    newData = newData.map((n) => {
                      // eslint-disable-next-line eqeqeq
                      if (n.productId == i) return { ...n, ...productAttrs[i] };
                      return n;
                    });
                  }
                }
                setStorage(`${userId}_price_compare`, {
                  data: newData,
                  visible: getStorage(`${userId}_price_compare`)?.visible,
                });
                setPriceCompareControl({
                  ...priceCompareControl,
                  update: !priceCompareControl.update,
                });
              })
              .catch(() => {
                const newData = [...(getStorage(`${userId}_price_compare`)?.data || [])];
                setStorage(`${userId}_price_compare`, {
                  data: newData.filter((p) => !!p.productSkuAttrDTOS),
                  visible: getStorage(`${userId}_price_compare`)?.visible,
                });
                setPriceCompareControl({
                  ...priceCompareControl,
                  update: !priceCompareControl.update,
                });
              });
          } else {
            let newData = [...(getStorage(`${userId}_price_compare`)?.data || [])];
            for (const i in productAttrs) {
              if (i) {
                newData = newData.map((n) => {
                  if (n.productId === i) return { ...n, ...productAttrs[i] };
                  return n;
                });
              }
            }
            setStorage(`${userId}_price_compare`, {
              data: newData,
              visible: getStorage(`${userId}_price_compare`)?.visible,
            });
            setPriceCompareControl({
              ...priceCompareControl,
              update: !priceCompareControl.update,
            });
          }
        }
        break;
      }
      case 'delete': {
        const newTmpList = tmpList.filter((tmp) => tmp.productId !== item.productId);
        setStorage(`${userId}_price_compare`, {
          data: newTmpList,
          visible: true,
        });
        setPriceCompareControl({
          ...priceCompareControl,
          update: !priceCompareControl.update,
        });
        break;
      }
      case 'deleteAll': {
        setStorage(`${userId}_price_compare`, {
          data: [],
          visible: true,
        });
        setPriceCompareControl({
          ...priceCompareControl,
          update: !priceCompareControl.update,
        });
        break;
      }
      case 'update': {
        setStorage(`${userId}_price_compare`, {
          data: list,
          visible: true,
        });
        setPriceCompareControl({
          ...priceCompareControl,
          update: !priceCompareControl.update,
        });
        break;
      }
      default:
        break;
    }
  }

  const title =
    state.rewriterKeyword ||
    locationParams.keyword ||
    locationParams.bannerName ||
    locationParams.barName;

  // function getSlide(slide) {
  //   setState({ slider: slide });
  // }
  const breadCrumbsValue = {};
  let pageTitle = '';
  if (locationParams.keyword || locationParams.bannerName || locationParams.barName) {
    const text = intl
      .get('mallf.productList.searchfor.result', { value: title || '' })
      .d(`"${title || ''}"的搜索结果`);
    pageTitle = text;
  } else {
    breadCrumbsValue.catalogItems = state.catalogItems;
    pageTitle = intl.get('mallf.productList.view.catalogSearch').d('目录搜索');
  }
  // breadCrumbsValue.rightBtn = (
  //   <span style={{ float: 'right', fontSize: 14, verticalAlign: 'middle' }}>
  //     共<b className="primary-color">&nbsp;{state.productList?.totalElements || 0}&nbsp;</b>件商品
  //   </span>
  // );

  document.title =
    title ||
    locationParams.catalogName ||
    intl.get('mallf.productList.model.mallTitle').d('企业商城');

  const notAttrFilter =
    state.customDetail?.customTagLineList?.[locationParams?.currentIndex || 0]?.jumpPage ||
    state.bannerDetail?.jumpPageFlag;

  if (state.loading || state.platProductloading) {
    return <Loading />;
  }

  // 属性墙是否隐藏
  const attrListHidden = notAttrFilter || locationParams.listType === 'sale';

  // 当前目录level
  const curCatalogLevel = +(state.fetchParams.catalogLevel || catalogParam.catalogLevel);

  return (
    <React.Fragment>
      <div>
        <Observer>
          {() => {
            const dynamicItems = attrListHidden
              ? []
              : attr.attrBreadCrumbs.map((m) => ({
                  child: (
                    <span className={style['attr-filter']}>
                      <Tooltip title={m.text}>
                        <span className="attr-filter-text">{m.text}</span>
                      </Tooltip>
                      <Icon type="close" onClick={() => m.remove()} />
                    </span>
                  ),
                }));

            if (locationParams.keyword) {
              dynamicItems.unshift({
                child: <span>{locationParams.keyword}</span>,
              });
            }

            const breadValue = {
              ...breadCrumbsValue,
              dynamicItems,
            };

            return <BreadCrumbs className={style.breadCrumbs} value={breadValue} />;
          }}
        </Observer>
        <div className={style['productlist-wrap']}>
          <div className="conditions-wrap container">
            {state.rewriterKeyword && (
              <div className="rewriter-word-msg">
                {
                  // eslint-disable-next-line react/no-unescaped-entities
                  intl
                    .getHTML('mallf.productList.model.productList.notFound', {
                      value1: locationParams.keyword,
                      value2: state.rewriterKeyword,
                    })
                    .d(
                      <span>
                        没有找到与<b>{locationParams.keyword}</b>相关的商品,为您推荐
                        <b>{`"${state.rewriterKeyword}"`}</b>的相关商品
                      </span>
                    )
                }
                {/* {intl.get('mallf.myMall.model.productList.nothingWith').d('没有找到与')}“
                  <span>{locationParams.keyword}</span>”
                  {intl
                    .get('mallf.common.model.productList.recommendedForYou')
                    .d('相关的商品，为您推荐')}
                  “{<span>{state.rewriterKeyword}</span>}”
                  {intl.get('mallf.common.model.productList.relatedProducts').d('的相关商品')} */}
              </div>
            )}
            {notAttrFilter ? (
              <Image
                value={
                  state.customDetail?.customTagLineList?.[locationParams?.currentIndex || 0]
                    ?.imageUrlTwo ||
                  state.bannerDetail?.imgaeUrlTwo ||
                  state.bannerDetail?.imageUrlTwo
                }
                height={340}
                width={1190}
                boxStyle={{ marginBottom: 10 }}
              />
            ) : (
              <div r-if={locationParams.listType !== 'sale'} className="condition-tab-wrap">
                <Observer>
                  {() => {
                    // 当前为二级目录不展示下级三级目录
                    const catalogShow = state.levelList.length > 0 && curCatalogLevel < 2;
                    return (
                      <table
                        className="condition-tab"
                        style={{ marginBottom: catalogShow || !attr.hidden ? 10 : 0 }}
                      >
                        <tbody>
                          {catalogShow && (
                            <CatalogRow
                              subCatalogs={state.levelList}
                              catalogName={levelName[curCatalogLevel]}
                              onSelectCatalog={(catalog) => {
                                const params = {
                                  catalogId: catalog.value,
                                  catalogName: catalog.meaning,
                                  catalogLevel: curCatalogLevel + 1,
                                };
                                fetchProductList(params);
                                fetchCurrentCategory(params);
                                getCategoryRow(params);
                              }}
                            />
                          )}
                          {attr.records.map((record) => {
                            // 是否为商品来源
                            const hidden = record.hidden;
                            return !hidden && <AttributeRow record={record} />;
                          })}
                          {attr.customRecords.filter((f) => !f.hidden).length > 0 && (
                            <AttributeProRow attribute={attr} />
                          )}
                        </tbody>
                      </table>
                    );
                  }}
                </Observer>
              </div>
            )}
          </div>
          <Observer>
            {() => {
              const disabled = !attrListHidden && attr.validationRecords.length > 0;
              const requiredAttrStr = attr.validationRecords
                .map((m) => m.get('attrName'))
                .join('、');
              return (
                <>
                  <div r-if={disabled} className="attr-required-tips">
                    <Icon type="info" />
                    <span>
                      {intl
                        .get('mallf.productList.view.requiredAttrTips', { value: requiredAttrStr })
                        .d(`请选择${requiredAttrStr}进行精准筛选`)}
                    </span>
                  </div>
                  <ContentList
                    disabled={disabled || searchCompare.status !== 'ready'}
                    platProductList={state.platProductList}
                    hasPlatformProduct={state.hasPlatformProduct}
                    state={state}
                    getProductSort={getProductSort}
                    fetchParams={state.fetchParams}
                    listType={state.listType}
                    subInvoice={subInvoice}
                    subPurchase={subPurchase}
                    onlyInStock={onlyInStock}
                    changeProduct={changeProduct}
                    productList={state.productList}
                    fetchProductList={fetchProductList}
                    minPrice={state.minPrice}
                    maxPrice={state.maxPrice}
                    order={state.order}
                    conditionType={state.conditionType}
                    onChangeState={setState}
                    locationParams={locationParams}
                    spining={state.spining}
                    updatePriceCompareList={updatePriceCompareList}
                    pagination={state.pagination}
                    setState={setState}
                    totalElements={state.allProduct.length}
                    changePage={changePage}
                    dimensTemplates={dimensTemplates}
                    dimensLoading={dimensLoading}
                    currentAddress={currentAddress}
                    setCurrentAddress={setCurrentAddress}
                    history={props.history}
                  />
                </>
              );
            }}
          </Observer>
        </div>
      </div>
      {userId && getStorage(`${userId}_price_compare`)?.visible && (
        <ShowCompare>
          <PriceCompare
            warning={priceCompareControl.warning}
            updatePriceCompareList={updatePriceCompareList}
            priceCompareActiveKey="1"
            pageTitle={pageTitle}
            currentAddress={state.currentAddress}
            dimensTemplates={dimensTemplates}
          />
        </ShowCompare>
      )}
    </React.Fragment>
  );
}

export default formatterCollections({ code: ['mallf.productList', 'mallf.priceCompare'] })(
  ProductList
);

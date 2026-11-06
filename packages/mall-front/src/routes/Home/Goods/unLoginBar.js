/* eslint-disable import/no-dynamic-require */

const list = [
  {
    barName: '精选热卖',
    barEnName: 'SELETED HOT SALEING',
    barType: 'NORMAL',
    productList: {
      content: [
        {
          skuName:
            'Apple iPad Pro 11英寸平板电脑 2018年款(256G WLAN版 全面屏 A12X芯片 FaceID MTXR2CH A)银色',
          imagePath: getImage('computer01'),
          sourceFromCode: 'CATA',
          price: 6899,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName: '爱普生（EPSON）CB-X05E 投影仪 投影机办公（标清 3300流明 支持左右梯形校正）',
          imagePath: getImage('office01', 'png'),
          sourceFromCode: 'CATA',
          price: 3249,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName:
            'Cape Lisa创意礼品香薰蜡烛求婚表白玻璃杯蜡创意家居用品香氛室内生日情人节礼物 蓝色 120-78',
          imagePath: getImage('life02'),
          sourceFromCode: 'CATA',
          price: 15.9,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName:
            'LG 27英寸 4K 超高清 HDR10 适配 PS4显示器 广色域 IPS 硬屏 旋转 升降 色彩校准 阅读模式 显示屏 27UL550',
          imagePath: getImage('computer04', 'png'),
          sourceFromCode: 'CATA',
          price: 2968,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName: '奥利奥 Oreo 亿滋巧克力味全系列饼干零食大礼包 14包饼干零食共931g',
          imagePath: getImage('snack01', 'png'),
          sourceFromCode: 'CATA',
          price: 99,
          sourceFrom: '京东',
          productId: 666,
        },
      ],
    },
  },
  {
    barName: '办公工具',
    barEnName: 'OFFICE TOOLS',
    barType: 'IMAGE',
    imagePath: getImage('custom-bar01'),
    productList: {
      content: [
        {
          skuName: '爱普生（EPSON）CB-X05E 投影仪 投影机办公（标清 3300流明 支持左右梯形校正）',
          imagePath: getImage('office01', 'png'),
          sourceFromCode: 'CATA',
          price: 3249,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName:
            '初心实木纸巾盒抽纸收纳盒桌面整理盒办公收纳盒创意家用多功能纸巾盒 收纳纸巾盒—大号',
          imagePath: getImage('office02', 'png'),
          sourceFromCode: 'CATA',
          price: 97,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName: '得力（deli） 大号订书机 钉书机 重型订书器 可订60页(23_6-23_10) 黑色0465',
          imagePath: getImage('office03', 'png'),
          sourceFromCode: 'CATA',
          price: 37.1,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName: '得力(deli)两联多功能组合桌面文件框 纤维板创意拼装文件栏收纳盒文件架 办公用品',
          imagePath: getImage('office04', 'png'),
          sourceFromCode: 'CATA',
          price: 39,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName:
            '惠普（HP） M479dw专业级彩色激光多功能一体机 打印复印扫描三合一自动双面打印无线连接 M377dw升级款',
          imagePath: getImage('office05', 'png'),
          sourceFromCode: 'CATA',
          price: 5699,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName: '捷波朗（Jabra）PanaCast小型音频视频会议室套餐解决方案',
          imagePath: getImage('office06', 'png'),
          sourceFromCode: 'CATA',
          price: 9999,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName: '京东京造 多用收纳盒北欧简约楠竹客厅茶几多功能办公桌面手机收纳盒遥控器整理盒',
          imagePath: getImage('office07', 'png'),
          sourceFromCode: 'CATA',
          price: 49.9,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName:
            '时光文化高级软皮笔记本子记事本商务会议记录本韩国小清新简约文具a5大学生日记本加厚笔记本定制LOGO 灰色',
          imagePath: getImage('office08', 'png'),
          sourceFromCode: 'CATA',
          price: 35,
          sourceFrom: '京东',
          productId: 666,
        },
      ],
    },
  },
  {
    barName: '生活用品',
    barEnName: 'ARTICLES FOR DAILY USE',
    barType: 'IMAGE',
    imagePath: getImage('custom-bar02'),
    productList: {
      content: [
        {
          skuName:
            '【2对装】冬季长毛绒保暖马桶垫坐垫加厚自粘马桶贴马桶罩可反复使用 长毛马桶垫-奶白色 2对装',
          imagePath: getImage('life01'),
          sourceFromCode: 'CATA',
          price: 29.8,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName:
            'Cape Lisa创意礼品香薰蜡烛求婚表白玻璃杯蜡创意家居用品香氛室内生日情人节礼物 蓝色 120-78',
          imagePath: getImage('life02'),
          sourceFromCode: 'CATA',
          price: 15.9,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName: 'HOUYA好雅 镜子 台式桌面化妆镜可折叠 化妆镜子 1只装 颜色随机',
          imagePath: getImage('life03'),
          sourceFromCode: 'CATA',
          price: 9.9,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName: 'MUJI 羽毛 靠垫 白色',
          imagePath: getImage('life04'),
          sourceFromCode: 'CATA',
          price: 65,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName: '茶花 漱口杯刷牙杯子牙刷杯牙缸洗漱杯水杯 257004 艾特斯系列',
          imagePath: getImage('life05'),
          sourceFromCode: 'CATA',
          price: 11.9,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName:
            '力士(LUX)沐浴乳 植萃精油香氛沐浴露 小苍兰香与茶树550g 进口精油 排浊净透 深层清洁',
          imagePath: getImage('life06'),
          sourceFromCode: 'CATA',
          price: 48,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName:
            '日本珂润（Curel）润浸保湿洁颜泡沫 150ml（补水保湿洁面乳 不刺激 深层清洁 男女适用 花王 原装进口）',
          imagePath: getImage('life07'),
          sourceFromCode: 'CATA',
          price: 108,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName: '无印良品MUJI 基础润肤化妆水 清爽型 400ml',
          imagePath: getImage('life08'),
          sourceFromCode: 'CATA',
          price: 95,
          sourceFrom: '京东',
          productId: 666,
        },
      ],
    },
  },
  {
    barName: '零食饮品',
    barEnName: 'SNACK DRINKS',
    barType: 'IMAGE',
    imagePath: getImage('custom-bar03'),
    productList: {
      content: [
        {
          skuName: '奥利奥 Oreo 亿滋巧克力味全系列饼干零食大礼包 14包饼干零食共931g',
          imagePath: getImage('snack01', 'png'),
          sourceFromCode: 'CATA',
          price: 99,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName: '良品铺子 爆浆手造麻薯 传统糕点点心 零食特产小吃 芒果味150g',
          imagePath: getImage('snack02', 'png'),
          sourceFromCode: 'CATA',
          price: 12.8,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName: '良品铺子 脆辣棒 辣皮辣片辣条香辣味吃货儿时零食小吃75g',
          imagePath: getImage('snack03', 'png'),
          sourceFromCode: 'CATA',
          price: 11.8,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName: '良品铺子 牛轧奶芙 奶香味雪花酥饼干酥脆休闲零食120g',
          imagePath: getImage('snack04', 'png'),
          sourceFromCode: 'CATA',
          price: 16.9,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName: '良品铺子 鸭舌 120g 甜辣鸭舌 酱鸭舌 藤椒味零食小吃卤味肉类熟食零食品 甜辣味',
          imagePath: getImage('snack05', 'png'),
          sourceFromCode: 'CATA',
          price: 49.9,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName: '良品铺子山药脆片（孜然味） 薯片山药片 膨化食品 休闲 童年零食小吃70g',
          imagePath: getImage('snack06', 'png'),
          sourceFromCode: 'CATA',
          price: 9.8,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName: '满400减280_百草味 蔓越莓曲奇饼干100g 休闲零食糕点点心办公室小吃下午茶 MJ',
          imagePath: getImage('snack07', 'png'),
          sourceFromCode: 'CATA',
          price: 17.5,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName: '满400减280_百草味 一块果汁54g 果汁疙瘩 什锦冻干芒果水果干 休闲网红零食 MJ 盒装',
          imagePath: getImage('snack08', 'png'),
          sourceFromCode: 'CATA',
          price: 36.9,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName: '三只松鼠肉干肉脯零食小吃特产五香猪肉粒90g_袋',
          imagePath: getImage('snack09', 'png'),
          sourceFromCode: 'CATA',
          price: 35.9,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName: '三只松鼠猪肉脯 猪肉干肉脯靖江特产休闲零食100g_袋',
          imagePath: getImage('snack10', 'png'),
          sourceFromCode: 'CATA',
          price: 32.9,
          sourceFrom: '京东',
          productId: 666,
        },
      ],
    },
  },
  {
    barName: '电脑配件',
    barEnName: 'COMPUTER ACCESSORIES',
    barType: 'IMAGE',
    imagePath: getImage('custom-bar04'),
    productList: {
      content: [
        {
          skuName:
            'Apple iPad Pro 11英寸平板电脑 2018年款(256G WLAN版 全面屏 A12X芯片 FaceID MTXR2CH A)银色',
          imagePath: getImage('computer01'),
          sourceFromCode: 'CATA',
          price: 6899,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName:
            'Apple Macbook Pro 13.3【无触控栏】Core i5 8G 128G SSD 深空灰 笔记本电脑 轻薄本 MPXQ2CHA',
          imagePath: getImage('computer02'),
          sourceFromCode: 'CATA',
          price: 7499,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName:
            'JRC 纳米除菌Macbook笔记本电脑清洁剂套装 苹果液晶屏幕清洁液 电视键盘数码相机手机平板工具五合一 100ML',
          imagePath: getImage('computer03', 'png'),
          sourceFromCode: 'CATA',
          price: 35,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName:
            'LG 27英寸 4K 超高清 HDR10 适配 PS4显示器 广色域 IPS 硬屏 旋转 升降 色彩校准 阅读模式 显示屏 27UL550',
          imagePath: getImage('computer04', 'png'),
          sourceFromCode: 'CATA',
          price: 2968,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName:
            '哈曼卡顿（Harman Kardon） SoundSticks BT 蓝牙水晶音箱 室内桌面音箱 低音炮 电脑音响',
          imagePath: getImage('computer05', 'png'),
          sourceFromCode: 'CATA',
          price: 1449,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName:
            '雷神（ThundeRobot）雷神16.6英寸电竞机能游戏本背包 雷神·至潮 黑曜石双肩背包2代 哑光版',
          imagePath: getImage('computer06', 'png'),
          sourceFromCode: 'CATA',
          price: 249,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName:
            '联想(Lenovo)天逸510S 英特尔酷睿i3 个人商务台式机电脑整机(i3-9100 8G 1T WiFi 三年上门 Win10)21.5英寸',
          imagePath: getImage('computer07', 'png'),
          sourceFromCode: 'CATA',
          price: 2889,
          sourceFrom: '京东',
          productId: 666,
        },
        {
          skuName:
            '罗技（Logitech）MK470 键鼠套装 无线键鼠套装 超薄 全尺寸 星空灰 带无线2.4G接收器',
          imagePath: getImage('computer08', 'png'),
          sourceFromCode: 'CATA',
          price: 295,
          sourceFrom: '京东',
          productId: 666,
        },
      ],
    },
  },
];

function getImage(name, type = 'jpg') {
  // eslint-disable-next-line global-require
  return require(`../../../assets/images/home/${name}.${type}`);
}

export default list;

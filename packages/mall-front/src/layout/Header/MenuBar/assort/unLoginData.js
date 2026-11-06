// const cata = {
//   items1: [
//     {
//       catalogId: 31047,
//       catalogName: '水果果',
//       catalogLevel: 1,
//       orderSeq: 1,
//       parentCatalogId: -1,
//       row: 4,
//       children: [],
//     },
//     {
//       catalogId: 31040,
//       catalogName: 'DEV公司目录A001',
//       catalogLevel: 1,
//       orderSeq: 1,
//       parentCatalogId: -1,
//       row: 8,
//       children: [],
//     },
//     {
//       catalogId: 31859,
//       catalogName: '公司一级目录0509',
//       catalogLevel: 1,
//       orderSeq: 1,
//       parentCatalogId: -1,
//       row: 12,
//       children: [],
//     },
//     {
//       catalogId: 31041,
//       catalogName: 'DEV集团目录B001',
//       catalogLevel: 1,
//       orderSeq: 1,
//       parentCatalogId: -1,
//       row: 23,
//       children: [],
//     },
//     {
//       catalogId: 31779,
//       catalogName: '水果',
//       catalogLevel: 1,
//       orderSeq: 5,
//       parentCatalogId: -1,
//       row: 29,
//       children: [],
//     },
//     {
//       catalogId: 31755,
//       catalogName: 'kelly测试',
//       catalogLevel: 1,
//       orderSeq: 17,
//       parentCatalogId: -1,
//       row: 30,
//       children: [],
//     },
//   ],
//   items2: [],
//   items3: [],
//   items4: [],
//   flag: 0,
// };

// function formatData(data) {
//   if (data.flag) {
//     const newData = [];
//     for (let i = 1; i <= 4; i++) {
//       if (data[`items${i}`]) {
//         data[`items${i}`].forEach(item => {
//           if (newData[item.row]) {
//             newData[item.row].push(item);
//           } else {
//             newData[item.row] = [item];
//           }
//         });
//       }
//     }
//     const tmpdata = newData.filter(item => item && item.length);
//     return tmpdata;
//   } else {
//     const newData = [];
//     let length = 12;
//     const tmpArray = [];
//     const array = data.items1;
//     for (let i = 0; i < array.length; i++) {
//       if (length >= array[i]?.catalogName?.length) {
//         length = length - array[i].catalogName.length - 1;
//         tmpArray.push(array[i]);
//       } else {
//         newData.push([...tmpArray]);
//         length = 12;
//         tmpArray.length = 0;
//       }
//     }
//     return newData;
//   }
// }

// console.log(formatData(cata));

const newCata = [
  [
    {
      catalogId: 31047,
      catalogName: '数字内容',
      catalogLevel: 1,
      orderSeq: 1,
      parentCatalogId: -1,
      row: 4,
      children: [],
    },
  ],
  [
    {
      catalogId: 31047,
      catalogName: '图书',
      catalogLevel: 1,
      orderSeq: 1,
      parentCatalogId: -1,
      row: 4,
      children: [],
    },
  ],
  [
    {
      catalogId: 31047,
      catalogName: '职场进阶',
      catalogLevel: 1,
      orderSeq: 1,
      parentCatalogId: -1,
      row: 4,
      children: [],
    },
  ],
  [
    {
      catalogId: 31047,
      catalogName: '珠宝饰品',
      catalogLevel: 1,
      orderSeq: 1,
      parentCatalogId: -1,
      row: 4,
      children: [],
    },
  ],
  [
    {
      catalogId: 31047,
      catalogName: '进口食品',
      catalogLevel: 1,
      orderSeq: 1,
      parentCatalogId: -1,
      row: 4,
      children: [],
    },
  ],
  [
    {
      catalogId: 31047,
      catalogName: '家纺',
      catalogLevel: 1,
      orderSeq: 1,
      parentCatalogId: -1,
      row: 4,
      children: [],
    },
  ],
  [
    {
      catalogId: 31047,
      catalogName: '图书音像',
      catalogLevel: 1,
      orderSeq: 1,
      parentCatalogId: -1,
      row: 4,
      children: [],
    },
  ],
  [
    {
      catalogId: 31047,
      catalogName: '美妆',
      catalogLevel: 1,
      orderSeq: 1,
      parentCatalogId: -1,
      row: 4,
      children: [],
    },
  ],
  [
    {
      catalogId: 31047,
      catalogName: '零食',
      catalogLevel: 1,
      orderSeq: 1,
      parentCatalogId: -1,
      row: 4,
      children: [],
    },
  ],
];

export default newCata;

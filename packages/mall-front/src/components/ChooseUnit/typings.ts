type dimensionType = 'FIXED' | 'CUSTOM';

export enum fromType {
  top = 'top',
  banner = 'banner',
}

export interface IPurchaseUnit {
  bizErrorFlag: number | null | undefined;
  [extProp: string]: any;
}

export interface IDim {
  unitDimensionId: string | number;
  dimensionType: dimensionType;
  dimensionCode: string;
  showFlag: number;
  editFlag: number;
  orderSeq: number;
  dimensionCodeMeaning: string;
  customDimensionName: string;
  inputLovCode: string;
}

export interface IField {
  dimensionType: dimensionType;
  name: string;
  label: string;
  lovCode: string;
  type: 'object';
  required: boolean;
  editFlag: number;
  lovPara: any;
  lovViewInfo: {
    valueField: string;
    displayField: string;
  }
}

export interface IDimensionData {
  unitDimensionList: IDim[];
  versionHash: string;
  currentList: IField[]
}
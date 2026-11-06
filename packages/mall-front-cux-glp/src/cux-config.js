import dynamicImport from 'utils/dynamicImport';
import { getAllPriceInfo } from "./functions/OMSOrder/index"

export default {
	'SRM-GLP': {
		functions: {
			"OMSOrder-fn-allPriceInfo": {
				function: getAllPriceInfo,
				description: '【普洛斯】二开显示未税金额、税额和总额',
				number: 'mall-10523',
				version: '2024v0720',
			}
		},
		components: {
			"NewBeforeOrder/TotalMount": {
				component: dynamicImport(() => import('./components/NewBeforeOrder/TotalMount')),
				description: '【普洛斯】二开显示未税金额、税额和总额',
				number: 'mall-10523',
				version: '2024v0720',
			},
			"OMSOrderDetail/TotalMount": {
				component: dynamicImport(() => import('./components/OMSOrderDetail/TotalMount')),
				description: '【普洛斯】二开显示未税金额、税额和总额',
				number: 'mall-10523',
				version: '2024v0720',
			},
			"CartProCopy/CartFooter": {
				component: dynamicImport(() => import('./components/CartProCopy/CartFooter')),
				description: '【普洛斯】二开显示未税金额、税额和总额',
				number: 'mall-10523',
				version: '2024v0720',
			}
		},
		routers: [],
	}
};
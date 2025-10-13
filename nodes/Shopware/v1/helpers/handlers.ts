import { GenericValue } from 'n8n-workflow';
import { PriceUi, SearchFilter } from '../actions/types';

export const orderFilterHandlers: { [key: string]: (value: GenericValue) => SearchFilter } = {
	createdAtMax: (value) => ({
		type: 'range',
		field: 'orderDateTime',
		parameters: { lte: value },
	}),
	createdAtMin: (value) => ({
		type: 'range',
		field: 'orderDateTime',
		parameters: { gte: value },
	}),
	currency: (value) => ({ type: 'equals', field: 'currency.name', value }),
	deliveryState: (value) => ({
		type: 'equals',
		field: 'deliveries.stateMachineState.technicalName',
		value,
	}),
	ids: (value) => ({
		type: 'equalsAny',
		field: 'id',
		value: (value as string).split(',').map((id) => id.trim()),
	}),
	maxShippingTotal: (value) => ({
		type: 'range',
		field: 'shippingTotal',
		parameters: { lte: value },
	}),
	maxTotal: (value) => ({ type: 'range', field: 'amountTotal', parameters: { lte: value } }),
	minShippingTotal: (value) => ({
		type: 'range',
		field: 'shippingTotal',
		parameters: { gte: value },
	}),
	minTotal: (value) => ({ type: 'range', field: 'amountTotal', parameters: { gte: value } }),
	orderNumber: (value) => ({ type: 'equals', field: 'orderNumber', value }),
	salesChannel: (value) => ({ type: 'equals', field: 'salesChannelId', value }),
	state: (value) => ({ type: 'equals', field: 'stateMachineState.technicalName', value }),
	transactionState: (value) => ({
		type: 'equals',
		field: 'transactions.stateMachineState.technicalName',
		value,
	}),
};

export const customerFilterHandlers: { [key: string]: (value: GenericValue) => SearchFilter } = {
	accountType: (value) => ({
		type: 'equals',
		field: 'accountType',
		value,
	}),
	birthday: (value) => ({
		type: 'equals',
		field: 'birthday',
		value,
	}),
	createdAtMax: (value) => ({
		type: 'range',
		field: 'createdAt',
		parameters: { lte: value },
	}),
	createdAtMin: (value) => ({
		type: 'range',
		field: 'createdAt',
		parameters: { gte: value },
	}),
	createdBy: (value) => ({
		type: 'equals',
		field: 'createdById',
		value,
	}),
	customerNumber: (value) => ({
		type: 'equals',
		field: 'customerNumber',
		value,
	}),
	defaultPaymentMethod: (value) => ({
		type: 'equals',
		field: 'defaultPaymentMethodId',
		value,
	}),
	email: (value) => ({
		type: 'equals',
		field: 'email',
		value,
	}),
	firstLoginAfter: (value) => ({
		type: 'range',
		field: 'firstLogin',
		parameters: { gte: value },
	}),
	firstLoginBefore: (value) => ({
		type: 'range',
		field: 'firstLogin',
		parameters: { lte: value },
	}),
	firstName: (value) => ({
		type: 'equals',
		field: 'firstName',
		value,
	}),
	group: (value) => ({
		type: 'equals',
		field: 'groupId',
		value,
	}),
	guest: (value) => ({
		type: 'equals',
		field: 'guest',
		value,
	}),
	ids: (value) => ({
		type: 'equalsAny',
		field: 'id',
		value: (value as string).split(',').map((id) => id.trim()),
	}),
	language: (value) => ({
		type: 'equals',
		field: 'languageId',
		value,
	}),
	lastLoginAfter: (value) => ({
		type: 'range',
		field: 'lastLogin',
		parameters: { gte: value },
	}),
	lastLoginBefore: (value) => ({
		type: 'range',
		field: 'lastLogin',
		parameters: { lte: value },
	}),
	lastName: (value) => ({
		type: 'equals',
		field: 'lastName',
		value,
	}),
	lastOrderDate: (value) => ({
		type: 'range',
		field: 'lastOrderDate',
		parameters: { lt: value },
	}),
	maxOrderCount: (value) => ({
		type: 'range',
		field: 'orderCount',
		parameters: { lte: value },
	}),
	maxOrderTotalAmount: (value) => ({
		type: 'range',
		field: 'orderTotalAmount',
		parameters: { lte: value },
	}),
	maxReviews: (value) => ({
		type: 'range',
		field: 'reviewCount',
		parameters: { lte: value },
	}),
	minOrderCount: (value) => ({
		type: 'range',
		field: 'orderCount',
		parameters: { gte: value },
	}),
	minOrderTotalAmount: (value) => ({
		type: 'range',
		field: 'orderTotalAmount',
		parameters: { gte: value },
	}),
	minReviews: (value) => ({
		type: 'range',
		field: 'reviewCount',
		parameters: { gte: value },
	}),
	salesChannel: (value) => ({
		type: 'equals',
		field: 'salesChannelId',
		value,
	}),
};

export const productFilterHandlers: { [key: string]: (value: GenericValue | PriceUi) => SearchFilter } = {
	active: (value) => ({
		type: 'equals',
		field: 'active',
		value,
	}),
	available: (value) => ({
		type: 'equals',
		field: 'available',
		value,
	}),
	createdAtMax: (value) => ({
		type: 'range',
		field: 'createdAt',
		parameters: { lte: value },
	}),
	createdAtMin: (value) => ({
		type: 'range',
		field: 'createdAt',
		parameters: { gte: value },
	}),
	ean: (value) => ({
		type: 'equals',
		field: 'ean',
		value,
	}),
	ids: (value) => ({
		type: 'equalsAny',
		field: 'id',
		value: (value as string).split(',').map((id) => id.trim()),
	}),
	manufacturer: (value) => ({
		type: 'equals',
		field: 'manufacturerId',
		value,
	}),
	maxPriceUi: (value) => ({
		type: 'range',
		field: `price.${(value as PriceUi).price.currency}.gross`,
		parameters: { lte: (value as PriceUi).price.maxPrice! },
	}),
	maxSales: (value) => ({ type: 'range', field: 'sales', parameters: { lte: value } }),
	maxStock: (value) => ({ type: 'range', field: 'stock', parameters: { lte: value } }),
	minPriceUi: (value) => ({
		type: 'range',
		field: `price.${(value as PriceUi).price.currency}.gross`,
		parameters: { gte: (value as PriceUi).price.minPrice! },
	}),
	minSales: (value) => ({ type: 'range', field: 'sales', parameters: { gte: value } }),
	minStock: (value) => ({ type: 'range', field: 'stock', parameters: { gte: value } }),
	name: (value) => ({ type: 'equals', field: 'name', value }),
	parentId: (value) => ({ type: 'equals', field: 'parentId', value }),
	productNumber: (value) => ({ type: 'equals', field: 'productNumber', value }),
	purchaseSteps: (value) => ({ type: 'equals', field: 'purchaseSteps', value }),
	tax: (value) => ({ type: 'equals', field: 'taxId', value }),
};

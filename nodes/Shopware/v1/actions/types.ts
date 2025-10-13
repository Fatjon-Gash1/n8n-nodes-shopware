import { GenericValue, IDataObject } from "n8n-workflow";

export type GenericOption = {
	id: string;
	name: string;
};

type ProductPrice = {
	currencyId: string;
	net: number;
};

export interface ProductResponse {
	id: string;
	name: string;
	states: string[];
	price: Array<ProductPrice>;
	taxId: string;
}

export interface LineItemResponse {
	identifier: string;
	productId: string;
	label: string;
	states: string[];
	unitPrice: number;
	taxRate: number;
}

export interface CustomerResponse {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	salutationId: string;
	salesChannelId: string;
	languageId: string;
	defaultBillingAddressId: string;
	defaultShippingAddressId: string;
}

export interface CustomerAddressResponse {
	id: string;
	countryId: string;
	firstName: string;
	lastName: string;
	street: string;
	city: string;
}

export interface OrderCustomerResponse extends CustomerResponse {
	billingAddress: CustomerAddressResponse;
	shippingAddress: CustomerAddressResponse;
}

export type ShippingMethodPrice = {
	currencyId: string;
	net: number;
};

export type ShippingMethodDataResponse = {
	unitPrice: number;
	taxRate: number;
};

export type DeliveryTimeResponse = {
	min: number;
	max: number;
	unit: 'hour' | 'day' | 'week';
};

export type SalutationOption = {
	id: string;
	displayName: string;
};

export type SearchFilter = {
	type: 'equals' | 'equalsAny' | 'contains' | 'range';
	field: string;
	value?: GenericValue;
	parameters?: {
		gte?: GenericValue;
		lte?: GenericValue;
		gt?: GenericValue;
		lt?: GenericValue;
	}
}

export interface PaginationData  {
	page: number;
	limit: number;
}

export interface SearchBodyConstruct extends PaginationData, IDataObject {
	fields: string[],
	includes: {
		[key: string]: string[]
	}
	associations?: {
		[key: string]: object 
	}
	filter?: Array<SearchFilter>
}

export type PriceUi = {
	price: {
		currency: string;
		minPrice?: string;
		maxPrice?: string;
	}
}
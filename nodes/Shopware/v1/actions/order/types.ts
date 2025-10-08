import type { IDataObject } from 'n8n-workflow';

export interface Rounding {
	decimals: number;
	interval: number;
	roundForNet: boolean;
}

interface CalculatedTax {
	tax: number;
	taxRate: number;
	price: number;
}

interface TaxRule {
	taxRate: number;
	percentage: number;
}

interface OrderPrice {
	netPrice: number;
	totalPrice: number;
	calculatedTaxes: CalculatedTax[];
	taxRules: TaxRule[];
	positionPrice: number;
	rawTotal: number;
	taxStatus: string;
}

interface LineItemPrice {
	unitPrice: number;
	totalPrice: number;
	quantity: number;
	calculatedTaxes: CalculatedTax[];
	taxRules: TaxRule[];
}

export interface OrderCustomer {
	firstName: string;
	lastName: string;
	email: string;
	salutationId: string;
	customerId?: string;
	customerNumber: string;
}

interface BillingAddress {
	id: string;
	countryId: string;
	firstName: string;
	lastName: string;
	street: string;
	city: string;
}

export interface GenericPrice {
	unitPrice: number;
	totalPrice: number;
	quantity: number;
	calculatedTaxes: CalculatedTax[];
	taxRules: TaxRule[];
}

export interface Transaction {
	paymentMethodId: string;
	stateId: string;
	amount: GenericPrice;
}

export interface Delivery {
	shippingOrderAddressId: string;
	shippingMethodId: string;
	stateId: string;
	shippingDateEarliest: Date;
	shippingDateLatest: Date;
	shippingCosts: GenericPrice;
}

export interface Address {
	id: string;
	countryId: string;
	firstName: string;
	lastName: string;
	street: string;
	city: string;
}

export interface LineItem {
	identifier: string;
	productId: string;
	quantity: number;
	label: string;
	states: string[];
	price: LineItemPrice;
}

interface OrderBody {
	orderNumber: string;
	billingAddressId: string;
	currencyId: string;
	languageId: string;
	salesChannelId: string;
	orderDateTime: Date;
	currencyFactor: number;
	stateId: string;
	itemRounding: Rounding;
	totalRounding: Rounding;
	orderCustomer: OrderCustomer;
	price: OrderPrice;
	billingAddress: BillingAddress;
	shippingCosts: GenericPrice;
	transactions?: Transaction[];
	deliveries?: Delivery[];
	addresses: Address[];
	lineItems: LineItem[];
}

export interface OrderCreatePayload extends OrderBody, IDataObject {}

type NullablePartial<T> = {
  [P in keyof T]?: T[P] | null;
};

export type OrderUpdatePayload = Omit<NullablePartial<OrderCreatePayload>, 'orderCustomer'> & {
	orderCustomer?: Partial<OrderCustomer> | null
}

export interface OrderResponse extends OrderBody {
	id: string;
	amountNet: number;
	currency: { id: string };
}

export type SalutationOption = {
	id: string;
	displayName: string;
};

export type NodeLineItem = {
	productNumber: string;
	quantity: number;
};

export type NodeTransaction = {
	paymentMethod: string;
	state: string;
};

export type NodeDelivery = {
	shippingMethod: string;
	state: string;
	customerShippingAddress: boolean;
	addressUi: {
		addressValues: AddressValues
	}
};

export type AddressValues = {
	country: string;
	firstName: string;
	lastName: string;
	city: string;
	street: string;
}

export type CustomerData = {
	firstName: string;
	lastName: string;
	email: string;
	salutationId: string;
	billingAddress: Address;
	shippingAddress: Address;
}

export type GlobalDefaults = {
	salesChannelId: string;
	languageId: string;
}

export type NodeCustomerDetails = {
	firstName: string;
	lastName: string;
	email: string;
	salutation: string;
}

export type NodeCustomerAddressDetails = {
	country: string;
	firstName: string;
	lastName: string;
	city: string;
	street: string;
}

import type { IDataObject } from 'n8n-workflow';

export interface CustomerCreatePayload extends IDataObject {
	id?: string;
	customerNumber: string;
	firstName: string;
	lastName: string;
	email: string;
	company?: string;
	active?: boolean;
	guest?: boolean;
	birthday?: string;
	createdAt?: string;
	updatedAt?: string;
	groupId: string;
	salesChannelId: string;
	languageId: string;
	addresses: Array<{
		id: string;
		countryId: string;
		firstName: string;
		lastName: string;
		city: string;
		street: string;
		salutationId: string;
	}>;
	defaultBillingAddressId?: string | null;
	defaultShippingAddressId?: string | null;
	defaultPaymentMethodId?: string;
	lastLogin?: string;
	orderCount?: number;
	orderTotalAmount?: number;
}

export type CustomerUpdatePayload = Partial<CustomerCreatePayload>;

export type LanguageOption = {
	id: string;
	name: string;
};

export type CustomerGroupOption = {
	id: string;
	name: string;
};

export type CountryOption = {
	id: string;
	name: string;
};

export type NodeCustomerAddress = {
	country: string;
	firstName: string;
	lastName: string;
	city: string;
	street: string;
	defaultShippingAddress: boolean;
	defaultBillingAddress: boolean;
};

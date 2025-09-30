import type { IDataObject } from 'n8n-workflow';

export interface ProductCreatePayload extends IDataObject {
	id?: string;
	parentId?: string;
	manufacturer?: { name: string };
	active?: boolean;
	displayGroup?: string;
	ratingAverage?: number;
	weight?: number;
	width?: number;
	height?: number;
	length?: number;
	productNumber: string;
	name: string;
	description?: string;
	availableStock?: number;
	stock: number;
	price: Array<{
		currencyId: string;
		gross: number;
		net: number;
		linked: boolean;
	}>;
	taxId: string;
	categories?: Array<{
		id: string;
		name: string;
	}>;
	visibilities?: Array<{
		salesChannelId: string;
		visibility: number;
	}>;
	ean?: string;
	createdAt?: string;
	updatedAt?: string;
}

export type ProductUpdatePayload = Partial<ProductCreatePayload>;

export type ProductOption = {
	id: string;
	name: string;
};

export type CurrencyOption = {
	id: string;
	name: string;
};

export type TaxOption = {
	id: string;
	name: string;
	taxRate: number;
};

export type CategoryOption = {
	id: string;
	name: string;
};

export type SalesChannelOption = {
	id: string;
	name: string;
};

export type NodePrice = {
	currency: string;
	grossPrice: number;
	autoCalculateNet: boolean;
	netPrice: number;
};

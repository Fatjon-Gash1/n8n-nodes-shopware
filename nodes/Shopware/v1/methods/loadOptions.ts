import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import type { ProductOption, CurrencyOption, TaxOption, CategoryOption, SalesChannelOption } from '../actions/product/types';
import {
	productOptionFields,
	currencyOptionFields,
	taxOptionFields,
	categoryOptionFields,
	salesChannelOptionFields,
} from '../actions/product/fields';
import { apiRequest } from '../transport';

async function fetchResource<T>(
	context: ILoadOptionsFunctions,
	resource: string,
	fields: string[],
	mapValue = false,
): Promise<INodePropertyOptions[]> {
	const returnData: INodePropertyOptions[] = [];

	const body = {
		fields,
		includes: {
			[resource]: fields,
		},
	};
	const response = await apiRequest.call(context, 'POST', `/search/${resource}`, body);

	for (const item of response.data as T[]) {
		const name = item[fields[1] as keyof T] as string;
		let value = item[fields[0] as keyof T] as string;

		if (mapValue) {
			value = fields.map((field) => item[field as keyof T]).join('-');
		}

		returnData.push({
			name,
			value,
		});
	}

	return returnData;
}

export async function getProducts(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return await fetchResource<ProductOption>(this, 'product', productOptionFields);
}

export async function getCurrencies(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return await fetchResource<CurrencyOption>(this, 'currency', currencyOptionFields);
}

export async function getTaxRates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return await fetchResource<TaxOption>(this, 'tax', taxOptionFields, true);
}

export async function getCategories(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return await fetchResource<CategoryOption>(this, 'category', categoryOptionFields, true);
}

export async function getSalesChannels(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	return await fetchResource<SalesChannelOption>(this, 'sales-channel', salesChannelOptionFields);
}

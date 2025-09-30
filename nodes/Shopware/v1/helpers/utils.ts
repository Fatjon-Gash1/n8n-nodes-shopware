import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { currencyFields } from '../actions/product/fields';
import { apiRequest } from '../transport';

export function wrapData(data: IDataObject | IDataObject[]): INodeExecutionData[] {
	if (!Array.isArray(data)) {
		return [{ json: data }];
	}
	return data.map((item) => ({
		json: item,
	}));
}

/**
 * Retrieves the Shopware instance's default installation currency.
 * 
 * @returns A promise resolving to a string representing the currencyId
 */
export async function getDefaultCurrencyId(this: IExecuteFunctions): Promise<string> {
	const body = {
		fields: currencyFields,
		includes: {
			currency: currencyFields,
		},
		filter: [
			{
				type: 'equals',
				field: 'factor',
				value: 1,
			},
		],
	};
	const response = await apiRequest.call(this, 'POST', `/search/currency`, body);
	return response.data[0].id;
}

/**
 * Retrieves the provided product's tax rate.
 * 
 * @param productId - The product UUID
 * @returns A promise resolving to a number representing the tax rate
 */
export async function getProductTaxRate(
	this: IExecuteFunctions,
	productId: string,
): Promise<number> {
	const productBody = {
		fields: ['taxId'],
		includes: {
			product: ['taxId'],
		},
		filter: [
			{
				type: 'equals',
				field: 'id',
				value: productId,
			},
		],
	};

	const taxId = (await apiRequest.call(this, 'POST', `/search/product`, productBody)).data[0].taxId;

	const taxBody = {
		fields: ['taxRate'],
		includes: {
			tax: ['taxRate'],
		},
		filter: [
			{
				type: 'equals',
				field: 'id',
				value: taxId,
			},
		],
	};

	const taxRate = (await apiRequest.call(this, 'POST', `/search/tax`, taxBody)).data[0].taxRate;

	return taxRate;
}

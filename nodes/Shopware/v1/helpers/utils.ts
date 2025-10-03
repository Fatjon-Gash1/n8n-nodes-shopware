import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { currencyFields } from '../actions/product/fields';
import { apiRequest } from '../transport';
import { salutationFields } from '../actions/fields';

export function wrapData(data: IDataObject | IDataObject[]): INodeExecutionData[] {
	if (!Array.isArray(data)) {
		return [{ json: data }];
	}
	return data.map((item) => ({
		json: item,
	}));
}

export function uuidv7(): string {
	const hex = (n: number, width: number) => n.toString(16).padStart(width, '0');

	const now = Date.now();
	const timeHex = hex(now, 12);

	const rand1 = hex(Math.floor(Math.random() * 0xffff), 4);
	const rand2 = hex(Math.floor(Math.random() * 0xffff), 4);
	const rand3 = hex(Math.floor(Math.random() * 0xffffff), 6);
	const rand4 = hex(Math.floor(Math.random() * 0xffffff), 6);

	return timeHex.slice(0, 8) + timeHex.slice(8, 12) + '7' + rand1.slice(1) + rand2 + rand3 + rand4;
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
 * Retrieves the default customer salutation.
 *
 * @returns A promise resolving to a string representing the salutation ID 
 */
export async function getDefaultSalutationId(this: IExecuteFunctions): Promise<string> {
	const body = {
		fields: salutationFields,
		includes: {
			salutation: salutationFields,
		},
		filter: [
			{
				type: 'equals',
				field: 'salutationKey',
				value: 'not_specified',
			},
		],
	};
	const response = await apiRequest.call(this, 'POST', `/search/salutation`, body);
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

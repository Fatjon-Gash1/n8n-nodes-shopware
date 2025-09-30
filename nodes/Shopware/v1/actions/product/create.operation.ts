/* eslint-disable n8n-nodes-base/node-param-description-wrong-for-dynamic-options */
/* eslint-disable n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options */
/* eslint-disable n8n-nodes-base/node-param-description-wrong-for-dynamic-multi-options */
/* eslint-disable n8n-nodes-base/node-param-display-name-wrong-for-dynamic-multi-options */
/* We only allow to select existing entities (e.g. categories, manufacturers, tax rates, etc.) by name for UX convenience. Therefore, we disable the relevant ESLint rules. */

import {
	type INodeExecutionData,
	type INodeProperties,
	type IExecuteFunctions,
	type JsonObject,
	NodeApiError,
	updateDisplayOptions,
	NodeOperationError,
} from 'n8n-workflow';
import type { NodePrice, ProductCreatePayload } from './types';
import { apiRequest } from '../../transport';
import { productFields } from './fields';
import { wrapData, getDefaultCurrencyId } from '../../helpers/utils';

const properties: INodeProperties[] = [
	{
		displayName: 'Parent Product',
		name: 'parent',
		type: 'boolean',
		default: true,
		description: 'Whether to create a parent product or a variant',
	},
	{
		displayName: 'Parent Product ID',
		name: 'parentId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. 2a88d9b59d474...',
		description: 'ID of the parent product',
		displayOptions: {
			show: {
				parent: [false],
			},
		},
	},
	{
		displayName: 'Product Number',
		name: 'productNumber',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. SW10001',
		description: 'Unique identifier for the product',
	},
	{
		displayName: 'EAN',
		name: 'ean',
		type: 'string',
		default: '',
		placeholder: 'e.g. 4006381333931',
		description: 'European Article Number (EAN) of the product',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. Mobile Phone',
		description: 'Product name',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		default: '',
		placeholder: 'e.g. A high-quality mobile phone with a sleek design and advanced features.',
		description: 'Description of the product',
	},
	{
		displayName: 'Gross Price for Default Currency',
		name: 'defaultGrossPrice',
		type: 'number',
		typeOptions: {
			maxValue: 999000000,
			minValue: 0,
			numberPrecision: 2,
		},
		required: true,
		default: 0,
		placeholder: 'e.g. 499.99',
		description: 'Gross price of the product',
	},
	{
		displayName: 'Autocalculate Net',
		name: 'defaultAutoCalculateNet',
		type: 'boolean',
		default: true,
		description:
			'Whether to automatically calculate the net price based on the gross price and tax rate',
	},
	{
		displayName: 'Net Price',
		name: 'defaultNetPrice',
		type: 'number',
		displayOptions: {
			show: {
				defaultAutoCalculateNet: [false],
			},
		},
		typeOptions: {
			maxValue: 999000000,
			minValue: 0,
			numberPrecision: 2,
		},
		required: true,
		default: 0,
		placeholder: 'e.g. 499.99',
		description: 'Net price of the product',
	},
	{
		displayName: 'Prices',
		name: 'prices',
		placeholder: 'Add Price',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		description: 'Additional prices for different currencies',
		default: {},
		options: [
			{
				name: 'price',
				displayName: 'Price',
				values: [
					{
						displayName: 'Currency',
						name: 'currency',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getCurrencies',
						},
						required: true,
						default: '',
						description: 'Choose the price currency from the list',
					},
					{
						displayName: 'Gross Price',
						name: 'grossPrice',
						type: 'number',
						typeOptions: {
							maxValue: 999000000,
							minValue: 0,
							numberPrecision: 2,
						},
						required: true,
						default: 0,
						placeholder: 'e.g. 499.99',
						description: 'Gross price of the product',
					},
					{
						displayName: 'Autocalculate Net',
						name: 'autoCalculateNet',
						type: 'boolean',
						default: true,
						description:
							'Whether to automatically calculate the net price based on the gross price and tax rate',
					},
					{
						displayName: 'Net Price',
						name: 'netPrice',
						type: 'number',
						typeOptions: {
							maxValue: 999000000,
							minValue: 0,
							numberPrecision: 2,
						},
						displayOptions: {
							show: {
								autoCalculateNet: [false],
							},
						},
						required: true,
						default: 0,
						placeholder: 'e.g. 499.99',
						description: 'Net price of the product',
					},
				],
			},
		],
	},
	{
		displayName: 'Tax Rate',
		name: 'taxRate',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getTaxRates',
		},
		required: true,
		default: '',
		description: 'Choose the tax rate from the list',
	},
	{
		displayName: 'Manufacturer',
		name: 'manufacturer',
		type: 'string',
		default: '',
		placeholder: 'e.g. Apple',
		description: 'Name of the manufacturer of the product',
	},
	{
		displayName: 'Stock',
		name: 'stock',
		type: 'number',
		typeOptions: {
			maxValue: 1000000,
			minValue: 0,
		},
		required: true,
		default: 0,
		description: 'Available stock quantity of the product',
	},
	{
		displayName: 'Categories',
		name: 'categories',
		type: 'multiOptions',
		typeOptions: {
			loadOptionsMethod: 'getCategories',
		},
		default: [],
		description: 'Choose the categories to assign the product to',
	},
	{
		displayName: 'Sales Channels',
		name: 'salesChannels',
		type: 'multiOptions',
		typeOptions: {
			loadOptionsMethod: 'getSalesChannels',
		},
		default: [],
		description: 'Choose the sales channels to assign the product to',
	},
	{
		displayName: 'Active',
		name: 'active',
		type: 'boolean',
		default: true,
		description: 'Whether the product is active and visible in the storefront',
	},
];

const displayOptions = {
	show: {
		resource: ['product'],
		operation: ['create'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const defaultCurrencyId = await getDefaultCurrencyId.call(this);

	for (let i = 0; i < items.length; i++) {
		try {
			const createBody: ProductCreatePayload = {
				parentId: !this.getNodeParameter('parent', i)
					? (this.getNodeParameter('parentId', i) as string)
					: '',
				productNumber: this.getNodeParameter('productNumber', i) as string,
				ean: this.getNodeParameter('ean', i) as string,
				name: this.getNodeParameter('name', i) as string,
				description: this.getNodeParameter('description', i) as string,
				price: [
					{
						currencyId: defaultCurrencyId,
						gross: this.getNodeParameter('defaultGrossPrice', i) as number,
						net: this.getNodeParameter('defaultAutoCalculateNet', i)
							? 0
							: (this.getNodeParameter('defaultNetPrice', i) as number),
						linked: true,
					},
					...((
						this.getNodeParameter('prices', i) as {
							price: Array<NodePrice> | null;
						}
					).price
						? (
								this.getNodeParameter('prices', i) as {
									price: Array<NodePrice>;
								}
							).price.map((price) => ({
								currencyId: price.currency,
								gross: price.grossPrice,
								net: price.autoCalculateNet ? 0 : price.netPrice,
								linked: true,
							}))
						: []),
				],
				taxId: (this.getNodeParameter('taxRate', i) as string).split('-')[0],
				manufacturer: (this.getNodeParameter('manufacturer', i) as string)
					? {
							name: this.getNodeParameter('manufacturer', i) as string,
						}
					: undefined,
				stock: this.getNodeParameter('stock', i) as number,
				categories: (this.getNodeParameter('categories', i) as string[]).map((category) => ({
					id: category.split('-')[0],
					name: category.split('-')[1],
				})),
				visibilities: (this.getNodeParameter('salesChannels', i) as string[]).map(
					(salesChannelId) => ({
						salesChannelId,
						visibility: 30,
					}),
				),
				active: this.getNodeParameter('active', i) as boolean,
			};

			const searchBody = {
				fields: productFields,
				includes: {
					product: productFields,
				},
				filter: [{ type: 'equals', field: 'productNumber', value: createBody.productNumber }],
			};

			for (const key in createBody) {
				const typedKey = key as keyof ProductCreatePayload;

				if (
					Array.isArray(createBody[typedKey]) &&
					(createBody[typedKey] as Array<unknown>).length === 0
				) {
					delete createBody[typedKey];
				} else if (createBody[typedKey] === '') {
					delete createBody[typedKey];
				}
			}

			const taxRate = parseFloat((this.getNodeParameter('taxRate', i) as string).split('-')[2]);
			createBody.price.forEach((price) => {
				if (price.net === 0) {
					price.net = parseFloat((price.gross / (1 + taxRate / 100)).toFixed(2));
				}
			});

			await apiRequest.call(this, 'POST', `/product`, createBody);

			const response = await apiRequest.call(this, 'POST', `/search/product`, searchBody);

			const executionData = this.helpers.constructExecutionMetaData(wrapData(response.data), {
				itemData: { item: i },
			});

			returnData.push(...executionData);
		} catch (error) {
			if (this.continueOnFail()) {
				returnData.push({ json: { error: error.message } });
				continue;
			}

			if (error instanceof NodeOperationError) {
				throw error;
			}

			throw new NodeApiError(this.getNode(), error as JsonObject);
		}
	}

	return returnData;
}

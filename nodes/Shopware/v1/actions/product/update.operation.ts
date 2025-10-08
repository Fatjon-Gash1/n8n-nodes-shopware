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
	updateDisplayOptions,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';
import type { NodePrice, ProductUpdatePayload } from './types';
import { getProductTaxRate, wrapData } from '../../helpers/utils';
import { productFields } from './fields';
import { apiRequest } from '../../transport';

const properties: INodeProperties[] = [
	{
		displayName: 'Product ID',
		name: 'id',
		type: 'string',
		default: '',
		placeholder: 'e.g. 2a88d9b59d474...',
		required: true,
		description:
			'ID of the product to update. You can find the ID in the URL when viewing the product in Shopware Admin (e.g. https://your-domain.com/admin#/sw/product/detail/&lt;productId&gt;).',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
			{
				displayName: 'Active',
				name: 'active',
				type: 'boolean',
				default: true,
				description: 'Whether the product is active and visible in the storefront',
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
				displayName: 'EAN',
				name: 'ean',
				type: 'string',
				default: '',
				placeholder: 'e.g. 4006381333931',
				description: 'European Article Number (EAN) of the product',
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
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				placeholder: 'e.g. Mobile Phone',
				description: 'Product name',
			},
			{
				displayName: 'Parent ID',
				name: 'parentId',
				type: 'string',
				default: '',
				placeholder: 'e.g. 2a88d9b59d474...',
				description: 'ID of the parent product if this product is a variant',
			},
			{
				displayName: 'Prices',
				name: 'prices',
				placeholder: 'Add Price',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				description: 'Different prices for different currencies',
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
				displayName: 'Stock',
				name: 'stock',
				type: 'number',
				typeOptions: {
					maxValue: 1000000,
					minValue: 0,
				},
				default: 0,
				description: 'Available stock quantity of the product',
			},
			{
				displayName: 'Tax Rate',
				name: 'taxRate',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getTaxRates',
				},
				default: '',
				description: 'Choose the tax rate from the list',
			},
		],
	},
];

const displayOptions = {
	show: {
		resource: ['product'],
		operation: ['update'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			const id = this.getNodeParameter('id', i) as string;

			const searchBody = {
				fields: productFields,
				includes: {
					product: productFields,
				},
				filter: [{ type: 'equals', field: 'id', value: id }],
			};

			const product = (await apiRequest.call(this, 'POST', `/search/product`, searchBody)).data[0];
			if (!product) {
				throw new NodeOperationError(this.getNode(), 'Product does not exist', {
					description: 'There is no product with id ' + id,
					itemIndex: i,
				});
			}

			const updateFields = this.getNodeParameter('updateFields', i);

			const updateBody: ProductUpdatePayload = {
				parentId: updateFields.parentId as string,
				ean: updateFields.ean as string,
				name: updateFields.name as string,
				description: updateFields.description as string,
				price: [
					...((
						updateFields.prices as {
							price: Array<NodePrice> | null;
						} | null
					)?.price
						? (
								updateFields.prices as {
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
				taxId: (updateFields.taxRate as string)?.split('-')[0],
				manufacturer: (updateFields.manufacturer as string)
					? {
							name: updateFields.manufacturer as string,
						}
					: undefined,
				stock: updateFields.stock as number,
				categories: (updateFields.categories as string[])?.map((category) => ({
					id: category.split('-')[0],
					name: category.split('-')[1],
				})),
				visibilities: (updateFields.salesChannels as string[])?.map((salesChannelId) => ({
					salesChannelId,
					visibility: 30,
				})),
				active: updateFields.active as boolean,
			};

			for (const key in updateBody) {
				const typedKey = key as keyof ProductUpdatePayload;

				if (
					Array.isArray(updateBody[typedKey]) &&
					(updateBody[typedKey] as Array<unknown>).length === 0
				) {
					delete updateBody[typedKey];
				} else if (updateBody[typedKey] === '') {
					delete updateBody[typedKey];
				}
			}

			if (updateBody.price) {
				const taxRate = updateFields.taxRate
					? parseFloat((updateFields.taxRate as string).split('-')[2])
					: await getProductTaxRate.call(this, id);

				updateBody.price.forEach((price) => {
					if (price.net === 0) {
						price.net = parseFloat((price.gross / (1 + taxRate / 100)).toFixed(2));
					}
				});
			}

			await apiRequest.call(this, 'PATCH', `/product/${id}`, updateBody);

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

			throw new NodeApiError(this.getNode(), error as JsonObject);
		}
	}

	return returnData;
}

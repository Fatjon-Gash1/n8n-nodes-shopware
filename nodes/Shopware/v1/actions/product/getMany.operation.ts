/* eslint-disable n8n-nodes-base/node-param-description-wrong-for-dynamic-options */
/* eslint-disable n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options */
import {
	type INodeExecutionData,
	type INodeProperties,
	type IExecuteFunctions,
	type JsonObject,
	NodeApiError,
	updateDisplayOptions,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { productFields } from './fields';
import { constructSearchBody, wrapData } from '../../helpers/utils';

const properties: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: true,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 500,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		options: [
			{
				displayName: 'Active',
				name: 'active',
				type: 'boolean',
				default: true,
				description: 'Whether to filter only active products',
			},
			{
				displayName: 'Available',
				name: 'available',
				type: 'boolean',
				default: true,
				description: 'Whether to filter only available products',
			},
			{
				displayName: 'Created At Max',
				name: 'createdAtMax',
				type: 'dateTime',
				default: '',
				description: 'Shows products that were created at or before date',
			},
			{
				displayName: 'Created At Min',
				name: 'createdAtMin',
				type: 'dateTime',
				default: '',
				description: 'Shows products that were created at or after date',
			},
			{
				displayName: 'Ean',
				name: 'ean',
				type: 'string',
				default: '',
				description: 'Filter products by their ean',
			},
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'string',
				default: '',
				description:
					'Fields the products will return, formatted as a string of comma-separated values. By default all the fields are returned.',
			},
			{
				displayName: 'IDs',
				name: 'ids',
				type: 'string',
				default: '',
				description: 'Retrieve only products specified by a comma-separated list of product IDs',
			},
			{
				displayName: 'Manufacturer',
				name: 'manufacturer',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getManufacturers',
				},
				default: '',
				description: 'Filter products by their manufacturer',
			},
			{
				displayName: 'Max Price',
				name: 'maxPriceUi',
				placeholder: 'Set Max Price',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: false,
				},
				default: {},
				options: [
					{
						name: 'price',
						displayName: 'Price',
						values: [
							{
								displayName: 'Max Price',
								name: 'maxPrice',
								type: 'number',
								typeOptions: {
									maxValue: 999000000,
									minValue: 0,
									numberPrecision: 2,
								},
								default: 0,
								description: 'Shows products that have the same price or less',
							},
							{
								displayName: 'Currency',
								name: 'currency',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getCurrencies',
								},
								default: '',
								description: 'Select the price currency from the list',
							},
						],
					},
				],
			},
			{
				displayName: 'Max Sales',
				name: 'maxSales',
				type: 'number',
				typeOptions: {
					maxValue: 999000000,
					minValue: 0,
				},
				default: 0,
				description: 'Shows products that have the same sales or less',
			},
			{
				displayName: 'Max Stock',
				name: 'maxStock',
				type: 'number',
				typeOptions: {
					maxValue: 999000000,
					minValue: 0,
				},
				default: 0,
				description: 'Shows products that have the same stock or less',
			},
			{
				displayName: 'Min Price',
				name: 'minPriceUi',
				placeholder: 'Set Min Price',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: false,
				},
				default: {},
				options: [
					{
						name: 'price',
						displayName: 'Price',
						values: [
							{
								displayName: 'Min Price',
								name: 'minPrice',
								type: 'number',
								typeOptions: {
									maxValue: 999000000,
									minValue: 0,
									numberPrecision: 2,
								},
								default: 0,
								description: 'Shows products that have the same price or more',
							},
							{
								displayName: 'Currency',
								name: 'currency',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getCurrencies',
								},
								default: '',
								description: 'Select the price currency from the list',
							},
						],
					},
				],
			},
			{
				displayName: 'Min Sales',
				name: 'minSales',
				type: 'number',
				typeOptions: {
					maxValue: 999000000,
					minValue: 0,
				},
				default: 0,
				description: 'Shows products that have the same sales or more',
			},
			{
				displayName: 'Min Stock',
				name: 'minStock',
				type: 'number',
				typeOptions: {
					maxValue: 999000000,
					minValue: 0,
				},
				default: 0,
				description: 'Shows products that have the same stock or more',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Filter products by their name',
			},
			{
				displayName: 'Parent ID',
				name: 'parentId',
				type: 'string',
				default: '',
				placeholder: 'e.g. 2a88d9b59d474...',
				description: 'Filter products by their parent ID',
			},
			{
				displayName: 'Product Number',
				name: 'productNumber',
				type: 'string',
				default: '',
				placeholder: 'e.g. P3284...',
				description: 'Filter products by their number',
			},
			{
				displayName: 'Purchase Steps',
				name: 'purchaseSteps',
				type: 'number',
				typeOptions: {
					maxValue: 999000000,
					minValue: 0,
				},
				default: 0,
				description: 'Shows products that have the same purchase steps',
			},
			{
				displayName: 'Tax',
				name: 'tax',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getTaxes',
				},
				default: '',
				description: 'Filter products by their tax',
			},
		],
	},
];

const displayOptions = {
	show: {
		resource: ['product'],
		operation: ['getMany'],
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
			let page = 1;
			let pageSize = 50;
			let iterate = true;
			let fields = productFields;

			const filters = this.getNodeParameter('filters', i);
			const shrinkedFields = filters.fields;

			if (shrinkedFields) {
				fields = (shrinkedFields as string).split(',').map((field) => field.trim());
			}

			const returnAll = this.getNodeParameter('returnAll', i);
			if (!returnAll) {
				pageSize = this.getNodeParameter('limit', i);
			}

			while (iterate) {
				const body = constructSearchBody.call(
					this,
					{ page, limit: pageSize },
					fields,
					'product',
					filters,
				);

				const response = await apiRequest.call(this, 'POST', `/search/product`, body);

				const executionData = this.helpers.constructExecutionMetaData(wrapData(response.data), {
					itemData: { item: i },
				});

				returnData.push(...executionData);

				if (returnAll && response.data.length === pageSize) {
					page++;
				} else {
					iterate = false;
				}
			}
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

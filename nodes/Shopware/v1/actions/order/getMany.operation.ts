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
import { orderFields } from './fields';
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
				displayName: 'Created At Max',
				name: 'createdAtMax',
				type: 'dateTime',
				default: '',
				description: 'Shows orders that were created at or before date',
			},
			{
				displayName: 'Created At Min',
				name: 'createdAtMin',
				type: 'dateTime',
				default: '',
				description: 'Shows orders that were created at or after date',
			},
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getCurrencies'
				},
				default: '',
				description: 'Filter orders by their currency',
			},
			{
				displayName: 'Delivery State',
				name: 'deliveryState',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getDeliveryStates'
				},
				default: '',
				description: 'Filter orders by their delivery state',
			},
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'string',
				default: '',
				description:
					'Fields the orders will return, formatted as a string of comma-separated values. By default all the fields are returned.',
			},
			{
				displayName: 'IDs',
				name: 'ids',
				type: 'string',
				default: '',
				description: 'Retrieve only orders specified by a comma-separated list of order IDs',
			},
			{
				displayName: 'Max Shipping Total',
				name: 'maxShippingTotal',
				type: 'number',
				typeOptions: {
					maxValue: 999000000,
					minValue: 0,
					numberPrecision: 2,
				},
				default: 0,
				description: 'Shows orders that have the same total shipping price or less',
			},
			{
				displayName: 'Max Total',
				name: 'maxTotal',
				type: 'number',
				typeOptions: {
					maxValue: 999000000,
					minValue: 0,
					numberPrecision: 2,
				},
				default: 0,
				description: 'Shows orders that have the same total price or less',
			},
			{
				displayName: 'Min Shipping Total',
				name: 'minShippingTotal',
				type: 'number',
				typeOptions: {
					maxValue: 999000000,
					minValue: 0,
					numberPrecision: 2,
				},
				default: 0,
				description: 'Shows orders that have the same total shipping price or more',
			},
			{
				displayName: 'Min Total',
				name: 'minTotal',
				type: 'number',
				typeOptions: {
					maxValue: 999000000,
					minValue: 0,
					numberPrecision: 2,
				},
				default: 0,
				description: 'Shows orders that have the same total price or more',
			},
			{
				displayName: 'Order Number',
				name: 'orderNumber',
				type: 'string',
				default: '',
				placeholder: 'e.g. 2a88d9b59d474...',
				description: 'Filter orders by their number',
			},
			{
				displayName: 'Sales Channel',
				name: 'salesChannel',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getSalesChannels'
				},
				default: '',
				description: 'Filter orders by their sales channel',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getOrderStates'
				},
				default: '',
				description: 'Filter orders by their state',
			},
			{
				displayName: 'Transaction State',
				name: 'transactionState',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getTransactionStates'
				},
				default: '',
				description: 'Filter orders by their transaction state',
			},
		],
	},
];

const displayOptions = {
	show: {
		resource: ['order'],
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
			let fields = orderFields;

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
					'order',
					filters,
					'currency',
					'deliveries',
					'transactions',
				);

				const response = await apiRequest.call(this, 'POST', `/search/order`, body);

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

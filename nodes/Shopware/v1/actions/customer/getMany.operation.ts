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
import { customerFields } from './fields';
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
				displayName: 'Account Type',
				name: 'accountType',
				type: 'string',
				default: '',
				description: 'Filter customers by their account type'
			},
			{
				displayName: 'Birthday',
				name: 'birthday',
				type: 'dateTime',
				default: '',
				description: 'Filter customers by their birthday',
			},
			{
				displayName: 'Created At Max',
				name: 'createdAtMax',
				type: 'dateTime',
				default: '',
				description: 'Shows customers that were created at or before date',
			},
			{
				displayName: 'Created At Min',
				name: 'createdAtMin',
				type: 'dateTime',
				default: '',
				description: 'Shows customers that were created at or after date',
			},
			{
				displayName: 'Created By',
				name: 'createdBy',
				type: 'string',
				default: '',
				description: 'Filter customers by their creator\'s ID (if any)'
			},
			{
				displayName: 'Customer Number',
				name: 'customerNumber',
				type: 'string',
				default: '',
				placeholder: 'e.g. C384098...',
				description: 'Filter customers by their number',
			},
			{
				displayName: 'Default Payment Method',
				name: 'defaultPaymentMethod',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getPaymentMethods'
				},
				default: '',
				description: 'Filters customers by their default payment method',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: 'Filter customers by their email',
			},
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'string',
				default: '',
				description:
					'Fields the customers will return, formatted as a string of comma-separated values. By default all the fields are returned.',
			},
			{
				displayName: 'First Login After',
				name: 'firstLoginAfter',
				type: 'dateTime',
				default: '',
				description: 'Shows customers that were first logged in at or after date',
			},
			{
				displayName: 'First Login Before',
				name: 'firstLoginBefore',
				type: 'dateTime',
				default: '',
				description: 'Shows customers that were first logged in at or before date',
			},
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				default: '',
				description: 'Filter customers by their first name',
			},
			{
				displayName: 'Group',
				name: 'group',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getCustomerGroups'
				},
				default: '',
				description: 'Filters customers by their group',
			},
			{
				displayName: 'Guest',
				name: 'guest',
				type: 'boolean',
				default: true,
				description: 'Whether to filter guest customers'
			},
			{
				displayName: 'IDs',
				name: 'ids',
				type: 'string',
				default: '',
				description: 'Retrieve only customers specified by a comma-separated list of customer IDs',
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getLanguages'
				},
				default: '',
				description: 'Filters customers by their language',
			},
			{
				displayName: 'Last Login After',
				name: 'lastLoginAfter',
				type: 'dateTime',
				default: '',
				description: 'Shows customers that were last logged in at or after date',
			},
			{
				displayName: 'Last Login Before',
				name: 'lastLoginBefore',
				type: 'dateTime',
				default: '',
				description: 'Shows customers that were last logged in at or before date',
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				default: '',
				description: 'Filter customers by their last name',
			},
			{
				displayName: 'Last Order Date',
				name: 'lastOrderDate',
				type: 'dateTime',
				default: '',
				description: 'Filter customers by their last order date',
			},
			{
				displayName: 'Max Order Count',
				name: 'maxOrderCount',
				type: 'number',
				typeOptions: {
					maxValue: 999000000,
					minValue: 0,
				},
				default: 0,
				description: 'Shows orders that have the same order count or less',
			},
			{
				displayName: 'Max Order Total Amount',
				name: 'maxOrderTotalAmount',
				type: 'number',
				typeOptions: {
					maxValue: 999000000,
					minValue: 0,
				},
				default: 0,
				description: 'Shows customers that have the same order total or less',
			},
			{
				displayName: 'Max Reviews',
				name: 'maxReviews',
				type: 'number',
				typeOptions: {
					maxValue: 999000000,
					minValue: 0,
				},
				default: 0,
				description: 'Shows orders that have the same amount of reviews or less',
			},
			{
				displayName: 'Min Order Count',
				name: 'minOrderCount',
				type: 'number',
				typeOptions: {
					maxValue: 999000000,
					minValue: 0,
				},
				default: 0,
				description: 'Shows orders that have the same order count or more',
			},
			{
				displayName: 'Min Order Total Amount',
				name: 'minOrderTotalAmount',
				type: 'number',
				typeOptions: {
					maxValue: 999000000,
					minValue: 0,
				},
				default: 0,
				description: 'Shows customers that have the same order total or more',
			},
			{
				displayName: 'Min Reviews',
				name: 'minReviews',
				type: 'number',
				typeOptions: {
					maxValue: 999000000,
					minValue: 0,
				},
				default: 0,
				description: 'Shows orders that have the same amount of reviews or more',
			},
			{
				displayName: 'Sales Channel',
				name: 'salesChannel',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getSalesChannels'
				},
				default: '',
				description: 'Filters customers by their sales channel',
			},
		],
	},
];

const displayOptions = {
	show: {
		resource: ['customer'],
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
			let fields = customerFields;

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
					'customer',
					filters,
				);

				const response = await apiRequest.call(this, 'POST', `/search/customer`, body);

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

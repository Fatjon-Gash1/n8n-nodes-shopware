import {
	type INodeExecutionData,
	type INodeProperties,
	type IExecuteFunctions,
	type JsonObject,
	NodeApiError,
	updateDisplayOptions,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { categoryFields } from './fields';
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
				description: 'Whether to filter only active categories',
			},
			{
				displayName: 'Created At Max',
				name: 'createdAtMax',
				type: 'dateTime',
				default: '',
				description: 'Shows categories that were created at or before date',
			},
			{
				displayName: 'Created At Min',
				name: 'createdAtMin',
				type: 'dateTime',
				default: '',
				description: 'Shows categories that were created at or after date',
			},
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'string',
				default: '',
				description:
					'Fields the categories will return, formatted as a string of comma-separated values. By default all the fields are returned.',
			},
			{
				displayName: 'IDs',
				name: 'ids',
				type: 'string',
				default: '',
				description: 'Retrieve only categories specified by a comma-separated list of category IDs',
			},
			{
				displayName: 'Max Child Count',
				name: 'childCountMax',
				type: 'number',
				typeOptions: {
					maxValue: 999000000,
					minValue: 0,
				},
				default: 0,
				description: 'Shows categories that have the same child count or less',
			},
			{
				displayName: 'Min Child Count',
				name: 'childCountMin',
				type: 'number',
				typeOptions: {
					maxValue: 999000000,
					minValue: 0,
				},
				default: 0,
				description: 'Shows categories that have the same child count or more',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Filter categories by their name',
			},
			{
				displayName: 'Parent ID',
				name: 'parentId',
				type: 'string',
				default: '',
				placeholder: 'e.g. 2a88d9b59d474...',
				description: 'Filter categories by their parent ID',
			},
		],
	},
];

const displayOptions = {
	show: {
		resource: ['category'],
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
			let fields = categoryFields;

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
					'category',
					filters,
				);

				const response = await apiRequest.call(this, 'POST', `/search/category`, body);

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

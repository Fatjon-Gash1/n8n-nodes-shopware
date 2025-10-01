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
import { wrapData } from '../../helpers/utils';

const properties: INodeProperties[] = [
	{
		displayName: 'Customer ID',
		name: 'id',
		type: 'string',
		default: '',
		placeholder: 'e.g. 2a88d9b59d474...',
		required: true,
		description:
			'ID of the customer to get. You can find the ID in the URL when viewing the customer in Shopware Admin (e.g. https://your-domain.com/admin#/sw/customer/detail/&lt;customerId&gt;).',
	},
];

const displayOptions = {
	show: {
		resource: ['customer'],
		operation: ['get'],
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
			const body = {
				fields: customerFields,
				includes: {
					customer: customerFields,
				},
				filter: [{ type: 'equals', field: 'id', value: id }],
			};

			const response = await apiRequest.call(this, 'POST', `/search/customer`, body);

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

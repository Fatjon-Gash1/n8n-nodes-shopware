import {
	type INodeExecutionData,
	type INodeProperties,
	type IExecuteFunctions,
	type JsonObject,
	NodeApiError,
	updateDisplayOptions,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { wrapData } from '../../helpers/utils';

const properties: INodeProperties[] = [
	{
		displayName: 'Order ID',
		name: 'id',
		type: 'string',
		default: '',
		placeholder: 'e.g. 2a88d9b59d474...',
		required: true,
		description:
			'ID of the order to delete. You can find the ID in the URL when viewing the order in Shopware Admin (e.g. https://your-domain.com/admin#/sw/order/detail/&lt;order&gt;).',
	},
];

const displayOptions = {
	show: {
		resource: ['order'],
		operation: ['deleteOrder'],
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

			await apiRequest.call(this, 'DELETE', `/order/${id}`);

			const executionData = this.helpers.constructExecutionMetaData(
				wrapData({ success: true, id, message: `Order ${id} deleted successfully` }),
				{
					itemData: { item: i },
				},
			);

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


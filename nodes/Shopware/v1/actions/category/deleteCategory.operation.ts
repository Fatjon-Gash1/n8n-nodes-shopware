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
		displayName: 'Category ID',
		name: 'id',
		type: 'string',
		default: '',
		placeholder: 'e.g. 2a88d9b59d474...',
		required: true,
		description:
			'ID of the category to delete. You can find the ID in the URL when viewing the category in Shopware Admin (e.g. https://your-domain.com/admin#/sw/category/detail/&lt;categoryId&gt;).',
	},
];

const displayOptions = {
	show: {
		resource: ['category'],
		operation: ['deleteCategory'],
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

			await apiRequest.call(this, 'DELETE', `/category/${id}`);

			const executionData = this.helpers.constructExecutionMetaData(
				wrapData({ success: true, id, message: `Category ${id} deleted successfully` }),
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


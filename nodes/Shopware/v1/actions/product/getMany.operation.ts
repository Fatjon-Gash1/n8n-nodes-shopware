import {
	type INodeExecutionData,
	type INodeProperties,
	type IExecuteFunctions,
	NodeApiError,
	updateDisplayOptions,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';

const properties: INodeProperties[] = [
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		default: {},
		description: 'Additional options which decide which products should be returned',
		placeholder: 'Add option',
		options: [
			{
				// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-multi-options
				displayName: 'Filter Fields',
				name: 'filterFields',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getProductFields',
				},
				default: [],
				// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-dynamic-multi-options
				description: 'The fields to filter products by',
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
			const responseData = await apiRequest.call(this, 'GET', `product`);

			// const options = this.getNodeParameter('options', 0, {});

			returnData.push(responseData);
		} catch (error) {
			if (this.continueOnFail()) {
				returnData.push({ json: { error: error.message } });
				continue;
			}
			throw new NodeApiError(this.getNode(), { error: error.message });
		}
	}

	return returnData;
}

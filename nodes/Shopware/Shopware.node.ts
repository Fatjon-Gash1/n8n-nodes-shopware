import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';
import {
	OptionsWithUri,
} from 'request';

export class Shopware implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Shopware',
		name: 'shopware',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-icon-not-svg
		icon: 'file:shopware.png',
		group: ['input'],
		version: 1,
		subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
		description: 'Read, update, write and delete data from Shopware 6',
		defaults: {
			name: 'Shopware',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'shopwareOAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: ['shopwareOAuth2Api'],
					},
				},
			},
		],
		usableAsTool: true,
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				required: true,
				options: [
					{
						name: 'Customer',
						value: 'customer',
					},
					{
						name: 'Product',
						value: 'product',
					},
					{
						name: 'Order',
						value: 'order',
					},
				],
				default: 'customer',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'create',
				displayOptions: {
					show: {
						resource: ['customer', 'product', 'order'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a resource',
						action: 'Create a resource',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a resource',
						action: 'Delete a resource',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get all resources',
						action: 'Get all resources',
					},
					{
						name: 'GetById',
						value: 'getById',
						description: 'Get a resource by ID',
						action: 'Get a resource by ID',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a resource',
						action: 'Update a resource',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		let responseData;
		const returnData = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			if (resource === 'product') {
				if (operation === 'get') {
					const options: OptionsWithUri = {
						headers: {
							Accept: 'application/json',
						},
						method: 'GET',
						uri: `https://wanted-causal-sawfish.ngrok-free.app/api/product`,
						json: true,
					};
					responseData = await this.helpers.requestWithAuthentication.call(
						this,
						'shopwareOAuth2Api',
						options,
					);
					returnData.push(responseData);
				}
			}
		}
		return [this.helpers.returnJsonArray(returnData)];
	}
}

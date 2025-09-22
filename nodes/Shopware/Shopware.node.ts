import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestOptions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

type Resource = 'customer' | 'product' | 'order';
type Operation = 'get' | 'create' | 'update' | 'delete' | 'getById';
interface ShopwareGetResponse {
	// Define the structure of the response data as per Shopware API
	[key: string]: string | number | boolean | null;
}

async function hitEndpoint(
	context: IExecuteFunctions,
	resource: Resource,
	operation: Operation,
): Promise<ShopwareGetResponse> {
	if (operation !== 'get') {
		throw new NodeOperationError(
			context.getNode(),
			`The operation "${operation}" is not yet implemented.`,
		);
	}

	const options: IHttpRequestOptions = {
		headers: {
			Accept: 'application/json',
		},
		method: 'GET',
		url: `https://wanted-causal-sawfish.ngrok-free.app/api/${resource}`,
		json: true,
	};
	const responseData: ShopwareGetResponse = await context.helpers.requestWithAuthentication.call(
		context,
		'shopwareOAuth2Api',
		options,
	);
	return responseData;
}

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
		const returnData: IDataObject[] = [];

		const resource = this.getNodeParameter('resource', 0) as Resource;
		const operation = this.getNodeParameter('operation', 0) as Operation;

		for (let i = 0; i < items.length; i++) {
			const responseData = await hitEndpoint(this, resource, operation);
			returnData.push(responseData);
		}
		return [this.helpers.returnJsonArray(returnData)];
	}
}

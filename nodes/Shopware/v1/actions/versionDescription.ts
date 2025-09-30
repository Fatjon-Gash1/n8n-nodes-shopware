/* eslint-disable n8n-nodes-base/node-filename-against-convention */
import { NodeConnectionType, type INodeTypeDescription } from 'n8n-workflow';

import * as product from './product/Product.resource';

export const versionDescription: INodeTypeDescription = {
	displayName: 'Shopware',
	name: 'shopware',
	// eslint-disable-next-line n8n-nodes-base/node-class-description-icon-not-svg
	icon: 'file:../../../shopware.png',
	group: ['input'],
	version: [1],
	subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
	description: 'Read, update, write and delete data from Shopware',
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
	properties: [
		{
			displayName: 'Resource',
			name: 'resource',
			type: 'options',
			noDataExpression: true,
			required: true,
			options: [
				{
					name: 'Product',
					value: 'product',
				},
			],
			default: 'product',
		},
		...product.description,
	],
};

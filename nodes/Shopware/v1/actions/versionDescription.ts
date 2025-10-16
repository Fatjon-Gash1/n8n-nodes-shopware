/* eslint-disable n8n-nodes-base/node-filename-against-convention */
import type { INodeTypeDescription } from 'n8n-workflow';

import * as product from './product/Product.resource';
import * as customer from './customer/Customer.resource';
import * as order from './order/Order.resource';
import * as category from './category/Category.resource';

export const versionDescription: INodeTypeDescription = {
	displayName: 'Shopware',
	name: 'shopware',
	// eslint-disable-next-line n8n-nodes-base/node-class-description-icon-not-svg
	icon: 'file:../../shopware.png',
	group: ['input'],
	version: [1],
	subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
	description: 'Read, update, write and delete data from Shopware',
	defaults: {
		name: 'Shopware',
	},
	inputs: ['main'],
	outputs: ['main'],
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
				{
					name: 'Customer',
					value: 'customer',
				},
				{
					name: 'Order',
					value: 'order',
				},
				{
					name: 'Category',
					value: 'category',
				},
			],
			default: 'product',
		},
		...product.description,
		...customer.description,
		...order.description,
		...category.description,
	],
};

import type { INodeProperties } from 'n8n-workflow';

import * as create from './create.operation';
import * as deleteProduct from './deleteProduct.operation';
import * as get from './get.operation';
import * as getMany from './getMany.operation';
import * as update from './update.operation';

export { create, deleteProduct, get, getMany, update };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a product',
				action: 'Create a product',
			},
			{
				name: 'Delete',
				value: 'deleteProduct',
				description: 'Delete a product',
				action: 'Delete a product',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a product',
				action: 'Get a product',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Retrieve many products',
				action: 'Get many products',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a product',
				action: 'Update a product',
			},
		],
		default: 'get',
		displayOptions: {
			show: {
				resource: ['product'],
			},
		},
	},
	...create.description,
	...deleteProduct.description,
	...get.description,
	...getMany.description,
	...update.description,
];

import type { INodeProperties } from 'n8n-workflow';

import * as create from './create.operation';
import * as deleteOrder from './deleteOrder.operation';
import * as get from './get.operation';
import * as getMany from './getMany.operation';
import * as update from './update.operation';

export { create, deleteOrder, get, getMany, update };

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
				description: 'Create an order',
				action: "Create an order"
			},
			{
				name: 'Delete',
				value: 'deleteOrder',
				description: 'Delete an order',
				action: 'Delete an order'
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve an order',
				action: 'Get an order',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Retrieve many orders',
				action: 'Get many orders',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an order',
				action: 'Update an order',
			},
		],
		default: 'getMany',
		displayOptions: {
			show: {
				resource: ['order'],
			},
		},
	},
	...create.description,
	...deleteOrder.description,
	...get.description,
	...getMany.description,
	...update.description,
];

import type { INodeProperties } from 'n8n-workflow';

import * as create from './create.operation';
import * as deleteCustomer from './deleteCustomer.operation';
import * as get from './get.operation';
import * as getMany from './getMany.operation';
import * as update from './update.operation';

export { create, deleteCustomer, get, getMany, update };

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
				description: 'Create a customer',
				action: 'Create a customer',
			},
			{
				name: 'Delete',
				value: 'deleteCustomer',
				description: 'Delete a customer',
				action: 'Delete a customer',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a customer',
				action: 'Get a customer',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Retrieve many customers',
				action: 'Get many customers',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a customer',
				action: 'Update a customer',
			},
		],
		default: 'getMany',
		displayOptions: {
			show: {
				resource: ['customer'],
			},
		},
	},
	...create.description,
	...deleteCustomer.description,
	...get.description,
	...getMany.description,
	...update.description,
];

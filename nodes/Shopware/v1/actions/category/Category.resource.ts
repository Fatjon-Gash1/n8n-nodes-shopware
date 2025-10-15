import type { INodeProperties } from 'n8n-workflow';

import * as create from './create.operation';
import * as deleteCategory from './deleteCategory.operation';
import * as get from './get.operation';
import * as getMany from './getMany.operation';
import * as update from './update.operation';

export { create, deleteCategory, get, getMany, update };

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
				description: 'Create a category',
				action: 'Create a category',
			},
			{
				name: 'Delete',
				value: 'deleteCategory',
				description: 'Delete a category',
				action: 'Delete a category',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a category',
				action: 'Get a category',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Retrieve many categories',
				action: 'Get many categories',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a category',
				action: 'Update a category',
			},
		],
		default: 'get',
		displayOptions: {
			show: {
				resource: ['category'],
			},
		},
	},
	...create.description,
	...deleteCategory.description,
	...get.description,
	...getMany.description,
	...update.description,
];


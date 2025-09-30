import type { INodeProperties } from 'n8n-workflow';

import * as get from './get.operation';
import * as getMany from './getMany.operation';

export { get, getMany };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
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
		],
		default: 'getMany',
		displayOptions: {
			show: {
				resource: ['customer'],
			},
		},
	},
	...get.description,
	...getMany.description,
];

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
				description: 'Retrieve a order',
				action: 'Get a order',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Retrieve many orders',
				action: 'Get many orders',
			},
		],
		default: 'getMany',
		displayOptions: {
			show: {
				resource: ['order'],
			},
		},
	},
	...get.description,
	...getMany.description,
];

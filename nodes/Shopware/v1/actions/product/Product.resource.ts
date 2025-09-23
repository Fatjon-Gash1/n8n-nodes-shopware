import type { INodeProperties } from 'n8n-workflow';

import * as getMany from './getMany.operation';

export { getMany };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Retrieve many products',
				action: 'Get many products',
			},
		],
		default: 'getMany',
		displayOptions: {
			show: {
				resource: ['product'],
			},
		},
	},
	...getMany.description,
];
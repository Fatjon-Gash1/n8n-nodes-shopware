import { orderFields } from '../../../../v1/actions/order/fields';
import * as getMany from '../../../../v1/actions/order/getMany.operation';
import * as transport from '../../../../v1/transport';
import { createMockExecuteFunction } from '../helpers';

jest.mock('../../../../v1/transport', () => {
	const originalModule = jest.requireActual('../../../../v1/transport');
	return {
		...originalModule,
		apiRequest: jest.fn(async function (method: string) {
			if (method === 'POST') {
				return {
					data: [
						{
							id: 'aksldfjaksljf',
							orderNumber: 'ON389043',
							orderDateTime: '2025/10/01',
							amountTotal: 39.99,
							amountNet: 30.99,
						},
					],
				};
			}
			return undefined;
		}),
	};
});

describe('Test Shopwarev1, getMany operation', () => {
	it('should return all orders', async () => {
		const nodeParameters = {
			operation: 'getMany',
			returnAll: true,
			filters: {
				fields: '',
			},
		};

		const items = [
			{
				json: {},
			},
		];

		const result = await getMany.execute.call(createMockExecuteFunction(nodeParameters), items);

		expect(transport.apiRequest).toHaveBeenCalledTimes(1);
		expect(transport.apiRequest).toHaveBeenCalledWith('POST', '/search/order', {
			fields: orderFields,
			filter: [],
			includes: { order: orderFields },
			limit: 50,
			page: 1,
			associations: {
				currency: {},
				deliveries: {
					associations: {
						stateMachineState: {},
					},
				},
				transactions: {
					associations: {
						stateMachineState: {},
					},
				},
			},
		});
		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			json: {
				id: 'aksldfjaksljf',
				orderNumber: 'ON389043',
				orderDateTime: '2025/10/01',
				amountTotal: 39.99,
				amountNet: 30.99,
			},
			pairedItem: { item: 0 },
		});
	});
});

import { productFields } from '../../../../v1/actions/product/fields';
import * as getMany from '../../../../v1/actions/product/getMany.operation';
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
							name: 'testName',
                            productNumber: 'PN389043',
							stock: 3,
						},
					],
				};
			}
			return undefined;
		}),
	};
});

describe('Test Shopwarev1, getMany operation', () => {
	it('should return all products', async () => {
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
		expect(transport.apiRequest).toHaveBeenCalledWith('POST', '/search/product', {
			fields: productFields,
			filter: [],
			includes: { product: productFields },
			limit: 50,
			page: 1,
		});
		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			json: {
				id: 'aksldfjaksljf',
				name: 'testName',
				productNumber: 'PN389043',
				stock: 3,
			},
			pairedItem: { item: 0 },
		});
	});
});

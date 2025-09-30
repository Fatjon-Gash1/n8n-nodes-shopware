import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import type { ShopwareType } from './node.type';
import { NodeOperationError } from 'n8n-workflow';
import * as product from './product/Product.resource';

/**
 * Routes the execution to the appropriate resource and operation handler.
 *
 * @returns A promise resolving to the node execution data for n8n.
 *
 * @throws NodeOperationError
 * Thrown if the resource operation is not supported.
 *
 * @throws NodeApiError
 * Thrown if the API request fails.
 */
export async function router(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	let returnData: INodeExecutionData[] = [];

	const items = this.getInputData();
	const resource = this.getNodeParameter<ShopwareType>('resource', 0);
	const operation = this.getNodeParameter('operation', 0);

	const shopwareNodeData = {
		resource,
		operation,
	} as ShopwareType;

	try {
		switch (shopwareNodeData.resource) {
			case 'product':
				returnData = await product[shopwareNodeData.operation].execute.call(this, items);
				break;
			default:
				throw new NodeOperationError(
					this.getNode(),
					`The operation "${operation}" is not supported!`,
				);
		}
	} catch (error) {
		if (
			error.description &&
			(error.description as string).includes('cannot accept the provided value')
		) {
			error.description = `${error.description}. Consider using 'Typecast' option`;
		}
		throw error;
	}

	return [returnData];
}

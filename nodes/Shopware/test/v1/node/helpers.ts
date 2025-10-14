import get from 'lodash/get';
import type {
	INodeExecutionData,
	IPairedItemData,
	NodeExecutionWithMetadata,
	IDataObject,
	IExecuteFunctions,
	IGetNodeParameterOptions,
	INode,
} from 'n8n-workflow';

export const node: INode = {
	id: '11',
	name: 'Shopware node',
	typeVersion: 1,
	type: 'n8n-community-nodes.shopware',
	position: [42, 42],
	parameters: {
		operation: 'getMany',
	},
};

/**
 * Takes generic input data and brings it into the new json, pairedItem format n8n uses.
 * @param {(IPairedItemData)} itemData
 * @param {(INodeExecutionData[])} inputData
 */
export function constructExecutionMetaData(
	inputData: INodeExecutionData[],
	options: { itemData: IPairedItemData | IPairedItemData[] },
): NodeExecutionWithMetadata[] {
	const { itemData } = options;
	return inputData.map((data: INodeExecutionData) => {
		const { json, ...rest } = data;
		return { json, pairedItem: itemData, ...rest } as NodeExecutionWithMetadata;
	});
}

export const createMockExecuteFunction = (nodeParameters: IDataObject) => {
	const fakeExecuteFunction = {
		getInputData: jest.fn(() => {
			return [{ json: {} }];
		}),
		getNodeParameter: jest.fn(
			(
				parameterName: string,
				_itemIndex: number,
				fallbackValue?: IDataObject,
				options?: IGetNodeParameterOptions,
			) => {
				const parameter = options?.extractValue ? `${parameterName}.value` : parameterName;
				return get(nodeParameters, parameter, fallbackValue);
			},
		),
		getNode: jest.fn(() => {
			return node;
		}),
		helpers: { constructExecutionMetaData: jest.fn(constructExecutionMetaData) },
		continueOnFail: jest.fn(() => false),
	} as unknown as IExecuteFunctions;
	return fakeExecuteFunction;
};

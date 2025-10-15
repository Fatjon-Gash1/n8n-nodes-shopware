import {
	type INodeExecutionData,
	type INodeProperties,
	type IExecuteFunctions,
	type JsonObject,
	NodeApiError,
	updateDisplayOptions,
	NodeOperationError,
} from 'n8n-workflow';
import type { NodeChildCategory, CategoryCreatePayload } from './types';
import { apiRequest } from '../../transport';
import { categoryFields } from './fields';
import { wrapData, uuidv7 } from '../../helpers/utils';

const properties: INodeProperties[] = [
	{
		displayName: 'Parent Category',
		name: 'parent',
		type: 'boolean',
		default: true,
		description: 'Whether to create a parent category or a child',
	},
	{
		displayName: 'Create Parent',
		name: 'createParent',
		type: 'boolean',
		default: true,
		description: 'Whether to create a parent category for the child category',
		displayOptions: {
			show: {
				parent: [false],
			},
		},
	},
	{
		// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
		displayName: 'Parent Category',
		name: 'parentId',
		type: 'options',
        typeOptions: {
            loadOptionsMethod: 'getCategories'
        },
		required: true,
		default: '',
		placeholder: 'e.g. 2a88d9b59d474...',
		// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-dynamic-options
		description: 'Select the parent category from the list',
		displayOptions: {
			show: {
				createParent: [false],
				parent: [false],
			},
		},
	},
	{
		displayName: 'Parent Category Name',
		name: 'parentCategoryName',
		type: 'string',
		required: true,
		default: '',
		description: 'Name of the parent category',
		displayOptions: {
			show: {
				createParent: [true],
				parent: [false],
			},
		},
	},
	{
		displayName: 'Parent Category Description',
		name: 'parentCategoryDescription',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		required: true,
		default: '',
		description: 'Description of parent category',
		displayOptions: {
			show: {
				createParent: [true],
				parent: [false],
			},
		},
	},
	{
		displayName: 'Category Name',
		name: 'categoryName',
		type: 'string',
		required: true,
		default: '',
		description: 'Name of the category',
	},
	{
		displayName: 'Category Description',
		name: 'categoryDescription',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		required: true,
		default: '',
		description: 'Description of category',
	},
	{
		displayName: 'Children',
		name: 'children',
		placeholder: 'Add Child Category',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		description: 'Child categories for category',
		default: {},
		options: [
			{
				name: 'category',
				displayName: 'Category',
				values: [
					{
						displayName: 'Category Name',
						name: 'categoryName',
						type: 'string',
						required: true,
						default: '',
						description: 'Name of the category',
					},
					{
						displayName: 'Category Description',
						name: 'categoryDescription',
						type: 'string',
						typeOptions: {
							rows: 4,
						},
						required: true,
						default: '',
						description: 'Description of category',
					},
				],
			},
		],
	},
];

const displayOptions = {
	show: {
		resource: ['category'],
		operation: ['create'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			const id = uuidv7();
			let parent: CategoryCreatePayload['parent'] | null = null;
			let parentId: string | null = null;
			let children: CategoryCreatePayload['children'] | null = null;

			if (!this.getNodeParameter('parent', i)) {
				if (this.getNodeParameter('createParent', i)) {
					parent = {
						name: this.getNodeParameter('parentCategoryName', i) as string,
						description: this.getNodeParameter('parentCategoryDescription', i) as string,
					};
				} else {
					parentId = (this.getNodeParameter('parentId', i) as string).split('-')[0];
				}
			}

			const nodeChildCategories = (
				this.getNodeParameter('children', i) as {
					category: Array<NodeChildCategory> | null;
				}
			)?.category;

			if (nodeChildCategories && nodeChildCategories.length > 0) {
				children = nodeChildCategories.map((category) => ({
					name: category.categoryName,
					description: category.categoryDescription,
				}));
			}

			const createBody: CategoryCreatePayload = {
				id,
				name: this.getNodeParameter('categoryName', i) as string,
				description: this.getNodeParameter('categoryDescription', i) as string,
				parentId,
				parent,
				children,
			};

			const searchBody = {
				fields: categoryFields,
				includes: {
					category: categoryFields,
				},
				filter: [{ type: 'equals', field: 'id', value: id }],
			};

			for (const key in createBody) {
				const typedKey = key as keyof CategoryCreatePayload;

				if (createBody[typedKey] === null) {
					delete createBody[typedKey];
				}
			}

			await apiRequest.call(this, 'POST', `/category`, createBody);

			const response = await apiRequest.call(this, 'POST', `/search/category`, searchBody);

			const executionData = this.helpers.constructExecutionMetaData(wrapData(response.data), {
				itemData: { item: i },
			});

			returnData.push(...executionData);
		} catch (error) {
			if (this.continueOnFail()) {
				returnData.push({ json: { error: error.message } });
				continue;
			}

			if (error instanceof NodeOperationError) {
				throw error;
			}

			throw new NodeApiError(this.getNode(), error as JsonObject);
		}
	}

	return returnData;
}

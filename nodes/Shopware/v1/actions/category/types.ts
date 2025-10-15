import type { IDataObject } from 'n8n-workflow';

export interface CategoryCreatePayload extends IDataObject {
	name: string;
	description: string;
	parentId?: string | null;
	parent?: {
		name: string;
		description: string;
	} | null;
	children?: Array<{
		name: string;
		description: string;
	}> | null;
}

export type CategoryUpdatePayload = Partial<CategoryCreatePayload>;

export type NodeChildCategory = {
    categoryName: string;
    categoryDescription: string;
}
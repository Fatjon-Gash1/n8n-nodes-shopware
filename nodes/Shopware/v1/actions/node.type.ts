import type { AllEntities } from 'n8n-workflow';

type NodeMap = {
	// product: 'create' | 'upsert' | 'deleteRecord' | 'get' | 'getMany' | 'search' | 'update';
	product: 'getMany';
};

export type ShopwareType = AllEntities<NodeMap>;
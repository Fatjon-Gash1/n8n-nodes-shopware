import type { AllEntities } from 'n8n-workflow';

type NodeMap = {
	product: 'create' | 'upsert' | 'deleteRecord' | 'get' | 'getMany' | 'search' | 'update';
};

export type ShopwareType = AllEntities<NodeMap>;
import type { AllEntities } from 'n8n-workflow';

type NodeMap = {
	product: 'create' | 'deleteProduct' | 'get' | 'getMany' | 'update';
};

export type ShopwareType = AllEntities<NodeMap>;

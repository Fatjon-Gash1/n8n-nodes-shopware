import type { INodeTypeBaseDescription, IVersionedNodeType } from 'n8n-workflow';
import { VersionedNodeType } from 'n8n-workflow';

import { ShopwareV1 } from './v1/ShopwareV1.node';

export class Shopware extends VersionedNodeType {
	constructor() {
		const baseDescription: INodeTypeBaseDescription = {
			displayName: 'Shopware',
			name: 'shopware',
			// eslint-disable-next-line n8n-nodes-base/node-class-description-icon-not-svg
			icon: 'file:shopware.png',
			group: ['input'],
			description: 'Read, update, write and delete data from Shopware',
			defaultVersion: 1,
		};

		const nodeVersions: IVersionedNodeType['nodeVersions'] = {
			1: new ShopwareV1(baseDescription),
		};

		super(nodeVersions, baseDescription);
	}
}
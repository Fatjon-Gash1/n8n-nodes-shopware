# @solution25/n8n-nodes-shopware

This is an n8n community node. It lets you use Shopware 6 in your n8n workflows.

Shopware 6 is a modern, open-source, headless e-commerce platform designed for flexibility and scalability. With this node, you can connect your Shopware store to other services and automate tasks such as product management, order processing, and customer handling.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Usage](#usage)
[Resources](#resources)
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

This node currently supports the following resources and operations:

| Resource | Get | Get Many | Create | Update | Delete |
|----------|-----|----------|--------|--------|--------|
| Product  |  ✓  |     ✓    |    ✓   |    ✓   |    ✓   |
| Customer |  ✓  |     ✓    |    ✓   |    ✓   |    ✓   |
| Order    |  ✓  |     ✓    |    ✓   |    ✓   |    ✓   |

## Credentials

Authentication is handled via a [Shopware Integration](https://docs.shopware.com/en/shopware-6-en/settings/system/integrationen), which you can create in the Shopware admin panel.
Required fields:

* Domain (your Shopware 6 store URL)

* Client ID

* Client Secret

Once configured, the node uses these credentials to authenticate against the Shopware Admin API.

## Compatibility

n8n version: tested with the latest n8n release (keep n8n updated for best compatibility).

Shopware version: compatible with Shopware 6.6.x.x.

## Usage

Here are a few examples of what you can do with this node:

* Automatically create a new customer in Shopware when a signup happens in another system.

* Sync products between Shopware and an external inventory tool.

* Fetch new orders and send notifications to Slack, email, or other channels.

For general n8n usage, see the [Try it out guide](https://docs.n8n.io/try-it-out/).

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [Shopware 6 Admin API reference](https://shopware.stoplight.io/docs/admin-api/twpxvnspkg3yu-quick-start-guide)
* [Shopware documentation](https://docs.shopware.com)
* [Shopware official site](https://www.shopware.com)

## Version history

* 0.1.0-alpha — Pre-release with basic support for product, customer, and order resources.
* 1.0.0 - Initial release with full support for product resource.
* 1.1.0 - Minor release with full support for product and customer resource.
* 1.2.0 - Minor release with full support for product, customer, and order resources.
* 1.2.1 - Patch release with fixes for order creation using node created customers.
* 1.3.0 - Minor release with ample filters for all resources.
* 1.3.1 - Patch release with base unit testing for all resources.

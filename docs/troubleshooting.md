# Shopware Node Troubleshooting Guide

This document provides detailed troubleshooting guidance for the **Shopware node** in n8n.  
It focuses on issues related to **credentials, resources, operations, API behavior, and node-level errors** when interacting with the Shopware Admin API.

---

## 1. Node Initialization Issues

### `Node Not Found / Invalid Node Type`

**Error Message:**
`Node type "CUSTOM.shopware" could not be found`

**Possible Causes:**
- The custom Shopware node was not properly registered.
- The node file is missing or incorrectly named.
- The n8n instance has not been rebuilt after adding the custom node.

**Fix:**
1. Verify that your Shopware node exists in the correct directory:
`~/.n8n/custom/nodes/Shopware/Shopware.node.js`
2. Run:
```bash
n8n stop
n8n build
n8n start
```
3. Confirm the node appears in the n8n UI under **“Nodes → Custom”**.

---

## 2. Credential Issues
### `401 Unauthorized`

Cause: Invalid or expired access token, or incorrect `Client ID/Secret` pair.

**Fix:**

- Revalidate Shopware credentials in n8n under:
```nginx
Credentials → Shopware OAuth2 API
```
- Ensure:

    - The `Client ID`, `Client Secret`, and `API URL` are correct.

    - The API user has the required scopes (e.g., `read product`, `write product`).

**Verification:**
Test manually via cURL:

```bash
curl -X GET https://<shop-domain>/api/_info/version \
     -H "Authorization: Bearer <ACCESS_TOKEN>"
```

## 403 Forbidden

**Cause:** Insufficient API permissions or disabled integration in Shopware.

**Fix:**

- In **Shopware Admin → Settings → System → Integrations:**

    - Ensure the integration is `Active`.

    - Check permissions for the required entities (`product`, `order`, `customer`, etc.).

- Reissue credentials if the integration was reconfigured.

---

## 3. API Response & Data Issues
### `400 Bad Request`

**Cause:** Malformed payload or unsupported property in a node operation.

**Examples:**

- Sending fields that do not exist in the Shopware schema.
- Using string values for numerical fields (e.g., `price`).

**Fix:**

- Validate field structure against the [Shopware Admin API Schema](https://shopware.stoplight.io/docs/admin-api/9a2bfcaac4cf6-list-with-basic-information-of-customer-resources)
- Enable **“Continue on Fail”** in the node for non-critical items to skip invalid entries.

### `504 Gateway Timeout`

**Cause:** The Shopware server took too long to respond due to large payloads or filters.

**Fix:**

- Use pagination parameters (`limit`) for `getMany` operations.

- Avoid unfiltered queries across large datasets.

- If available, enable caching or background processing in Shopware.

### `404 Not Found`

**Cause:** The resource ID provided doesn’t exist or the URL is incorrect.

**Fix:**

- Double-check `resourceId` or endpoint paths.

- Confirm that the `product`, `order`, or `customer` exists in Shopware Admin.

- Log the request body and endpoint from the n8n execution to verify correctness.

---

## 4. Operation-Level Issues
### Unsupported Operation

**Error:**

```kotlin
The selected operation is not available for this resource
```

**Cause:** Attempting an operation (`update`, `delete`, etc.) on a resource that doesn’t support it.

**Fix:**

- Check the supported operations in the Shopware node configuration:

    - `product`: getMany, get, create, update, delete

    - `customer`: getMany, get, create, update, delete

    - `order`: getMany, get, create, update, delete

- Ensure that the resource matches the intended API route.

---

## 5. Debugging n8n Errors
### Step-by-Step Diagnostics

1. Inspect Execution Logs:
In n8n **→ Executions → Error Details → JSON**, review:

- `httpCode`

- `error.message`

- `response.body`

---

2. Enable Node Debug Mode:
```bash
export N8N_LOG_LEVEL=debug
n8n start
```

Re-run the workflow to view HTTP requests/responses in logs.

---

3. Validate Node Parameters:

- Ensure correct field names match Shopware’s property schema.

- Use expressions only where supported (e.g., **={{$json["id"]}}**).

---

4. Retry Behavior:

- If using network-sensitive endpoints, wrap the Shopware node in an n8n `Error Trigger` or `Try/Catch` to handle intermittent failures.

---

## 6. Best Practices

| Recommendation            | Description                                                            |
| ------------------------- | ---------------------------------------------------------------------- |
| **Use Pagination (Limit)**| Avoid fetching large result sets in a single request.                  |
| **Handle Rate Limits**    | Shopware throttles API usage; add delays for high-frequency workflows. |
| **Cache Static Data**     | Store non-changing entities locally to reduce load.                    |
| **Version Pinning**       | Lock your node’s `typeVersion` to prevent breaking updates.            |
| **Test API Connectivity** | Always validate credentials and endpoints before large executions.     |

---

## References

- [Shopware API Reference](https://developer.shopware.com/docs/resources/references/api-reference.html)
- [Shopware OAuth2 Integration Guide](https://docs.shopware.com/en/shopware-6-en/settings/system/integrationen)
- [n8n Troubleshooting](https://docs.n8n.io/integrations/creating-nodes/test/troubleshooting-node-development/)

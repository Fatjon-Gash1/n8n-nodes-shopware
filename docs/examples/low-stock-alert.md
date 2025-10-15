# Example: Shopware Low-Stock Alert Workflow

This example demonstrates how to automatically detect and store low-stock products from multiple **Shopware 6** projects defined in **Airtable**.  
It checks stock levels for each project at a scheduled interval, based on the project's specific low-stock threshold.

---

## Workflow Overview

| Component | Description |
|------------|-------------|
| **Trigger** | Scheduled execution using the `Schedule Trigger` node. |
| **Data Source** | Retrieves project URLs and thresholds from the Airtable “Projects” table. |
| **Logic** | Iterates over all projects, checks product stock levels in Shopware via the custom Shopware node. |
| **Output** | Stores low-stock summary data in the “Project Low Stock Alerts” table and detailed entries in “Product Low Stock Alerts.” |

---

## Workflow Steps

1. **Schedule Trigger** – Runs at a fixed interval (e.g., every 24h).  
2. **Get Project URLs** – Retrieves all Shopware projects and their thresholds from Airtable.  
3. **Loop Over Project URLs** – Iterates through each project record.  
4. **Switch Shopware Project Credentials** – Chooses the correct Shopware credentials dynamically per project.  
5. **Get Low Stock Products (Per Project)** – Fetches all products below the defined stock threshold.  
6. **Serialize Products** – Adds useful references such as admin links to each product.  
7. **Filter Project Products** – Counts the total number of low-stock products for that project.  
8. **Create Low Stock Project Record** – Writes summary data into “Project Low Stock Alerts.”  
9. **Create Low Stock Product Record/s** – Logs each low-stock product in the “Product Low Stock Alerts” table, linking it to the project entry.

---

## Airtable Setup

This workflow uses three tables inside the same base:

| Table | Purpose |
|--------|----------|
| **Projects** | Stores project name, Shopware URL, and threshold. |
| **Project Low Stock Alerts** | Stores summary info (project name, total low-stock count, threshold). |
| **Product Low Stock Alerts** | Stores per-product low-stock data linked to a project record. |

---

## Download

You can download the ready-to-import n8n workflow JSON below:

[**Download Shopware Low-Stock Alert Workflow**](../../workflows/low-stock-alert.json)

*(Import this file directly into your n8n instance.)*

---

## Tips

- Adjust the **threshold field** in Airtable to customize the alert sensitivity per project.  
- Combine with **email or Slack nodes** to send notifications for low-stock events.  
- You can schedule the workflow daily, hourly, or based on custom triggers like webhooks or product updates.

---

## Other Examples

[Shopware Sales Report Example Workflow](sales-report.md)

---

## Related Resources

- [Shopware Product Resource](../resources/products.md)  
- [Airtable Node Documentation](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.airtable/)  
- [Shopware API Reference](https://developer.shopware.com/docs/resources/references/api-reference.html)

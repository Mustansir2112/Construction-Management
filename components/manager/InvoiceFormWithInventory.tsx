"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Package } from "lucide-react";
import { InvoiceData, InvoiceItem } from "@/types/invoice";

interface InventoryItem {
  id: string;
  item_name: string;
  item_id: string;
  quantity: number;
  zone: string;
}

export function InvoiceFormWithInventory({
  onGenerate,
}: {
  onGenerate: (data: InvoiceData) => void;
}) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const formatDateForInvoice = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const [invoice, setInvoice] = useState<InvoiceData>({
    invoiceNo: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    invoiceDate: formatDateForInvoice(new Date()),
    dueDate: formatDateForInvoice(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    company: {
      name: "",
      gstin: "",
      address: "",
      phone: "",
    },
    client: {
      name: "",
      gstin: "",
      address: "",
      projectName: "",
      siteAddress: "",
    },
    items: [],
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    const supabase = createClient();
    const { data } = await supabase
      .from("inventory")
      .select("*")
      .order("item_name", { ascending: true });

    if (data) {
      setInventory(data);
    }
    setLoading(false);
  }

  function addItemFromInventory(item: InventoryItem) {
    const newItem: InvoiceItem = {
      description: item.item_name,
      hsn: "9954", // Default HSN for construction services
      qty: 1,
      unit: "Unit",
      rate: 0, // User needs to input
      taxPercent: 18, // Default GST
    };

    setInvoice({
      ...invoice,
      items: [...invoice.items, newItem],
    });
  }

  function updateItem(index: number, field: keyof InvoiceItem, value: any) {
    const updatedItems = [...invoice.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setInvoice({ ...invoice, items: updatedItems });
  }

  function removeItem(index: number) {
    setInvoice({
      ...invoice,
      items: invoice.items.filter((_, i) => i !== index),
    });
  }

  function addManualItem() {
    const newItem: InvoiceItem = {
      description: "",
      hsn: "9954",
      qty: 1,
      unit: "Unit",
      rate: 0,
      taxPercent: 18,
    };
    setInvoice({ ...invoice, items: [...invoice.items, newItem] });
  }

  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-xl font-semibold">Invoice Details</h2>

      {/* Invoice Number & Dates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="invoiceNo">Invoice Number *</Label>
          <Input
            id="invoiceNo"
            value={invoice.invoiceNo}
            onChange={(e) =>
              setInvoice({ ...invoice, invoiceNo: e.target.value })
            }
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="invoiceDate">Invoice Date *</Label>
          <Input
            id="invoiceDate"
            type="date"
            value={
              invoice.invoiceDate
                ? new Date(invoice.invoiceDate).toISOString().split("T")[0]
                : ""
            }
            onChange={(e) =>
              setInvoice({
                ...invoice,
                invoiceDate: formatDateForInvoice(new Date(e.target.value)),
              })
            }
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="dueDate">Due Date *</Label>
          <Input
            id="dueDate"
            type="date"
            value={
              invoice.dueDate
                ? new Date(invoice.dueDate).toISOString().split("T")[0]
                : ""
            }
            onChange={(e) =>
              setInvoice({
                ...invoice,
                dueDate: formatDateForInvoice(new Date(e.target.value)),
              })
            }
            required
            className="mt-1"
          />
        </div>
      </div>

      {/* Company Details */}
      <div className="border-t pt-4">
        <h3 className="font-semibold mb-4">Company Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              value={invoice.company.name}
              onChange={(e) =>
                setInvoice({
                  ...invoice,
                  company: { ...invoice.company, name: e.target.value },
                })
              }
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="companyGSTIN">Company GSTIN *</Label>
            <Input
              id="companyGSTIN"
              value={invoice.company.gstin}
              onChange={(e) =>
                setInvoice({
                  ...invoice,
                  company: { ...invoice.company, gstin: e.target.value },
                })
              }
              required
              className="mt-1"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="companyAddress">Company Address *</Label>
            <Input
              id="companyAddress"
              value={invoice.company.address}
              onChange={(e) =>
                setInvoice({
                  ...invoice,
                  company: { ...invoice.company, address: e.target.value },
                })
              }
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="companyPhone">Company Phone *</Label>
            <Input
              id="companyPhone"
              value={invoice.company.phone}
              onChange={(e) =>
                setInvoice({
                  ...invoice,
                  company: { ...invoice.company, phone: e.target.value },
                })
              }
              required
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Client Details */}
      <div className="border-t pt-4">
        <h3 className="font-semibold mb-4">Client Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="clientName">Client Name *</Label>
            <Input
              id="clientName"
              value={invoice.client.name}
              onChange={(e) =>
                setInvoice({
                  ...invoice,
                  client: { ...invoice.client, name: e.target.value },
                })
              }
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="clientGSTIN">Client GSTIN (Optional)</Label>
            <Input
              id="clientGSTIN"
              value={invoice.client.gstin || ""}
              onChange={(e) =>
                setInvoice({
                  ...invoice,
                  client: { ...invoice.client, gstin: e.target.value },
                })
              }
              className="mt-1"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="clientAddress">Client Address *</Label>
            <Input
              id="clientAddress"
              value={invoice.client.address}
              onChange={(e) =>
                setInvoice({
                  ...invoice,
                  client: { ...invoice.client, address: e.target.value },
                })
              }
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="projectName">Project Name *</Label>
            <Input
              id="projectName"
              value={invoice.client.projectName}
              onChange={(e) =>
                setInvoice({
                  ...invoice,
                  client: { ...invoice.client, projectName: e.target.value },
                })
              }
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="siteAddress">Site Address *</Label>
            <Input
              id="siteAddress"
              value={invoice.client.siteAddress}
              onChange={(e) =>
                setInvoice({
                  ...invoice,
                  client: { ...invoice.client, siteAddress: e.target.value },
                })
              }
              required
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Invoice Items</h3>
          <div className="flex gap-2 flex-wrap">
            {!loading && inventory.length > 0 && (
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    const selectedItem = inventory.find(i => i.id === e.target.value);
                    if (selectedItem) addItemFromInventory(selectedItem);
                    e.target.value = ""; // Reset
                  }
                }}
                className="border rounded px-3 py-2 text-sm flex-1 min-w-[200px]"
                defaultValue=""
              >
                <option value="">Select from Inventory...</option>
                {inventory.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.item_name} (Qty: {item.quantity}, Zone: {item.zone})
                  </option>
                ))}
              </select>
            )}
            <Button variant="outline" onClick={addManualItem} type="button">
              <Plus className="w-4 h-4 mr-2" />
              Add Manual Item
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {invoice.items.map((item, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg bg-gray-50 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Item {index + 1}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  type="button"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                <div className="md:col-span-2">
                  <Label className="text-xs">Description *</Label>
                  <Input
                    value={item.description}
                    onChange={(e) =>
                      updateItem(index, "description", e.target.value)
                    }
                    placeholder="Item description"
                    className="h-8 text-sm"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">HSN *</Label>
                  <Input
                    value={item.hsn}
                    onChange={(e) => updateItem(index, "hsn", e.target.value)}
                    placeholder="HSN Code"
                    className="h-8 text-sm"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">Qty *</Label>
                  <Input
                    type="number"
                    value={item.qty}
                    onChange={(e) =>
                      updateItem(index, "qty", parseFloat(e.target.value) || 0)
                    }
                    className="h-8 text-sm"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">Unit *</Label>
                  <Input
                    value={item.unit}
                    onChange={(e) => updateItem(index, "unit", e.target.value)}
                    placeholder="Unit"
                    className="h-8 text-sm"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">Rate *</Label>
                  <Input
                    type="number"
                    value={item.rate}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "rate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="h-8 text-sm"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">GST % *</Label>
                  <Input
                    type="number"
                    value={item.taxPercent}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "taxPercent",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="h-8 text-sm"
                    required
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Amount: ₹
                {(item.qty * item.rate).toLocaleString()} | GST: ₹
                {((item.qty * item.rate * item.taxPercent) / 100).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {invoice.items.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No items added. Add items from inventory or manually.
          </p>
        )}
      </div>

      {/* Generate Button */}
      <div className="border-t pt-4">
        <Button
          onClick={() => {
            // Validate before generating
            if (!invoice.company.name || !invoice.company.gstin || !invoice.company.address || !invoice.company.phone) {
              alert("Please fill in all company details");
              return;
            }
            if (!invoice.client.name || !invoice.client.address || !invoice.client.projectName || !invoice.client.siteAddress) {
              alert("Please fill in all client details");
              return;
            }
            if (invoice.items.length === 0) {
              alert("Please add at least one item");
              return;
            }
            if (invoice.items.some(item => !item.description || !item.hsn || item.qty <= 0 || item.rate <= 0)) {
              alert("Please fill in all item details correctly");
              return;
            }
            onGenerate(invoice);
          }}
          disabled={
            !invoice.company.name ||
            !invoice.client.name ||
            invoice.items.length === 0
          }
          className="w-full bg-green-600 hover:bg-green-700"
        >
          Generate Invoice
        </Button>
      </div>
    </Card>
  );
}

"use client"

import { Sidebar } from "@/components/manager/sidebar"
import { Header } from "@/components/manager/header"
import { GSTInvoiceGenerator } from "@/components/manager/gst-invoice-generator"

export default function GSTInvoicingPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="flex-1 p-3 md:p-4 lg:p-5 lg:ml-64">
        <Header
          title="GST Invoicing"
          description="Generate and manage GST invoices for your projects."
        />

        <div className="mt-4 md:mt-5">
          <GSTInvoiceGenerator />
        </div>
      </main>
    </div>
  )
}

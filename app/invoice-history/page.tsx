import InvoiceHistory from '@/components/InvoiceHistory'

export default function InvoiceHistoryPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Invoice Management</h1>
        <p className="text-gray-600 mt-2">
          View and manage all generated invoices with detailed metadata
        </p>
      </div>
      
      <InvoiceHistory />
    </div>
  )
}
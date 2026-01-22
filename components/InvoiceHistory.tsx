'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, Calendar, Building, User, DollarSign, Package } from 'lucide-react'

interface InvoiceFile {
  id: string
  name: string
  size: number
  created_at: string
  updated_at: string
  metadata: {
    invoiceNo?: string
    invoiceDate?: string
    dueDate?: string
    companyName?: string
    clientName?: string
    projectName?: string
    subtotal?: string
    totalTax?: string
    grandTotal?: string
    itemCount?: string
    timeCreated?: string
    createdBy?: string
  }
  publicUrl: string
}

interface ApiResponse {
  invoices: InvoiceFile[]
  error?: string
  setupRequired?: boolean
}

interface InvoiceHistoryProps {
  className?: string
}

export default function InvoiceHistory({ className }: InvoiceHistoryProps) {
  const [invoices, setInvoices] = useState<InvoiceFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [setupRequired, setSetupRequired] = useState(false)

  useEffect(() => {
    fetchInvoiceHistory()
  }, [])

  const fetchInvoiceHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/invoices/history')
      
      if (!response.ok) {
        throw new Error('Failed to fetch invoice history')
      }

      const data: ApiResponse = await response.json()
      
      // Filter out folders and non-PDF files
      const pdfInvoices = (data.invoices || []).filter(invoice => 
        invoice.name.endsWith('.pdf') && 
        invoice.id !== null && 
        invoice.size > 0
      )
      
      setInvoices(pdfInvoices)
      setSetupRequired(data.setupRequired || false)
      
      if (data.error) {
        setError(data.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching invoice history:', err)
    } finally {
      setLoading(false)
    }
  }

  const extractInvoiceNoFromFilename = (filename: string) => {
    // Extract invoice number from filename like "invoice-INV-2026-00125-timestamp.pdf"
    const match = filename.match(/invoice-(.+?)-\d{4}-\d{2}-\d{2}T/)
    return match ? match[1] : filename.replace('.pdf', '')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatCurrency = (amount: string | undefined) => {
    if (!amount) return 'N/A'
    const num = parseFloat(amount)
    return '₹' + num.toLocaleString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const downloadInvoice = async (invoice: InvoiceFile) => {
    try {
      const response = await fetch(invoice.publicUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = invoice.name
      document.body.appendChild(link)
      link.click()
      
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading invoice:', err)
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice History
          </CardTitle>
          <CardDescription>Loading invoice history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || setupRequired) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <FileText className="h-5 w-5" />
            Invoice History - Setup Required
          </CardTitle>
          <CardDescription>Supabase Storage configuration needed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-4">
              <h3 className="font-semibold text-orange-800 mb-2">Setup Required</h3>
              <p className="text-orange-700 mb-4">{error || 'Supabase Storage is not configured'}</p>
              
              <div className="text-left bg-white rounded border p-4 text-sm">
                <h4 className="font-semibold mb-2">To enable invoice history:</h4>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Go to your Supabase project dashboard</li>
                  <li>Navigate to Settings → API</li>
                  <li>Copy your <code className="bg-gray-100 px-1 rounded">service_role</code> key</li>
                  <li>Update <code className="bg-gray-100 px-1 rounded">.env.local</code> with the key</li>
                  <li>Create an "invoices" bucket in Storage</li>
                  <li>Restart your development server</li>
                </ol>
              </div>
            </div>
            
            <Button onClick={fetchInvoiceHistory} variant="outline">
              Check Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Invoice History
        </CardTitle>
        <CardDescription>
          {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} found
        </CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No invoices found</p>
            <Button onClick={fetchInvoiceHistory} variant="outline">
              Refresh
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Invoices</p>
                      <p className="text-2xl font-bold">{invoices.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Value</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(
                          invoices
                            .reduce((sum, inv) => sum + (parseFloat(inv.metadata.grandTotal || '0')), 0)
                            .toString()
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Avg Items</p>
                      <p className="text-2xl font-bold">
                        {invoices.length > 0 
                          ? Math.round(invoices.reduce((sum, inv) => sum + parseInt(inv.metadata.itemCount || '0'), 0) / invoices.length)
                          : 0
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Invoice Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice Details</TableHead>
                    <TableHead>Client & Project</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">
                              {invoice.metadata.invoiceNo || extractInvoiceNoFromFilename(invoice.name)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-3 w-3" />
                            <span>{invoice.metadata.invoiceDate || 'N/A'}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {formatFileSize(invoice.size)}
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-sm">
                              {invoice.metadata.clientName || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building className="h-3 w-3" />
                            <span className="truncate max-w-[200px]">
                              {invoice.metadata.projectName || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-green-600">
                            {formatCurrency(invoice.metadata.grandTotal)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {invoice.metadata.itemCount || '0'} items
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(invoice.created_at)}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadInvoice(invoice)}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
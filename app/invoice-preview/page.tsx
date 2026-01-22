'use client'

import { InvoiceData } from "@/types/invoice"
import { useEffect, useState } from "react"

export default function InvoicePreviewPage() {
    const [invoiceHTML, setInvoiceHTML] = useState<string>('')
    const [loading, setLoading] = useState(true)

    const invoiceData: InvoiceData = {
        invoiceNo: "INV-2026-00125",
        invoiceDate: "2026-01-22",
        dueDate: "2026-02-05",

        company: {
            name: "BuildRight Constructions Pvt. Ltd.",
            gstin: "27AABCU9603R1ZV",
            address: "3rd Floor, Tech Park, Andheri East, Mumbai, Maharashtra - 400069",
            phone: "+91 98765 43210"
        },

        client: {
            name: "Sharma Infrastructure Group",
            gstin: "29AACCS1234F1ZP",
            address: "Plot No. 18, Industrial Area Phase 2, Whitefield, Bengaluru, Karnataka - 560066",
            projectName: "Orchid Heights Residential Tower",
            siteAddress: "Survey No. 102, Sarjapur Road, Bengaluru, Karnataka - 562125"
        },

        items: [
            {
                description: "M25 Grade Ready-Mix Concrete Supply",
                hsn: "3824",
                qty: 50,
                unit: "Cubic Meter",
                rate: 5200,
                taxPercent: 18
            },
            {
                description: "TMT Steel Bars (Fe 500D)",
                hsn: "7214",
                qty: 4.5,
                unit: "Metric Ton",
                rate: 58500,
                taxPercent: 18
            },
            {
                description: "Skilled Labor Charges - Structural Work",
                hsn: "9954",
                qty: 120,
                unit: "Man Days",
                rate: 900,
                taxPercent: 18
            },
            {
                description: "Crane Rental - 25 Ton (Weekly)",
                hsn: "9966",
                qty: 1,
                unit: "Week",
                rate: 45000,
                taxPercent: 18
            }
        ]
    }

    async function loadInvoicePreview() {
        try {
            const res = await fetch("/api/invoice/preview", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(invoiceData)
            })

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`)
            }

            const html = await res.text()
            setInvoiceHTML(html)
        } catch (error) {
            console.error('Error loading invoice preview:', error)
        } finally {
            setLoading(false)
        }
    }

    async function downloadPDF() {
        try {
            const res = await fetch("/api/invoice", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(invoiceData)
            })

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`)
            }

            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            
            const link = document.createElement('a')
            link.href = url
            link.download = `invoice-${invoiceData.invoiceNo}.pdf`
            document.body.appendChild(link)
            link.click()
            
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Error generating PDF:', error)
        }
    }

    useEffect(() => {
        loadInvoicePreview()
    }, [])

    if (loading) {
        return (
            <div className="p-8">
                <div className="text-center">Loading invoice preview...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Fixed header with download button */}
            <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-10 p-4">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold">Invoice Preview</h1>
                    <button 
                        onClick={downloadPDF}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Invoice content */}
            <div className="pt-20 pb-8">
                <div className="max-w-4xl mx-auto bg-white shadow-lg">
                    <div 
                        dangerouslySetInnerHTML={{ __html: invoiceHTML }}
                        className="invoice-content"
                    />
                </div>
            </div>
        </div>
    )
}
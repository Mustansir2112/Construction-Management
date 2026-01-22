'use client'

import { InvoiceData } from "@/types/invoice"

export default function TestPDFPage() {
    const invoiceData: InvoiceData = {
        invoiceNo: "TEST-001",
        invoiceDate: "2026-01-22",
        dueDate: "2026-02-05",

        company: {
            name: "Test Company",
            gstin: "27AABCU9603R1ZV",
            address: "Test Address",
            phone: "+91 98765 43210"
        },

        client: {
            name: "Test Client",
            address: "Client Address",
            projectName: "Test Project",
            siteAddress: "Site Address"
        },

        items: [{
            description: "Test Item",
            hsn: "1234",
            qty: 1,
            unit: "Piece",
            rate: 100,
            taxPercent: 18
        }]
    }

    async function downloadPDF() {
        console.log('Generating PDF...');
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
            
            // Create a temporary download link
            const link = document.createElement('a')
            link.href = url
            link.download = `invoice-${invoiceData.invoiceNo}.pdf`
            document.body.appendChild(link)
            link.click()
            
            // Clean up
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
            
            console.log('PDF downloaded successfully')
        } catch (error) {
            console.error('Error generating PDF:', error)
        }
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">PDF Download Test</h1>
            
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Test Invoice Generation</h2>
                <p className="text-gray-600 mb-4">
                    Click the button below to test PDF download functionality.
                </p>
                
                <button 
                    onClick={downloadPDF}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                    Download Test PDF
                </button>
            </div>
        </div>
    )
}
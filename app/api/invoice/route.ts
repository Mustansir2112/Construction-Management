import puppeteer from "puppeteer"
import { fetchGSTDetails } from "@/lib/gst"
import { generateInvoiceHTML } from "@/lib/invoiceTemplate"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Optional Supabase storage - only use if properly configured
let supabase: any = null
try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your_supabase_service_role_key_here') {
    // const { createClient } = require('@supabase/supabase-js')
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  }
} catch (error) {
  console.log('Supabase storage not configured, PDFs will not be stored')
}

export async function POST(req: Request) {
  const invoiceData = await req.json()

  const gstInfo = await fetchGSTDetails(
    invoiceData.client.gstin || invoiceData.company.gstin
  )

  const html = generateInvoiceHTML(invoiceData, gstInfo)

  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.setContent(html, { waitUntil: "networkidle0" })

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true
  })

  await browser.close()

  // Calculate totals for metadata
  let subtotal = 0
  let totalTax = 0
  invoiceData.items.forEach((item: any) => {
    const amount = item.qty * item.rate
    const tax = (amount * item.taxPercent) / 100
    subtotal += amount
    totalTax += tax
  })
  const grandTotal = subtotal + totalTax

  // Create filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `invoice-${invoiceData.invoiceNo}-${timestamp}.pdf`

  // Upload to Supabase storage with metadata (if configured)
  if (supabase) {
    try {
      const { data, error } = await supabase.storage
        .from('Invoices')  // Use capital I to match your bucket name
        .upload(filename, pdfBuffer, {
          contentType: 'application/pdf',
          metadata: {
            invoiceNo: invoiceData.invoiceNo,
            invoiceDate: invoiceData.invoiceDate,
            dueDate: invoiceData.dueDate,
            companyName: invoiceData.company.name,
            clientName: invoiceData.client.name,
            projectName: invoiceData.client.projectName,
            subtotal: subtotal.toString(),
            totalTax: totalTax.toString(),
            grandTotal: grandTotal.toString(),
            itemCount: invoiceData.items.length.toString(),
            timeCreated: new Date().toISOString(),
            createdBy: 'system' // You can modify this to include user info
          }
        })

      if (error) {
        console.error('Error uploading to Supabase:', error)
      } else {
        console.log('PDF uploaded to Supabase:', data.path)
      }
    } catch (uploadError) {
      console.error('Upload error:', uploadError)
    }
  } else {
    console.log('Supabase storage not configured - PDF generated but not stored')
  }

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${filename}`
    }
  })
}

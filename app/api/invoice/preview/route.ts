import { fetchGSTDetails } from "@/lib/gst"
import { generateInvoiceHTML } from "@/lib/invoiceTemplate"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const invoiceData = await req.json()

  const gstInfo = await fetchGSTDetails(
    invoiceData.client.gstin || invoiceData.company.gstin
  )

  const html = generateInvoiceHTML(invoiceData, gstInfo)

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html"
    }
  })
}
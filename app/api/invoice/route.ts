import puppeteer from "puppeteer";
import { generateInvoiceHTML } from "@/lib/invoiceTemplate";
import { NextResponse } from "next/server";
import { fetchGSTDetails } from "@/lib/gst";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  const invoiceData = await req.json();

  const gstInfo = await fetchGSTDetails(
    invoiceData.client.gstin || invoiceData.company.gstin,
  );

  const html = generateInvoiceHTML(invoiceData, gstInfo);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  // Calculate totals for metadata
  let subtotal = 0;
  let totalTax = 0;
  invoiceData.items.forEach((item: any) => {
    const amount = item.qty * item.rate;
    const tax = (amount * item.taxPercent) / 100;
    subtotal += amount;
    totalTax += tax;
  });
  const grandTotal = subtotal + totalTax;

  // Create filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `invoice-${invoiceData.invoiceNo}-${timestamp}.pdf`;

  // Upload to Supabase storage with metadata (if configured)
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from("Invoices") // Use capital I to match your bucket name
        .upload(filename, pdfBuffer, {
          contentType: "application/pdf",
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
            createdBy: "system", // You can modify this to include user info
          },
        });

      if (error) {
        console.error("Error uploading to Supabase:", error);
      } else {
        console.log("PDF uploaded to Supabase:", data.path);
      }
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
    }
  } else {
    console.log(
      "Supabase storage not configured - PDF generated but not stored",
    );
  }

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${filename}`,
    },
  });
}

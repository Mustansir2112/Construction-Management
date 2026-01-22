import puppeteer from "puppeteer";
import { generateInvoiceHTML } from "@/lib/invoiceTemplate";
import { NextResponse } from "next/server";
import { fetchGSTDetails } from "@/lib/gst";
import { createClient } from "@supabase/supabase-js";

// Parse invoice date format "15 Sep 2024" to ISO date
function parseInvoiceDate(dateStr: string): string {
  try {
    // Try parsing as-is first (if already ISO)
    const isoDate = new Date(dateStr);
    if (!isNaN(isoDate.getTime())) {
      return isoDate.toISOString().split("T")[0];
    }
    
    // Parse "15 Sep 2024" format
    const months: { [key: string]: number } = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    
    const parts = dateStr.trim().split(" ");
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = months[parts[1].toLowerCase()];
      const year = parseInt(parts[2]);
      if (!isNaN(day) && month !== undefined && !isNaN(year)) {
        const date = new Date(year, month, day);
        return date.toISOString().split("T")[0];
      }
    }
    
    // Fallback: try direct Date parse
    return new Date(dateStr).toISOString().split("T")[0];
  } catch {
    // Ultimate fallback
    return new Date().toISOString().split("T")[0];
  }
}

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
  const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
    : null;

  // Get current user for created_by
  let userId: string | null = null;
  try {
    const { createClient } = await import("@/lib/supabase-server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id || null;
  } catch (err) {
    console.error("Error getting user:", err);
  }

  if (supabaseAdmin) {
    try {
      // Upload PDF to storage
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from("Invoices")
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
            createdBy: userId || "system",
          },
        });

      if (uploadError) {
        console.error("Error uploading to Supabase:", uploadError);
      } else {
        console.log("PDF uploaded to Supabase:", uploadData.path);
        
        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
          .from("Invoices")
          .getPublicUrl(filename);

        // Store metadata in database
        try {
          const { error: dbError } = await supabaseAdmin
            .from("invoices")
            .insert({
              invoice_no: invoiceData.invoiceNo,
              invoice_date: parseInvoiceDate(invoiceData.invoiceDate),
              due_date: parseInvoiceDate(invoiceData.dueDate),
              company_name: invoiceData.company.name,
              company_gstin: invoiceData.company.gstin,
              company_address: invoiceData.company.address,
              company_phone: invoiceData.company.phone,
              client_name: invoiceData.client.name,
              client_gstin: invoiceData.client.gstin || null,
              client_address: invoiceData.client.address,
              project_name: invoiceData.client.projectName,
              site_address: invoiceData.client.siteAddress,
              subtotal: subtotal,
              total_tax: totalTax,
              grand_total: grandTotal,
              item_count: invoiceData.items.length,
              pdf_path: uploadData.path,
              pdf_url: urlData.publicUrl,
              created_by: userId,
            });

          if (dbError) {
            console.error("Error storing invoice metadata:", dbError);
          }
        } catch (dbErr) {
          console.error("Error storing invoice metadata:", dbErr);
        }
      }
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
    }
  } else {
    console.log(
      "Supabase storage not configured - PDF generated but not stored",
    );
  }

  return new NextResponse(pdfBuffer as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${filename}`,
    },
  });
}

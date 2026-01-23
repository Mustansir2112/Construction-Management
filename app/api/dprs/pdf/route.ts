import puppeteer from "puppeteer";
import { generateDPRHTML } from "@/lib/dprTemplate";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const dprData = await req.json();
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch project name if project_id is provided
    let projectName: string | null = null;
    if (dprData.project_id) {
      const { data: project } = await supabase
        .from("projects")
        .select("name")
        .eq("id", dprData.project_id)
        .single();
      
      if (project) {
        projectName = project.name;
      }
    }

    // Fetch user name for created_by
    let createdByName: string | null = null;
    if (dprData.created_by) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", dprData.created_by)
        .single();
      
      if (profile && profile.full_name) {
        createdByName = profile.full_name;
      }
    }

    // Prepare DPR data for template
    const templateData = {
      date: dprData.date,
      work_done: dprData.work_done || "",
      labor_count: dprData.labor_count || 0,
      materials_used: dprData.materials_used || null,
      issues: dprData.issues || null,
      project_name: projectName,
      created_by_name: createdByName,
    };

    const html = generateDPRHTML(templateData);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "15mm",
        bottom: "20mm",
        left: "15mm",
      },
    });

    await browser.close();

    // Create filename with timestamp
    const dateStr = dprData.date.replace(/-/g, "");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `DPR-${dateStr}-${timestamp}.pdf`;

    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating DPR PDF:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

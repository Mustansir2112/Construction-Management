import { NextResponse } from "next/server"

// Optional Supabase storage - only use if properly configured
let supabase: any = null
try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your_supabase_service_role_key_here') {
    const { createClient } = require('@supabase/supabase-js')
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  }
} catch (error) {
  console.log('Supabase storage not configured')
}

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ 
      error: 'Supabase storage not configured. Please set up your service role key and create the invoices bucket.',
      invoices: [],
      setupRequired: true
    }, { status: 200 })
  }

  try {
    const { data, error } = await supabase.storage
      .from('Invoices')
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (error) {
      console.error('Error fetching invoices:', error)
      return NextResponse.json({ 
        error: `Failed to fetch invoices: ${error.message}. Make sure the "Invoices" bucket exists in Supabase Storage.`,
        invoices: [],
        setupRequired: true
      }, { status: 200 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ invoices: [] })
    }

    // Get detailed info including metadata for each file
    const invoicesWithMetadata = await Promise.all(
      data.map(async (file: any) => {
        try {
          const { data: fileData, error: fileError } = await supabase.storage
            .from('Invoices')  // Use same bucket name consistently
            .getPublicUrl(file.name)

          if (fileError) {
            console.error('Error getting public URL for', file.name, ':', fileError)
            return null
          }

          return {
            id: file.id,
            name: file.name,
            size: file.metadata?.size || 0,
            created_at: file.created_at,
            updated_at: file.updated_at,
            metadata: file.metadata || {},
            publicUrl: fileData.publicUrl
          }
        } catch (err) {
          console.error('Error processing file', file.name, ':', err)
          return null
        }
      })
    )

    // Filter out null entries
    const validInvoices = invoicesWithMetadata.filter(invoice => invoice !== null)

    return NextResponse.json({ invoices: validInvoices })
  } catch (error) {
    console.error('Error in invoice history API:', error)
    return NextResponse.json({ 
      error: `Internal server error: ${error?.message}. Please check your Supabase configuration.`,
      invoices: [],
      setupRequired: true
    }, { status: 200 })
  }
}
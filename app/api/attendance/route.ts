import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const workerId = searchParams.get("worker_id");
  const type = searchParams.get("type"); // 'requests' or 'daily'

  try {
    if (type === "requests") {
      // Get attendance requests
      let query = supabase
        .from("attendance_requests")
        .select("*")
        .order("request_time", { ascending: false });

      if (date) {
        query = query.eq("request_date", date);
      }

      const { data, error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data || []);
    } else if (type === "daily") {
      // Get daily attendance
      let query = supabase
        .from("daily_attendance")
        .select("*")
        .order("attendance_date", { ascending: false });

      if (date) {
        query = query.eq("attendance_date", date);
      }

      const { data, error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data || []);
    } else {
      // Legacy attendance table for backward compatibility
      let query = supabase
        .from("attendance")
        .select("*")
        .order("date", { ascending: false });

      if (date) {
        query = query.eq("date", date);
      }

      if (workerId) {
        query = query.eq("w_id", workerId);
      }

      const { data, error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data || []);
    }
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const supabase = await createClient();
  
  try {
    const body = await req.json();
    const { action, ...data } = body;

    if (action === "create_request") {
      // Create attendance request
      const { worker_id, worker_name, worker_email, location_lat, location_lng, is_within_zone } = data;

      const { error } = await supabase
        .from("attendance_requests")
        .insert({
          worker_id,
          worker_name,
          worker_email,
          location_lat,
          location_lng,
          is_within_zone,
          status: 'pending'
        });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });

    } else if (action === "approve_request") {
      // Approve attendance request
      const { requestId, workerId, isWithinZone } = data;

      if (!isWithinZone) {
        return NextResponse.json(
          { error: "Cannot approve attendance - worker is not within the designated zone" },
          { status: 400 }
        );
      }

      // Get current user for approved_by
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Update request status
      const { error: updateError } = await supabase
        .from("attendance_requests")
        .update({
          status: "approved",
          approved_by: user.id,
          approved_at: new Date().toISOString()
        })
        .eq("id", requestId);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      // Add to daily attendance if not already present
      const today = new Date().toISOString().split('T')[0];
      
      // Check if daily attendance record exists for today
      const { data: existingAttendance } = await supabase
        .from("daily_attendance")
        .select("*")
        .eq("attendance_date", today)
        .single();

      if (existingAttendance) {
        // Update existing record
        const updatedWorkerIds = [...existingAttendance.present_worker_ids];
        if (!updatedWorkerIds.includes(workerId)) {
          updatedWorkerIds.push(workerId);
        }

        const { error: dailyUpdateError } = await supabase
          .from("daily_attendance")
          .update({
            present_worker_ids: updatedWorkerIds,
            total_workers_present: updatedWorkerIds.length
          })
          .eq("attendance_date", today);

        if (dailyUpdateError) {
          console.error("Error updating daily attendance:", dailyUpdateError);
        }
      } else {
        // Create new daily attendance record
        const { error: dailyInsertError } = await supabase
          .from("daily_attendance")
          .insert({
            attendance_date: today,
            present_worker_ids: [workerId],
            total_workers_present: 1,
            marked_by: user.id
          });

        if (dailyInsertError) {
          console.error("Error creating daily attendance:", dailyInsertError);
        }
      }

      return NextResponse.json({ success: true });

    } else if (action === "reject_request") {
      // Reject attendance request
      const { requestId } = data;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { error } = await supabase
        .from("attendance_requests")
        .update({
          status: "rejected",
          approved_by: user.id,
          approved_at: new Date().toISOString()
        })
        .eq("id", requestId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });

    } else if (action === "save_manual_attendance") {
      // Save manual attendance
      const { presentWorkerIds, date } = data;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const attendanceDate = date || new Date().toISOString().split('T')[0];

      // Upsert daily attendance record
      const { error } = await supabase
        .from("daily_attendance")
        .upsert({
          attendance_date: attendanceDate,
          present_worker_ids: presentWorkerIds,
          total_workers_present: presentWorkerIds.length,
          marked_by: user.id
        }, {
          onConflict: "attendance_date"
        });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });

    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

  } catch (error) {
    console.error("Error processing attendance request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

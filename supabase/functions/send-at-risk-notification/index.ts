import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

interface AtRiskNotificationRequest {
  studentId: string;
  customMessage?: string;
}

const MAX_MESSAGE_LENGTH = 1000;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = claimsData.claims.sub;

    const { studentId, customMessage }: AtRiskNotificationRequest = await req.json();

    // Validate inputs
    if (!studentId) {
      return new Response(
        JSON.stringify({ error: "Student ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (customMessage && customMessage.length > MAX_MESSAGE_LENGTH) {
      return new Response(
        JSON.stringify({ error: "Custom message too long" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify student belongs to authenticated teacher (RLS handles this)
    const { data: student, error: studentError } = await supabaseClient
      .from("students")
      .select("id, name, email, grade, attendance")
      .eq("id", studentId)
      .eq("teacher_id", userId)
      .single();

    if (studentError || !student) {
      return new Response(
        JSON.stringify({ error: "Student not found or unauthorized" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get teacher name from profile
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("full_name")
      .eq("user_id", userId)
      .single();

    const teacherName = escapeHtml(profile?.full_name || "Your Teacher");
    const studentName = escapeHtml(student.name);
    const grade = Number(student.grade);
    const attendance = Number(student.attendance);
    const sanitizedMessage = customMessage ? escapeHtml(customMessage.trim()) : null;

    console.log(`Sending at-risk notification to ${student.email} for student ${student.name}`);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Academic Performance Alert</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Academic Performance Alert</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear Parent/Guardian of <strong>${studentName}</strong>,</p>
            
            <p style="font-size: 15px; margin-bottom: 20px;">
              We are reaching out to inform you that ${studentName} has been identified as needing additional academic support.
            </p>
            
            <div style="background: #fff3f3; border-left: 4px solid #ef4444; padding: 15px 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin: 0 0 10px 0; color: #dc2626; font-size: 16px;">Current Performance Metrics</h3>
              <p style="margin: 5px 0;"><strong>Current Grade:</strong> ${grade}%</p>
              <p style="margin: 5px 0;"><strong>Attendance Rate:</strong> ${attendance}%</p>
            </div>
            
            ${sanitizedMessage ? `
            <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">Message from ${teacherName}</h3>
              <p style="margin: 0;">${sanitizedMessage}</p>
            </div>
            ` : ''}
            
            <h3 style="color: #1e40af; margin-top: 25px; font-size: 16px;">Recommended Actions</h3>
            <ul style="padding-left: 20px;">
              ${attendance < 80 ? '<li style="margin-bottom: 8px;">Improve attendance by attending all scheduled classes</li>' : ''}
              ${grade < 70 ? '<li style="margin-bottom: 8px;">Schedule tutoring sessions or seek additional help from teachers</li>' : ''}
              <li style="margin-bottom: 8px;">Review and complete all pending assignments</li>
              <li style="margin-bottom: 8px;">Establish a consistent study routine at home</li>
              <li style="margin-bottom: 8px;">Contact the teacher to discuss a personalized improvement plan</li>
            </ul>
            
            <p style="font-size: 15px; margin-top: 25px;">
              We believe that with proper support and intervention, ${studentName} can improve their academic performance.
            </p>
            
            <p style="font-size: 15px; margin-top: 20px;">
              Best regards,<br>
              <strong>${teacherName}</strong><br>
              <span style="color: #666;">EduPredict - AI-Powered Student Analytics</span>
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
            <p>This is an automated notification from the Student Performance Prediction System.</p>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "EduPredict <onboarding@resend.dev>",
      to: [student.email],
      subject: `Academic Performance Alert for ${student.name}`,
      html: emailHtml,
    });

    console.log("Resend response:", JSON.stringify(emailResponse));

    if (emailResponse.error) {
      console.error("Resend error:", emailResponse.error);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending at-risk notification:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

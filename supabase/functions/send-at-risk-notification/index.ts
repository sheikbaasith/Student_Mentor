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

const MAX_MESSAGE_LENGTH = 1000;

interface AtRiskNotificationRequest {
  studentId: string;
  customMessage?: string;
}

const normalizePhoneNumber = (rawPhone: string) => {
  const trimmed = rawPhone.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) return trimmed;

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
};

async function sendTwilioSms(to: string, body: string): Promise<boolean> {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

  if (!accountSid || !authToken || !fromNumber) {
    console.warn("Twilio credentials not configured, skipping SMS");
    return false;
  }

  const phone = normalizePhoneNumber(to);
  if (!phone) return false;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const auth = btoa(`${accountSid}:${authToken}`);
  const params = new URLSearchParams({
    To: phone,
    From: fromNumber,
    Body: body,
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Twilio SMS failed [${response.status}]: ${errorText}`);
    return false;
  }

  return true;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const token = authHeader.replace("Bearer ", "");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: authData, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const userId = authData.user.id;

    const { studentId, customMessage }: AtRiskNotificationRequest = await req.json();

    if (!studentId) {
      return new Response(JSON.stringify({ error: "Student ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (customMessage && customMessage.length > MAX_MESSAGE_LENGTH) {
      return new Response(JSON.stringify({ error: "Custom message too long" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: student, error: studentError } = await supabaseClient
      .from("students")
      .select("id, name, email, phone, grade, attendance, prediction, course_id")
      .eq("id", studentId)
      .eq("teacher_id", userId)
      .single();

    if (studentError || !student) {
      return new Response(JSON.stringify({ error: "Student not found or unauthorized" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let courseName = "Not Assigned";
    if (student.course_id) {
      const { data: course } = await supabaseClient.from("courses").select("name").eq("id", student.course_id).single();
      if (course?.name) courseName = course.name;
    }

    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("full_name")
      .eq("user_id", userId)
      .single();

    const teacherName = escapeHtml(profile?.full_name || "Your Teacher");
    const studentName = escapeHtml(student.name);
    const grade = Number(student.grade);
    const attendance = Number(student.attendance);
    const prediction = student.prediction || "at-risk";
    const sanitizedMessage = customMessage ? escapeHtml(customMessage.trim()) : null;
    const safeCourseName = escapeHtml(courseName);

    const suggestions: string[] = [];
    if (attendance < 80) suggestions.push("Attend classes regularly and be punctual.");
    if (grade < 70) suggestions.push("Schedule extra study sessions and ask for guidance.");
    suggestions.push("Complete pending assignments on time.");
    suggestions.push("Follow a daily study plan and revise consistently.");
    suggestions.push("Meet your teacher to discuss an improvement strategy.");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Academic Alert - EduTrack</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">EduTrack - Academic Performance Alert</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <p>Dear <strong>${studentName}</strong>,</p>
            <p>We are reaching out with support because your current performance is below expected level and you are currently marked at risk in the AI prediction system.</p>
            <div style="background: #fff3f3; border-left: 4px solid #ef4444; padding: 15px 20px; margin: 20px 0; border-radius: 4px;">
              <p><strong>Student Name:</strong> ${studentName}</p>
              <p><strong>Course Name:</strong> ${safeCourseName}</p>
              <p><strong>Current Grade:</strong> ${grade}%</p>
              <p><strong>Risk Status:</strong> ${prediction.toUpperCase()}</p>
            </div>
            ${sanitizedMessage ? `
              <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px 20px; margin: 20px 0; border-radius: 4px;">
                <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">Message from ${teacherName}</h3>
                <p style="margin: 0;">${sanitizedMessage}</p>
              </div>
            ` : ""}
            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin: 0 0 10px 0; color: #15803d; font-size: 16px;">Suggestions to Improve Performance</h3>
              <ul style="padding-left: 20px; margin: 0;">
                ${suggestions.map((s) => `<li style="margin-bottom: 8px;">${s}</li>`).join("")}
              </ul>
            </div>
            <p>We believe in your potential and encourage you to take this as a positive step toward improvement.</p>
            <p>Best regards,<br><strong>${teacherName}</strong><br><span style="color: #666;">EduTrack</span></p>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "EduTrack <onboarding@resend.dev>",
      to: [student.email],
      subject: `Academic Performance Alert for ${student.name}`,
      html: emailHtml,
    });

    if (emailResponse.error) {
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let smsSent = false;
    if (student.phone) {
      const smsBody = [
        `Hi ${student.name},`,
        `You are marked at risk in EduTrack.`,
        `Course: ${courseName}`,
        `Grade: ${grade}%`,
        `Risk Status: ${prediction.toUpperCase()}`,
        `Suggestion: Improve attendance, complete assignments, and follow a daily study routine.`,
        `${sanitizedMessage ? `Teacher message: ${customMessage?.trim()}` : ""}`,
      ].filter(Boolean).join("\n");

      smsSent = await sendTwilioSms(student.phone, smsBody);
    }

    const channels = ["email", ...(smsSent ? ["sms"] : [])];

    await (supabaseClient as any).from("notification_history").insert({
      teacher_id: userId,
      student_id: student.id,
      student_name: student.name,
      course_name: courseName,
      current_grade: grade,
      risk_status: prediction,
      channels,
      email_sent: true,
      sms_sent: smsSent,
      custom_message: customMessage?.trim() || null,
      sent_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ success: true, emailSent: true, smsSent }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending at-risk notification:", error);
    return new Response(JSON.stringify({ error: error?.message || "An unexpected error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);

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

async function sendTwilioSms(to: string, body: string): Promise<void> {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

  if (!accountSid || !authToken || !fromNumber) {
    console.warn("Twilio credentials not configured, skipping SMS");
    return;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const encoded = btoa(`${accountSid}:${authToken}`);

  const params = new URLSearchParams();
  params.append("To", to);
  params.append("From", fromNumber);
  params.append("Body", body);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${encoded}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error(`Twilio SMS failed [${response.status}]: ${errorData}`);
  } else {
    console.log("Twilio SMS sent successfully");
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Fetch student with course info
    const { data: student, error: studentError } = await supabaseClient
      .from("students")
      .select("id, name, email, phone, grade, attendance, prediction, confidence, course_id")
      .eq("id", studentId)
      .eq("teacher_id", userId)
      .single();

    if (studentError || !student) {
      return new Response(
        JSON.stringify({ error: "Student not found or unauthorized" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch course name if assigned
    let courseName = "Not Assigned";
    if (student.course_id) {
      const { data: course } = await supabaseClient
        .from("courses")
        .select("name")
        .eq("id", student.course_id)
        .single();
      if (course) courseName = course.name;
    }

    // Get teacher name
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

    console.log(`Sending at-risk notification to ${student.email} for student ${student.name}`);

    // Build suggestions based on performance
    const suggestions: string[] = [];
    if (attendance < 80) suggestions.push("Attend all scheduled classes regularly to improve attendance rate");
    if (grade < 70) suggestions.push("Schedule extra tutoring sessions and seek help from teachers");
    suggestions.push("Review and complete all pending assignments on time");
    suggestions.push("Create a consistent daily study routine at home");
    suggestions.push("Contact your teacher to discuss a personalized improvement plan");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Academic Performance Alert - EduTrack</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🎓 EduTrack - Academic Performance Alert</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${studentName}</strong>,</p>
            
            <p style="font-size: 15px; margin-bottom: 20px;">
              We hope this message finds you well. We are reaching out because our AI-powered academic tracking system has identified that your current performance needs attention. Please don't be discouraged — this is an opportunity to improve, and we're here to support you every step of the way.
            </p>
            
            <div style="background: #fff3f3; border-left: 4px solid #ef4444; padding: 15px 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin: 0 0 10px 0; color: #dc2626; font-size: 16px;">⚠️ Current Performance Summary</h3>
              <p style="margin: 5px 0;"><strong>Student Name:</strong> ${studentName}</p>
              <p style="margin: 5px 0;"><strong>Course:</strong> ${safeCourseName}</p>
              <p style="margin: 5px 0;"><strong>Current Grade:</strong> ${grade}%</p>
              <p style="margin: 5px 0;"><strong>Attendance Rate:</strong> ${attendance}%</p>
              <p style="margin: 5px 0;"><strong>Risk Status:</strong> <span style="color: #dc2626; font-weight: bold; text-transform: uppercase;">${prediction}</span></p>
            </div>
            
            ${sanitizedMessage ? `
            <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">💬 Message from ${teacherName}</h3>
              <p style="margin: 0;">${sanitizedMessage}</p>
            </div>
            ` : ''}
            
            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin: 0 0 10px 0; color: #15803d; font-size: 16px;">💡 Suggestions to Improve</h3>
              <ul style="padding-left: 20px; margin: 0;">
                ${suggestions.map(s => `<li style="margin-bottom: 8px;">${s}</li>`).join('')}
              </ul>
            </div>
            
            <p style="font-size: 15px; margin-top: 25px;">
              We believe in your potential and know that with the right effort and support, you can significantly improve your academic performance. Don't hesitate to reach out to your teacher for guidance.
            </p>
            
            <p style="font-size: 15px; margin-top: 20px;">
              Best regards,<br>
              <strong>${teacherName}</strong><br>
              <span style="color: #666;">EduTrack - AI-Powered Student Analytics</span>
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
            <p>This is an automated notification from the EduTrack Performance Prediction System.</p>
          </div>
        </body>
      </html>
    `;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "EduTrack <onboarding@resend.dev>",
      to: [student.email],
      subject: `Academic Performance Alert for ${student.name} - ${courseName}`,
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

    // Send SMS if phone number available
    let smsSent = false;
    if (student.phone) {
      const smsBody = `Hi ${student.name}, this is an academic alert from EduTrack.\n\n` +
        `Course: ${courseName}\n` +
        `Current Grade: ${grade}%\n` +
        `Attendance: ${attendance}%\n` +
        `Status: ${prediction.toUpperCase()}\n\n` +
        `Your current grade is below the expected level. Please focus on improving your attendance and study habits.\n\n` +
        `Contact your teacher ${profile?.full_name || ''} for a personalized improvement plan.\n\n` +
        `- EduTrack`;

      try {
        await sendTwilioSms(student.phone, smsBody);
        smsSent = true;
      } catch (smsError) {
        console.error("SMS sending failed:", smsError);
      }
    }

    return new Response(JSON.stringify({ success: true, emailSent: true, smsSent }), {
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

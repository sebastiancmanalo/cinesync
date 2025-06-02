import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { google } from "https://esm.sh/googleapis@126.0.1"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // Get the request body
    const { eventId, title, description, startTime, endTime } = await req.json()

    // Get the event from the database
    const { data: event, error: eventError } = await supabaseClient
      .from("watchlist_events")
      .select("*, owner:users!watchlist_events_owner_id_fkey(*)")
      .eq("id", eventId)
      .single()

    if (eventError) throw eventError

    // Get the user's Google Calendar credentials
    const { data: credentials, error: credentialsError } = await supabaseClient
      .from("user_google_credentials")
      .select("access_token, refresh_token")
      .eq("user_id", event.owner_id)
      .single()

    if (credentialsError) throw credentialsError

    // Initialize Google Calendar API
    const auth = new google.auth.OAuth2(
      Deno.env.get("GOOGLE_CLIENT_ID"),
      Deno.env.get("GOOGLE_CLIENT_SECRET"),
      Deno.env.get("GOOGLE_REDIRECT_URI")
    )

    auth.setCredentials({
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token,
    })

    const calendar = google.calendar({ version: "v3", auth })

    // Create the calendar event
    const calendarEvent = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: title,
        description,
        start: {
          dateTime: startTime,
          timeZone: "UTC",
        },
        end: {
          dateTime: endTime,
          timeZone: "UTC",
        },
        attendees: event.watchlist_members?.map((member: any) => ({
          email: member.user.email,
        })),
      },
    })

    // Update the event with the Google Calendar event ID
    const { error: updateError } = await supabaseClient
      .from("watchlist_events")
      .update({
        google_calendar_event_id: calendarEvent.data.id,
      })
      .eq("id", eventId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error) {
    console.error("Error creating calendar event:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    )
  }
})

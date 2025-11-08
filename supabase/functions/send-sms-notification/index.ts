import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SmsRequest {
  phoneNumber: string;
  message?: string;
  queueNumber: string;
  patientName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting SMS send process...");

    // Get SMS settings from database
    const { data: smsSettings, error: settingsError } = await supabase
      .from("settings")
      .select("key, value")
      .eq("category", "sms");

    if (settingsError) {
      console.error("Error fetching SMS settings:", settingsError);
      throw new Error("Failed to fetch SMS settings");
    }

    console.log("SMS Settings fetched:", smsSettings);

    // Parse settings
    const settings: Record<string, any> = {};
    smsSettings?.forEach((setting: any) => {
      try {
        // Parse JSON values, handle boolean strings
        if (setting.key === "enabled") {
          settings[setting.key] =
            setting.value === "true" || setting.value === true;
        } else if (
          typeof setting.value === "string" &&
          setting.value.startsWith('"')
        ) {
          settings[setting.key] = JSON.parse(setting.value);
        } else {
          settings[setting.key] = setting.value;
        }
      } catch (e) {
        console.warn(`Error parsing setting ${setting.key}:`, e);
        settings[setting.key] = setting.value;
      }
    });

    console.log("Parsed settings:", settings);

    // Check if SMS is enabled
    if (!settings.enabled) {
      console.log("SMS is disabled in settings");
      return new Response(
        JSON.stringify({
          success: false,
          error: "SMS notifications are disabled",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate required settings - now looking for api_key and secret
    if (!settings.api_key || !settings.secret) {
      console.error("SMS API key or secret not configured");
      return new Response(
        JSON.stringify({
          success: false,
          error: "SMS API key and secret not configured",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Construct Basic authorization header from api_key and secret
    const credentials = `${settings.api_key}:${settings.secret}`;
    const encodedCredentials = btoa(credentials);
    const authorizationHeader = `Basic ${encodedCredentials}`;

    console.log("API Key:", settings.api_key);
    console.log("Secret:", settings.secret);
    console.log("Authorization header constructed:", authorizationHeader);

    const { phoneNumber, message, queueNumber, patientName }: SmsRequest =
      await req.json();

    console.log(
      `Sending SMS to ${phoneNumber} for queue ${queueNumber} (${patientName})`
    );

    // Use message from request or generate from template
    let finalMessage = message;
    if (!finalMessage && settings.message_template) {
      // Simply replace {queueNumber} with the formatted queue number
      finalMessage = settings.message_template.replace(
        "{queueNumber}",
        queueNumber
      );
    }

    if (!finalMessage) {
      finalMessage = `ท่านกำลังจะได้รับบริการในคิวถัดไป คิวหมายเลข ${queueNumber}`;
    }

    console.log("Final message:", finalMessage);
    console.log("Phone number:", phoneNumber);

    // Prepare form data exactly like your working cURL
    const formData = new URLSearchParams();
    formData.append("msisdn", phoneNumber);
    formData.append("message", finalMessage);
    formData.append("sender", settings.sender_name || "SubdisTH");

    console.log("Form data:", Object.fromEntries(formData));

    const smsResponse = await fetch("https://api-v2.thaibulksms.com/sms", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/x-www-form-urlencoded",
        authorization: authorizationHeader,
      },
      body: formData,
    });

    console.log("SMS API response status:", smsResponse.status);

    const result = await smsResponse.json();

    console.log(`SMS result for ${queueNumber}:`, result);

    if (!smsResponse.ok) {
      console.error("SMS API error:", result);
      return new Response(
        JSON.stringify({
          success: false,
          error: `SMS API returned ${smsResponse.status}: ${JSON.stringify(
            result
          )}`,
          result,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        result,
        phoneNumber,
        queueNumber,
        message: finalMessage,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error sending SMS:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);


import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting appointment reminder SMS process...');

    // Get SMS settings from database
    const { data: smsSettings, error: settingsError } = await supabase
      .from('settings')
      .select('key, value')
      .eq('category', 'sms');

    if (settingsError) {
      console.error('Error fetching SMS settings:', settingsError);
      throw new Error('Failed to fetch SMS settings');
    }

    console.log('SMS Settings fetched:', smsSettings);

    // Parse settings
    const settings: Record<string, any> = {};
    smsSettings?.forEach((setting: any) => {
      try {
        if (setting.key === 'enabled' || setting.key === 'appointment_reminders_enabled') {
          settings[setting.key] = setting.value === 'true' || setting.value === true;
        } else if (typeof setting.value === 'string' && setting.value.startsWith('"')) {
          settings[setting.key] = JSON.parse(setting.value);
        } else {
          settings[setting.key] = setting.value;
        }
      } catch (e) {
        console.warn(`Error parsing setting ${setting.key}:`, e);
        settings[setting.key] = setting.value;
      }
    });

    console.log('Parsed settings:', settings);

    // Check if SMS and appointment reminders are enabled
    if (!settings.enabled || !settings.appointment_reminders_enabled) {
      console.log('SMS or appointment reminders are disabled');
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'SMS or appointment reminders are disabled',
        sent: 0
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Validate required settings
    if (!settings.api_key || !settings.secret) {
      console.error('SMS API key or secret not configured');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'SMS API key and secret not configured' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    console.log('Looking for appointments on:', tomorrowStr);

    // Fetch appointments for tomorrow
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        id,
        date,
        purpose,
        patients (
          id,
          name,
          phone
        )
      `)
      .eq('status', 'SCHEDULED')
      .gte('date', `${tomorrowStr}T00:00:00.000Z`)
      .lt('date', `${tomorrowStr}T23:59:59.999Z`);

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError);
      throw new Error('Failed to fetch appointments');
    }

    console.log(`Found ${appointments?.length || 0} appointments for tomorrow`);

    if (!appointments || appointments.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No appointments found for tomorrow',
        sent: 0
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Construct Basic authorization header
    const credentials = `${settings.api_key}:${settings.secret}`;
    const encodedCredentials = btoa(credentials);
    const authorizationHeader = `Basic ${encodedCredentials}`;

    let sentCount = 0;
    const results = [];

    // Send SMS to each patient
    for (const appointment of appointments) {
      const patient = appointment.patients;
      
      if (!patient?.phone) {
        console.warn(`No phone number for appointment ${appointment.id}`);
        continue;
      }

      try {
        // Parse appointment date and time
        const appointmentDate = new Date(appointment.date);
        const dateStr = appointmentDate.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'Asia/Bangkok'
        });
        const timeStr = appointmentDate.toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Bangkok'
        });

        // Generate message from template
        const messageTemplate = settings.appointment_reminder_template || 
          'เตือนความจำ: คุณ {patientName} มีนัดหมาย {purpose} วันที่ {appointmentDate} เวลา {appointmentTime} น. กรุณามาตรงเวลาค่ะ';
        
        const message = messageTemplate
          .replace('{patientName}', patient.name)
          .replace('{appointmentDate}', dateStr)
          .replace('{appointmentTime}', timeStr)
          .replace('{purpose}', appointment.purpose);

        console.log(`Sending appointment reminder to ${patient.phone} for ${patient.name}`);

        // Prepare form data
        const formData = new URLSearchParams();
        formData.append('msisdn', patient.phone);
        formData.append('message', message);
        formData.append('sender', settings.sender_name || 'SubdisTH');

        const smsResponse = await fetch('https://api-v2.thaibulksms.com/sms', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'content-type': 'application/x-www-form-urlencoded',
            'authorization': authorizationHeader
          },
          body: formData
        });

        const result = await smsResponse.json();
        console.log(`SMS result for appointment ${appointment.id}:`, result);

        if (smsResponse.ok) {
          sentCount++;
          results.push({
            appointmentId: appointment.id,
            patientName: patient.name,
            phoneNumber: patient.phone,
            success: true,
            result
          });
        } else {
          console.error(`SMS failed for appointment ${appointment.id}:`, result);
          results.push({
            appointmentId: appointment.id,
            patientName: patient.name,
            phoneNumber: patient.phone,
            success: false,
            error: result
          });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error sending SMS for appointment ${appointment.id}:`, error);
        results.push({
          appointmentId: appointment.id,
          patientName: patient.name,
          phoneNumber: patient.phone,
          success: false,
          error: error.message
        });
      }
    }

    console.log(`Appointment reminder process completed. Sent ${sentCount}/${appointments.length} SMS messages`);

    return new Response(JSON.stringify({ 
      success: true,
      message: `Sent ${sentCount}/${appointments.length} appointment reminder SMS messages`,
      sent: sentCount,
      total: appointments.length,
      results
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in appointment reminder SMS function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);

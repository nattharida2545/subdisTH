
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { lineService } from '@/services/line.service';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Define interface for LINE profile
interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

const LineCallback: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Parse URL parameters
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        // Check for errors from LINE
        if (error) {
          throw new Error(errorDescription || 'LINE login failed');
        }

        // Validate state to prevent CSRF
        const savedState = localStorage.getItem('lineLoginState');
        if (!state || state !== savedState) {
          throw new Error('Invalid state parameter');
        }

        // Validate code
        if (!code) {
          throw new Error('No authorization code received');
        }

        console.log('Processing LINE callback with code:', code);

        // Exchange code for token and get profile
        const tokenResponse = await lineService.exchangeToken(code);
        
        // Store token
        localStorage.setItem('lineToken', tokenResponse.access_token);
        
        // Extract and store profile information
        let lineProfile: LineProfile;
        if (tokenResponse.profile) {
          lineProfile = tokenResponse.profile;
        } else {
          // If no profile in the token response, try to fetch it separately
          lineProfile = await lineService.getProfile(tokenResponse.access_token);
        }
        
        console.log('LINE Profile Information:', lineProfile);
        
        // Store all profile information in localStorage
        localStorage.setItem('lineProfile', JSON.stringify(lineProfile));
        localStorage.setItem('lineUserId', lineProfile.userId);
        
        // Try to find existing patient with this LINE user ID
        const { data: existingPatient, error: findError } = await supabase
          .from('patients')
          .select('*')
          .eq('line_user_id', lineProfile.userId)
          .single();

        if (findError && findError.code !== 'PGRST116') {
          console.error('Error finding patient:', findError);
        }

        if (existingPatient) {
          // Patient already exists with this LINE account
          console.log('Found existing patient:', existingPatient);
          
          // Store user phone and navigate to patient portal
          localStorage.setItem('userPhone', existingPatient.phone);
          localStorage.setItem('lineToken', tokenResponse.access_token);
          
          toast.success('เข้าสู่ระบบสำเร็จ');
          navigate('/patient-portal');
        } else {
          // No existing patient found, need to connect phone number
          navigate('/patient-portal/connect-phone', { 
            state: { 
              lineLoginSuccess: true,
              lineUserId: lineProfile.userId,
              displayName: lineProfile.displayName,
              pictureUrl: lineProfile.pictureUrl,
              statusMessage: lineProfile.statusMessage
            }
          });
        }
        
        // Clean up
        localStorage.removeItem('lineLoginState');
      } catch (err) {
        console.error('LINE callback error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        toast.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
        <p className="text-lg">กำลังดำเนินการเข้าสู่ระบบ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>เกิดข้อผิดพลาด: {error}</p>
        </div>
        <button 
          onClick={() => navigate('/patient-portal')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          กลับสู่หน้าเข้าสู่ระบบ
        </button>
      </div>
    );
  }

  return null;
};

export default LineCallback;

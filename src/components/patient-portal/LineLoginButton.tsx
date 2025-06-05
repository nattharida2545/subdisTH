
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { lineService } from '@/services/line.service';

interface LineLoginButtonProps {
  onLoginSuccess: (token: string, phoneNumber: string) => void;
}

const LineLoginButton: React.FC<LineLoginButtonProps> = ({ onLoginSuccess }) => {
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLineLogin = useCallback(async () => {
    try {
      // Generate state for CSRF protection
      const state = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('lineLoginState', state);
      
      // Store callback information to be used after LINE login
      localStorage.setItem('lineLoginCallback', 'patient-portal');
      
      // Generate and redirect to LINE login URL using database settings
      const loginUrl = await lineService.generateLoginUrl(state);
      
      console.log('Redirecting to LINE login URL:', loginUrl);
      
      // Use window.location.href for proper redirect (not in frame)
      window.location.href = loginUrl;
    } catch (error) {
      console.error('Error initiating LINE login:', error);
      toast.error('ไม่สามารถเชื่อมต่อกับ LINE ได้ กรุณาตรวจสอบการตั้งค่า');
    }
  }, []);

  // Keep the phone input functionality as a fallback option
  const handleShowPhoneInput = () => {
    setShowPhoneInput(true);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      toast.error('กรุณากรอกเบอร์โทรศัพท์');
      return;
    }
    
    try {
      setLoading(true);
      
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a fake token
      const fakeToken = `line-${Math.random().toString(36).substring(2, 15)}`;
      
      onLoginSuccess(fakeToken, phoneNumber);
      toast.success('เข้าสู่ระบบสำเร็จ');
    } catch (error) {
      console.error('Error logging in:', error);
      toast.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setLoading(false);
    }
  };

  if (showPhoneInput) {
    return (
      <form onSubmit={handlePhoneSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-gray-700">
            กรอกเบอร์โทรศัพท์เพื่อเข้าสู่ระบบ
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="0812345678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
          <p className="text-xs text-gray-500">
            (สำหรับการทดลองใช้ - ในระบบจริงจะเชื่อมต่อกับ LINE)
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1"
            onClick={() => setShowPhoneInput(false)}
          >
            ยกเลิก
          </Button>
          <Button 
            type="submit" 
            className="flex-1 bg-[#06C755] hover:bg-[#06B048] text-white"
            disabled={loading}
          >
            {loading ? 'กำลังดำเนินการ...' : 'ยืนยัน'}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-3">
      <Button 
        onClick={handleLineLogin} 
        className="w-full bg-[#06C755] hover:bg-[#06B048] text-white"
      >
        เข้าสู่ระบบด้วย LINE
      </Button>
      
      <div className="text-center">
        <button 
          type="button"
          onClick={handleShowPhoneInput}
          className="text-sm text-gray-500 hover:underline"
        >
          หรือเข้าสู่ระบบด้วยเบอร์โทรศัพท์
        </button>
      </div>
    </div>
  );
};

export default LineLoginButton;

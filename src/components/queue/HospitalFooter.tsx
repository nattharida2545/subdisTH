
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HospitalData {
  hospital_name: string;
  hospital_address: string;
  hospital_phone: string;
  hospital_website: string;
}

const HospitalFooter: React.FC = () => {
  const [hospitalData, setHospitalData] = useState<HospitalData>({
    hospital_name: 'โรงพยาบาลส่งเสริมสุขภาพตำบลหนองแวง',
    hospital_address: 'หมู่ 7 ตำบลหนองแวง อำเภอกุดรัง จังหวัดมหาสารคาม 44130',
    hospital_phone: '',
    hospital_website: ''
  });

  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('key, value')
          .eq('category', 'general')
          .in('key', ['hospital_name', 'hospital_address', 'hospital_phone', 'hospital_website']);

        if (error) {
          console.error('Error fetching hospital data:', error);
          return;
        }

        if (data && data.length > 0) {
          const settings: Partial<HospitalData> = {};
          data.forEach((setting) => {
            if (setting.key in hospitalData) {
              settings[setting.key as keyof HospitalData] = setting.value as string;
            }
          });
          
          setHospitalData(prev => ({ ...prev, ...settings }));
        }
      } catch (error) {
        console.error('Error fetching hospital data:', error);
      }
    };

    fetchHospitalData();
  }, []);

  return (
    <footer className="mt-8 p-6 bg-white rounded-lg border border-gray-200 text-center">
      <h3 className="text-xl font-bold text-pharmacy-800 mb-2">{hospitalData.hospital_name}</h3>
      <p className="text-gray-600">{hospitalData.hospital_address}</p>
      {(hospitalData.hospital_phone || hospitalData.hospital_website) && (
        <p className="text-gray-600 mt-1">
          {hospitalData.hospital_phone && `โทร. ${hospitalData.hospital_phone}`}
          {hospitalData.hospital_phone && hospitalData.hospital_website && ' | '}
          {hospitalData.hospital_website && `เว็บไซต์: ${hospitalData.hospital_website}`}
        </p>
      )}
    </footer>
  );
};

export default HospitalFooter;

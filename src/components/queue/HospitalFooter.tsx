
import React from 'react';

const HospitalFooter: React.FC = () => {
  return (
    <footer className="mt-8 p-6 bg-white rounded-lg border border-gray-200 text-center">
      <h3 className="text-xl font-bold text-pharmacy-800 mb-2">โรงพยาบาลชุมชนบ้านเรา</h3>
      <p className="text-gray-600">123 ถนนสุขภาพดี ตำบลสุขใจ อำเภอชุมชน จังหวัดสุขสันต์ 10000</p>
      <p className="text-gray-600 mt-1">โทร. 02-123-4567 | อีเมล: info@hospital.go.th</p>
    </footer>
  );
};

export default HospitalFooter;

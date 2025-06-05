import * as React from "react";
import { useState } from "react";

const EmailConsentScreen: React.FC = () => {
  const [consentGiven, setConsentGiven] = useState(false);
  
  const handleConsent = () => {
    setConsentGiven(!consentGiven);
  };
  
  const handleSubmit = () => {
    if (consentGiven) {
      console.log('Consent given, proceeding with email scope');
      // Add your LINE Login logic here
    }
  };
  
  const handleCancel = () => {
    console.log('Consent declined');
    // Handle cancellation
  };

  return (
    <div style={{
      maxWidth: '500px',
      margin: '2rem auto',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      backgroundColor: 'white',
      textAlign: 'left',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#e6ecff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '10px'
        }}>
          <svg style={{ width: '40px', height: '40px', fill: '#cccccc' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
        </div>
        
        <h2 style={{ margin: '10px 0', fontSize: '22px' }}>ระบบคิวยา รพสต.</h2>
        
        <div style={{
          backgroundColor: '#00c300',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '14px',
          marginTop: '5px'
        }}>
          <span>Messaging API</span>
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '10px 0', fontSize: '18px', fontWeight: 'bold' }}>ขออนุญาตเข้าถึงอีเมล</h3>
        
        <p style={{ marginBottom: '10px', lineHeight: '1.5' }}>
          เราขออนุญาตเข้าถึงอีเมลของคุณเพื่อ:
        </p>
        
        <ul style={{ paddingLeft: '20px', marginBottom: '15px', lineHeight: '1.5' }}>
          <li>สร้างบัญชีผู้ใช้งานในระบบคิวยา</li>
          <li>ส่งการแจ้งเตือนเกี่ยวกับรายการยาและนัดหมาย</li>
          <li>ใช้เป็นช่องทางติดต่อสำรองกรณีไม่สามารถติดต่อผ่าน LINE ได้</li>
        </ul>
        
        <div style={{
          margin: '20px 0',
          display: 'flex',
          alignItems: 'flex-start'
        }}>
          <input 
            type="checkbox" 
            id="consent" 
            checked={consentGiven} 
            onChange={handleConsent} 
            style={{
              marginTop: '4px',
              marginRight: '10px'
            }}
          />
          <label htmlFor="consent" style={{ lineHeight: '1.5' }}>
            ฉันยินยอมให้แอพนี้เข้าถึงอีเมลของฉัน และเข้าใจว่าข้อมูลจะถูกเก็บรักษาตามนโยบายความเป็นส่วนตัว
          </label>
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '20px'
        }}>
          <button 
            onClick={handleSubmit}
            disabled={!consentGiven}
            style={{
              backgroundColor: consentGiven ? '#00c300' : '#cccccc',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: consentGiven ? 'pointer' : 'not-allowed',
              fontWeight: 'bold'
            }}
          >
            ยืนยัน
          </button>
          
          <button 
            onClick={handleCancel}
            style={{
              backgroundColor: '#f2f2f2',
              border: '1px solid #dddddd',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailConsentScreen;

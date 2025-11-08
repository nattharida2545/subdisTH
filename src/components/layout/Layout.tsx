import React from "react";
import Sidebar from "./Sidebar";
import { useIPRestriction } from "@/hooks/useIPRestriction";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  requireIPProtection?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  fullWidth = false,
  className,
  requireIPProtection = true,
}) => {
  const navigate = useNavigate();
  const { isChecking, isAllowed, clientIP } = useIPRestriction({
    autoCheck: requireIPProtection,
    redirectOnDenied: false,
    redirectPath: "/"
  });

  // ถ้าไม่ต้องการ IP protection ให้แสดงปกติ
  // if (!requireIPProtection) {
  //   return (
  //     <div className={`min-h-screen bg-background flex ${className || ""}`}>
  //       <Sidebar />
  //       <div className="flex-1 flex flex-col min-w-0">
  //         <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 flex-shrink-0">
  //           <div className="container flex h-16 items-center justify-between px-4">
  //             <div className="flex items-center space-x-4">
  //               <h1 className="text-lg font-semibold">
  //                 ระบบบริหารจัดการคิวโรงพยาบาลส่งเสริมสุขภาพ
  //               </h1>
  //             </div>
  //           </div>
  //         </header>
  //         <main
  //           className={`flex-1 overflow-auto ${fullWidth ? "w-full px-4 py-6" : "container mx-auto px-4 py-6"
  //             }`}
  //         >
  //           {children}
  //         </main>
  //       </div>
  //     </div>
  //   );
  // }

  // กำลังตรวจสอบ IP
  // if (isChecking || isAllowed === null) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen bg-gray-50">
  //       <div className="text-center">
  //         <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
  //         <p className="text-lg text-muted-foreground">กำลังตรวจสอบสิทธิ์การเข้าถึง...</p>
  //         <p className="text-sm text-muted-foreground mt-2">กรุณารอสักครู่</p>
  //       </div>
  //     </div>
  //   );
  // }

  // ไม่ได้รับอนุญาต - แสดงเฉพาะข้อความ
  // if (!isAllowed) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen bg-gray-50">
  //       <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
  //         <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4" />
  //         <h1 className="text-2xl font-bold mb-2 text-gray-900">การเข้าถึงถูกปิดกั้น</h1>
  //         <p className="text-gray-600 mb-4">
  //           IP address ของคุณไม่ได้รับอนุญาตให้เข้าถึงหน้านี้
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  // ได้รับอนุญาต - แสดงปกติพร้อม Layout
  return (
    <div className={`min-h-screen bg-background flex ${className || ""}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 flex-shrink-0">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold">
                ระบบบริหารจัดการคิวโรงพยาบาลส่งเสริมสุขภาพ
              </h1>
            </div>
          </div>
        </header>
        <main
          className={`flex-1 overflow-auto ${fullWidth ? "w-full px-4 py-6" : "container mx-auto px-4 py-6"
            }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

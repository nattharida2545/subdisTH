import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useIPRestriction } from '@/hooks/useIPRestriction';
import { Loader2 } from 'lucide-react';

interface IPProtectedRouteProps {
  children: ReactNode;
  redirectPath?: string;
}

/**
 * Component สำหรับป้องกันการเข้าถึง Admin routes ด้วย IP restriction
 * 
 * @example
 * <Route path="/admin/*" element={
 *   <IPProtectedRoute>
 *     <AdminLayout />
 *   </IPProtectedRoute>
 * } />
 */
export const IPProtectedRoute = ({ 
  children, 
  redirectPath = '/' 
}: IPProtectedRouteProps) => {
  const { isChecking, isAllowed } = useIPRestriction({
    autoCheck: true,
    redirectOnDenied: false
  });

  // กำลังตรวจสอบ
  if (isChecking || isAllowed === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">กำลังตรวจสอบสิทธิ์การเข้าถึง...</p>
        </div>
      </div>
    );
  }

  // ไม่ได้รับอนุญาต
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }

  // ได้รับอนุญาต
  return <>{children}</>;
};

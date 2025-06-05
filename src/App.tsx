import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ServicePointProvider } from '@/contexts/ServicePointContext';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Patients from '@/pages/Patients';
import Medications from '@/pages/Medications';
import QueueManagement from '@/pages/QueueManagement';
import QueueBoard from '@/pages/QueueBoard';
import Settings from '@/pages/Settings';
import Analytics from '@/pages/Analytics';
import Appointments from '@/pages/Appointments';
import CreateQueue from '@/pages/CreateQueue';
import QueueTicket from '@/pages/QueueTicket';
import PharmacyQueue from '@/pages/PharmacyQueue';
import ServicePointQueue from '@/pages/ServicePointQueue';
import QueueHistory from '@/pages/QueueHistory';
import TestDashboard from '@/pages/TestDashboard';
import PatientPortal from '@/pages/PatientPortal';
import NotFound from '@/pages/NotFound';
import Layout from '@/components/layout/Layout';
import ConnectPhone from '@/pages/ConnectPhone';
import LineCallback from '@/components/LineCallback';

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ServicePointProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
              <Route path="/patients" element={<Layout><Patients /></Layout>} />
              <Route path="/medications" element={<Layout><Medications /></Layout>} />
              <Route path="/queue" element={<Layout><QueueManagement /></Layout>} />
              <Route path="/queue-board" element={<QueueBoard />} />
              <Route path="/settings" element={<Layout><Settings /></Layout>} />
              <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
              <Route path="/appointments" element={<Layout><Appointments /></Layout>} />
              <Route path="/queue/create" element={<CreateQueue />} />
              <Route path="/queue-ticket" element={<QueueTicket />} />
              <Route path="/pharmacy" element={<Layout fullWidth><PharmacyQueue /></Layout>} />
              <Route path="/service-point-queue" element={<Layout><ServicePointQueue /></Layout>} />
              <Route path="/queue-history" element={<Layout><QueueHistory /></Layout>} />
              <Route path="/test-dashboard" element={<TestDashboard />} />
              <Route path="/patient-portal" element={<PatientPortal />} />
              <Route path="/patient-portal/connect-phone" element={<ConnectPhone />} />
              <Route path="/auth/line/callback" element={<LineCallback />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </ServicePointProvider>
    </QueryClientProvider>
  );
}

export default App;

import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ServicePointProvider } from "@/contexts/ServicePointContext";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Patients from "@/pages/Patients";
import Medications from "@/pages/Medications";
import QueueManagement from "@/pages/QueueManagement";
import QueueBoard from "@/pages/QueueBoard";
import QueueInsBoard from "@/pages/QueueInsBoard";
import CombinedQueueBoard from "@/pages/CombinedQueueBoard";
import Settings from "@/pages/Settings";
import Analytics from "@/pages/Analytics";
import Appointments from "@/pages/Appointments";
import CreateQueue from "@/pages/CreateQueue";
import QueueTicket from "@/pages/QueueTicket";
import PharmacyQueue from "@/pages/PharmacyQueue";
import ServicePointQueue from "@/pages/ServicePointQueue";
import QueueHistory from "@/pages/QueueHistory";
import InsQueueHistory from "@/pages/InsQueueHistory";
import TestDashboard from "@/pages/TestDashboard";
import PatientPortal from "@/pages/PatientPortal";
import NotFound from "@/pages/NotFound";
import Layout from "@/components/layout/Layout";
import ConnectPhone from "@/pages/ConnectPhone";
import LineCallback from "@/components/LineCallback";
import PatientPortalAuthWrapper from "@/components/patient-portal/PatientPortalAuthWrapper";
import PatientAppointments from "@/components/patient-portal/PatientAppointments";
import PatientProfile from "@/components/patient-portal/PatientProfile";
import PatientMedications from "@/components/patient-portal/PatientMedications";
import { Toaster } from "@/components/ui/toaster";
import QueueCreateINS from "./pages/QueueCreateINS";
import InsQueue from "./pages/InsQueue";
import { fetchClientIP } from "./utils/security/clientIPDetector";

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
  useEffect(() => {
    // ดึง IP ผู้ใช้จาก external service (ipify.org)
    fetchClientIP({
      useEdgeFunction: false,
      useExternalService: true
    }).catch(console.error);
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <ServicePointProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public routes - no authentication required */}
              <Route
                path="/"
                element={
                  <Layout fullWidth={true}>
                    <Index />
                  </Layout>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <Layout>
                    <Dashboard />
                  </Layout>
                }
              />
              <Route
                path="/patients"
                element={
                  <Layout fullWidth={true}>
                    <Patients />
                  </Layout>
                }
              />
              <Route
                path="/medications"
                element={
                  <Layout fullWidth={true}>
                    <Medications />
                  </Layout>
                }
              />
              <Route
                path="/queue"
                element={
                  <Layout fullWidth={true}>
                    <QueueManagement />
                  </Layout>
                }
              />
              <Route
                path="/appointments"
                element={
                  <Layout fullWidth={true}>
                    <Appointments />
                  </Layout>
                }
              />
              <Route
                path="/pharmacy"
                element={
                  <Layout fullWidth={true}>
                    <PharmacyQueue />
                  </Layout>
                }
              />
              <Route
                path="/ins-queue"
                element={
                  <Layout fullWidth={true}>
                    <InsQueue />
                  </Layout>
                }
              />

              <Route
                path="/service-point-queue"
                element={
                  <Layout>
                    <ServicePointQueue />
                  </Layout>
                }
              />
              <Route
                path="/queue-history"
                element={
                  <Layout fullWidth={true}>
                    <QueueHistory />
                  </Layout>
                }
              />
              <Route
                path="/ins-queue-history"
                element={
                  <Layout fullWidth={true}>
                    <InsQueueHistory />
                  </Layout>
                }
              />
              <Route
                path="/analytics"
                element={
                  <Layout fullWidth={true}>
                    <Analytics />
                  </Layout>
                }
              />
              <Route
                path="/settings"
                element={
                  <Layout fullWidth={true}>
                    <Settings />
                  </Layout>
                }
              />
              <Route path="/test-dashboard" element={<TestDashboard />} />

              {/* Patient portal and queue routes */}
              <Route path="/patient-portal" element={<PatientPortal />} />
              <Route
                path="/patient-portal/connect-phone"
                element={<ConnectPhone />}
              />
              <Route path="/auth/line/callback" element={<LineCallback />} />
              <Route path="/queue/create" element={<CreateQueue />} />
              <Route path="/queue/create-ins" element={<QueueCreateINS />} />
              <Route path="/queue-ticket" element={<QueueTicket />} />
              <Route path="/queue-board" element={<QueueBoard />} />
              <Route path="/queue-board-ins" element={<QueueInsBoard />} />
              <Route
                path="/combined-queue-board"
                element={<CombinedQueueBoard />}
              />

              {/* Patient portal protected routes */}
              <Route
                path="/patient-portal/appointments"
                element={
                  <PatientPortalAuthWrapper>
                    {(patients, selectedPatient) => {
                      const appointmentPatientContext = sessionStorage.getItem(
                        "appointmentPatientContext"
                      );
                      const contextPatient = appointmentPatientContext
                        ? JSON.parse(appointmentPatientContext)
                        : selectedPatient || patients[0];

                      if (!contextPatient) {
                        window.location.href = "/patient-portal";
                        return null;
                      }

                      return <PatientAppointments patient={contextPatient} />;
                    }}
                  </PatientPortalAuthWrapper>
                }
              />
              <Route
                path="/patient-portal/medications"
                element={
                  <PatientPortalAuthWrapper>
                    {(patients, selectedPatient) => {
                      const medicationPatientContext = sessionStorage.getItem(
                        "medicationPatientContext"
                      );
                      const contextPatient = medicationPatientContext
                        ? JSON.parse(medicationPatientContext)
                        : selectedPatient || patients[0];

                      if (!contextPatient) {
                        window.location.href = "/patient-portal";
                        return null;
                      }

                      return <PatientMedications patient={contextPatient} />;
                    }}
                  </PatientPortalAuthWrapper>
                }
              />
              <Route
                path="/patient-portal/profile"
                element={
                  <PatientPortalAuthWrapper>
                    {(patients, selectedPatient) => {
                      const profilePatientContext = sessionStorage.getItem(
                        "profilePatientContext"
                      );
                      const contextPatient = profilePatientContext
                        ? JSON.parse(profilePatientContext)
                        : selectedPatient || patients[0];

                      if (!contextPatient) {
                        window.location.href = "/patient-portal";
                        return null;
                      }

                      return <PatientProfile patient={contextPatient} />;
                    }}
                  </PatientPortalAuthWrapper>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
        <Toaster />
      </ServicePointProvider>
    </QueryClientProvider>
  );
}

export default App;

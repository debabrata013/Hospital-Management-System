"use client";

import { PatientDashboard } from "@/components/patient-dashboard";
import { Sidebar } from "@/components/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardOverview } from "@/components/dashboard-overview";
import { MedicalRecords } from "@/components/medical-records";
import { AppointmentsManagement } from "@/components/appointments-management";
import { BillingSystem } from "@/components/billing-system";

import { CommunicationTools } from "@/components/ui/communication-tools";
import { PatientSupport } from "@/components/ui/patient-support";

export default function Home() {
  return <PatientDashboard />;
}

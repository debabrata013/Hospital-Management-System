"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { DashboardHeader } from "./dashboard-header";
import { DashboardOverview } from "./dashboard-overview";
import { MedicalRecords } from "./medical-records";
import { AppointmentsManagement } from "./appointments-management";
import { BillingSystem } from "./billing-system";
import { UserProfile } from "./user-profile";

export function PatientDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <DashboardOverview />;
      case "medical-records":
        return <MedicalRecords />;
      case "appointments":
        return <AppointmentsManagement />;
      case "billing":
        return <BillingSystem />;
      case "profile":
      case "settings":
        return <UserProfile />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div
        className={`fixed md:static z-30 h-full transition-transform duration-300 
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <Sidebar
          activeSection={activeSection}
          onSectionChange={(section) => {
            setActiveSection(section);
            setIsSidebarOpen(false); // close after click on mobile
          }}
        />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center">
          {/* Toggle button for mobile */}
          <button
            className="md:hidden p-2 m-2 bg-indigo-600 text-white rounded-lg"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            ☰
          </button>

          {/* Desktop header */}
          <DashboardHeader onSectionChange={setActiveSection} />
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { DashboardHeader } from "./dashboard-header";
import { DashboardOverview } from "./dashboard-overview";
import { MedicalRecords } from "./medical-records";
import { AppointmentsManagement } from "./appointments-management";
import { BillingSystem } from "./billing-system";
import { UserProfile } from "./user-profile";

export function PatientDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // desktop: open by default
  const [isMobile, setIsMobile] = useState(false);

  // detect screen size
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // keep default: open on desktop, closed on mobile
  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

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
    <div className="flex h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 relative">
      {/* Sidebar:
          - Mobile: fixed + translate (slides over content)
          - Desktop: static + width collapse (content reflows to full width) */}
      <div
        className={[
          "z-40 h-full transform transition-all duration-300",
          "fixed md:static", // fixed on mobile only
          // Mobile slide: translate in/out
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0", // on desktop, never translate (we collapse width instead)
          // Width behavior
          "w-64", // base width for mobile sheet
          isSidebarOpen ? "md:w-64" : "md:w-0", // desktop: collapse width to 0 when closed
          "md:overflow-hidden", // hide contents when collapsed
        ].join(" ")}
      >
        <Sidebar
          activeSection={activeSection}
          onSectionChange={(section) => {
            setActiveSection(section);
            if (isMobile) setIsSidebarOpen(false); // auto-close on mobile after navigation
          }}
        />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          {/* Toggle visible on desktop + mobile */}
          <button
            className="p-2 m-2 bg-indigo-600 text-white rounded-lg"
            onClick={() => setIsSidebarOpen((s) => !s)}
            aria-label="Toggle sidebar"
            aria-expanded={isSidebarOpen}
          >
            ☰
          </button>

          <DashboardHeader onSectionChange={setActiveSection} />
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">{renderContent()}</main>
      </div>

      {/* Dark overlay only for mobile when sidebar open */}
      {isSidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

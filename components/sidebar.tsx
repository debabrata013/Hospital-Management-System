"use client";

import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  CreditCard,
  User,
  LogOut,
} from "lucide-react";

type SidebarProps = {
  activeSection: string;
  onSectionChange: (section: string) => void;
};

const NAV_SECTIONS: {
  title: string;
  items: { id: string; label: string; icon: React.ComponentType<any> }[];
}[] = [
  {
    title: "Dashboard",
    items: [{ id: "overview", label: "Overview", icon: LayoutDashboard }],
  },
  {
    title: "Health Management",
    items: [
      { id: "medical-records", label: "Medical Records", icon: FileText },
      { id: "appointments", label: "Appointments", icon: Calendar },
      { id: "billing", label: "Billing", icon: CreditCard },
    ],
  },
  {
    title: "Account",
    items: [
      { id: "profile", label: "Profile", icon: User },
      { id: "logout", label: "Logout", icon: LogOut }, // ✅ logout inside nav
    ],
  },
];

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const router = useRouter();

  const handleLogout = () => {
    // 👉 Clear session/token logic here
    localStorage.removeItem("token"); // (example) remove token/session
    alert("You have been logged out!");

    // ✅ Redirect to login page
    router.push("/login");
  };

  return (
    <aside className="h-full w-64 bg-white/80 backdrop-blur-sm border-r border-white/20 shadow-sm flex flex-col">
      {/* Brand */}
      <div className="px-4 py-5 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
            ♥
          </div>
          <div>
            <h2 className="text-base font-semibold">HealthCare Portal</h2>
            <p className="text-xs text-gray-500">Patient Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <h3 className="px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                // 🔑 Special case for logout
                if (item.id === "logout") {
                  return (
                    <button
                      key={item.id}
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => onSectionChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors
                      ${
                        isActive
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

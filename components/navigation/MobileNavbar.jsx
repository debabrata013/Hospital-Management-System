"use client";

import React, { useState } from "react";

const navLinks = [
  { label: "Dashboard", href: "/" },
  { label: "Patients", href: "/patients" },
  { label: "Appointments", href: "/appointments" },
  { label: "Settings", href: "/settings" },
];

export default function MobileNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="mobile-navbar">
      <div className="mobile-navbar__brand">Patient Dashboard</div>
      <button
        className="mobile-navbar__menu-btn"
        aria-label="Open menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span />
      </button>
      <div className={`mobile-navbar__menu${open ? " open" : ""}`}>
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="px-4 py-2 text-lg"
            onClick={() => setOpen(false)}
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

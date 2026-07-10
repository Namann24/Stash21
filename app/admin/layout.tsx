"use client";

import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.dataset.admin = "true";
    return () => {
      delete document.body.dataset.admin;
    };
  }, []);

  return (
    <div className="admin-root min-h-screen relative z-10">
      {children}
    </div>
  );
}

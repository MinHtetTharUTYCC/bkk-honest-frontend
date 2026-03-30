"use client";

import { useState, useEffect } from "react";
import ReportModal from "./report-modal";

interface ReportData {
  targetId: string;
  reportType: "SPOT" | "COMMUNITY_TIP" | "SCAM_ALERT" | "COMMENT" | "PROFILE";
}

export function GlobalReportModal() {
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<ReportData>;
      setData(customEvent.detail);
    };

    window.addEventListener("OPEN_REPORT_MODAL", handleOpen);
    return () => window.removeEventListener("OPEN_REPORT_MODAL", handleOpen);
  }, []);

  if (!data) return null;

  return (
    <ReportModal
      targetId={data.targetId}
      reportType={data.reportType}
      onClose={() => setData(null)}
    />
  );
}

import jsPDF from "jspdf";

export interface ScanPoint {
  id: string;
  createdAt: string | Date;
  redness: number;
  texture: number;
  acneCount: number;
  hydration: number;
  darkSpots: number;
}

export interface ReportData {
  id: string;
  summaryText: string;
  flaggedMetrics: string;
  dateRangeStart: string | Date;
  dateRangeEnd: string | Date;
  createdAt: string | Date;
  userName?: string;
  chartImageBase64?: string;
  scansInRange?: ScanPoint[];
}

export async function exportDermatologistHandoffPDF(report: ReportData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(margin, y, contentWidth, 22, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("DERMLOG | CLINICAL DERMATOLOGY HANDOFF", margin + 6, y + 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Longitudinal Skin Telemetry & Algorithmic Biomarker Analysis", margin + 6, y + 16);

  y += 28;

  // Metadata Panel
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, "FD");

  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Patient Name:", margin + 5, y + 7);
  doc.text("Date Generated:", margin + 5, y + 15);

  doc.setFont("helvetica", "normal");
  doc.text(report.userName || "Alex Morgan", margin + 35, y + 7);
  doc.text(new Date(report.createdAt).toLocaleString(), margin + 35, y + 15);

  const startFormatted = new Date(report.dateRangeStart).toLocaleDateString();
  const endFormatted = new Date(report.dateRangeEnd).toLocaleDateString();
  doc.setFont("helvetica", "bold");
  doc.text("Telemetry Window:", margin + 95, y + 7);
  doc.text("Triggered Flags:", margin + 95, y + 15);

  doc.setFont("helvetica", "normal");
  doc.text(`${startFormatted}  -  ${endFormatted}`, margin + 130, y + 7);

  let flags: string[] = [];
  try {
    flags = JSON.parse(report.flaggedMetrics);
  } catch {
    flags = [report.flaggedMetrics];
  }
  doc.setTextColor(190, 18, 60); // Rose red
  doc.setFont("helvetica", "bold");
  doc.text(flags.join(", ").toUpperCase() || "MONITORED INTERVAL", margin + 130, y + 15);

  y += 28;

  // Section 1: AI Clinical Handoff Summary
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("1. Algorithmic Trend Summary & Correlation", margin, y);
  y += 5;

  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, margin + contentWidth, y);
  y += 6;

  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  
  const splitSummary = doc.splitTextToSize(report.summaryText, contentWidth);
  doc.text(splitSummary, margin, y);
  y += splitSummary.length * 4.6 + 6;

  // Section 2: Longitudinal Telemetry Chart (if captured)
  if (report.chartImageBase64) {
    if (y > 180) {
      doc.addPage();
      y = 18;
    }
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("2. Optical Telemetry Trajectory Chart", margin, y);
    y += 5;
    doc.line(margin, y, margin + contentWidth, y);
    y += 4;

    try {
      doc.addImage(report.chartImageBase64, "PNG", margin, y, contentWidth, 55);
      y += 60;
    } catch (e) {
      console.warn("Could not embed chart image:", e);
    }
  }

  // Section 3: Raw Telemetric Data Table
  if (y > 210) {
    doc.addPage();
    y = 18;
  }

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("3. Raw Telemetric Scan Data Points", margin, y);
  y += 5;
  doc.line(margin, y, margin + contentWidth, y);
  y += 6;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  const colX = [
    margin + 4,
    margin + 36,
    margin + 66,
    margin + 96,
    margin + 126,
    margin + 154,
  ];

  doc.text("SCAN DATE", colX[0], y + 4.8);
  doc.text("REDNESS (0-100)", colX[1], y + 4.8);
  doc.text("TEXTURE (0-100)", colX[2], y + 4.8);
  doc.text("ACNE COUNT", colX[3], y + 4.8);
  doc.text("HYDRATION (%)", colX[4], y + 4.8);
  doc.text("DARK SPOTS", colX[5], y + 4.8);
  y += 8;

  const scans = report.scansInRange || [];
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);

  if (scans.length === 0) {
    doc.text("No tabular scan records available for this interval.", margin + 4, y + 4);
    y += 8;
  } else {
    scans.forEach((scan, index) => {
      if (y > 270) {
        doc.addPage();
        y = 18;
      }
      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y - 1, contentWidth, 6, "F");
      }
      doc.text(new Date(scan.createdAt).toLocaleDateString(), colX[0], y + 3.5);
      doc.text(`${scan.redness.toFixed(1)}`, colX[1], y + 3.5);
      doc.text(`${scan.texture.toFixed(1)}`, colX[2], y + 3.5);
      doc.text(`${scan.acneCount}`, colX[3], y + 3.5);
      doc.text(`${scan.hydration.toFixed(1)}%`, colX[4], y + 3.5);
      doc.text(`${scan.darkSpots.toFixed(1)}`, colX[5], y + 3.5);
      y += 6.5;
    });
  }

  // Footer Disclaimer
  const footerY = 285;
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "CONFIDENTIAL HEALTH RECORD • Prepared via Dermlog Local Telemetry Handoff System • For Physician Review Only",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  doc.save(`Dermlog-Clinical-Handoff-${new Date(report.createdAt).toISOString().split("T")[0]}.pdf`);
}

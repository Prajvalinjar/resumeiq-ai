"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { AnalysisResult } from "@/types/analysis";

interface Props {
  analysis: AnalysisResult;
}

export default function ReportDownloadButton({ analysis }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const tempDiv = document.createElement("div");
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      tempDiv.style.top = "-9999px";
      tempDiv.style.width = "800px";
      tempDiv.style.padding = "40px";
      tempDiv.style.backgroundColor = "#020617";
      tempDiv.style.color = "#ffffff";
      tempDiv.style.fontFamily = "system-ui, -apple-system, sans-serif";
      
      tempDiv.innerHTML = `
        <div style="border-bottom: 2px solid #334155; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #22d3ee; margin: 0; font-size: 32px; letter-spacing: -0.5px;">ResumeIQ Pro Report</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 8px;">Generated for <strong>${analysis.targetRole}</strong></p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 40px; background: #0f172a; border: 1px solid #1e293b; padding: 20px; border-radius: 12px;">
          <div>
            <p style="font-size: 12px; color: #94a3b8; margin: 0; text-transform: uppercase; font-weight: bold;">ATS Match Score</p>
            <h2 style="font-size: 48px; color: #22d3ee; margin: 5px 0 0 0;">${analysis.atsScore}%</h2>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0; text-transform: uppercase; font-weight: bold;">File Analyzed</p>
            <p style="font-size: 16px; color: #cbd5e1; margin: 5px 0 0 0; word-break: break-all; max-width: 300px;">${analysis.fileName}</p>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #a78bfa; font-size: 18px; border-bottom: 1px solid #334155; padding-bottom: 10px;">Missing Skills & Keywords</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 15px;">
            ${[...analysis.missingSkills, ...analysis.missingKeywords].map(k => 
              `<span style="background: #1e1b4b; color: #a78bfa; padding: 6px 12px; border-radius: 16px; font-size: 12px; border: 1px solid #2e1065; margin-right: 8px; margin-bottom: 8px; display: inline-block;">${k}</span>`
            ).join("")}
          </div>
        </div>

        <div style="display: flex; gap: 20px; margin-bottom: 30px;">
          <div style="flex: 1; background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 12px;">
            <h4 style="color: #34d399; margin-top: 0;">Strengths</h4>
            <ul style="color: #cbd5e1; font-size: 14px; padding-left: 20px; margin-bottom: 0;">
              ${analysis.strengths.map(s => `<li style="margin-bottom: 6px;">${s}</li>`).join("")}
            </ul>
          </div>
          <div style="flex: 1; background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2); padding: 20px; border-radius: 12px;">
            <h4 style="color: #fbbf24; margin-top: 0;">Areas for Improvement</h4>
            <ul style="color: #cbd5e1; font-size: 14px; padding-left: 20px; margin-bottom: 0;">
              ${analysis.weaknesses.map(w => `<li style="margin-bottom: 6px;">${w}</li>`).join("")}
            </ul>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #22d3ee; font-size: 18px; border-bottom: 1px solid #334155; padding-bottom: 10px;">Key Suggestions</h3>
          <ul style="color: #cbd5e1; font-size: 14px; padding-left: 20px; margin-top: 15px;">
            ${analysis.suggestions.map(s => `<li style="margin-bottom: 10px;">${s}</li>`).join("")}
          </ul>
        </div>
      `;
      
      document.body.appendChild(tempDiv);
      
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        backgroundColor: "#020617",
      });
      
      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ResumeIQ_Report_${analysis.targetRole.replace(/\s+/g, '_')}.pdf`);
      
    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert("Failed to generate PDF report.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="px-5 py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-bold hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 shadow-md whitespace-nowrap"
    >
      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {isGenerating ? "Generating..." : "Download Report"}
    </button>
  );
}

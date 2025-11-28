import { Quote } from "@/types/estimator";
import { formatCurrency } from "@/lib/pricing";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Download, Loader2 } from "lucide-react";
import tkbsoLogo from "@/assets/tkbso-logo.png";

interface QuotePDFGeneratorProps {
  quote: Quote;
}

export function QuotePDFGenerator({ quote }: QuotePDFGeneratorProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    if (!printRef.current) return;
    
    setIsGenerating(true);
    
    try {
      // Make the hidden content visible temporarily
      const element = printRef.current;
      element.style.display = "block";
      element.style.position = "absolute";
      element.style.left = "-9999px";
      element.style.top = "0";
      
      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
      
      element.style.display = "none";
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: "letter",
      });
      
      const pageWidth = 8.5;
      const pageHeight = 11;
      const margin = 0.5;
      const contentWidth = pageWidth - margin * 2;
      
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Handle multi-page if content is too long
      let position = margin;
      let remainingHeight = imgHeight;
      let sourceY = 0;
      
      while (remainingHeight > 0) {
        const availableHeight = pageHeight - margin * 2;
        const printHeight = Math.min(availableHeight, remainingHeight);
        
        // Calculate the portion of the image to use
        const sourceHeight = (printHeight / imgHeight) * canvas.height;
        
        // Create a temporary canvas for this page portion
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = sourceHeight;
        const ctx = tempCanvas.getContext("2d");
        
        if (ctx) {
          ctx.drawImage(
            canvas,
            0, sourceY,
            canvas.width, sourceHeight,
            0, 0,
            canvas.width, sourceHeight
          );
          
          const pageImgData = tempCanvas.toDataURL("image/png");
          pdf.addImage(pageImgData, "PNG", margin, margin, imgWidth, printHeight);
        }
        
        remainingHeight -= printHeight;
        sourceY += sourceHeight;
        
        if (remainingHeight > 0) {
          pdf.addPage();
        }
      }
      
      const fileName = `TKBSO_Quote_${quote.projectSnapshot.name.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Button
        onClick={generatePDF}
        disabled={isGenerating}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        Download PDF
      </Button>

      {/* Hidden PDF Content */}
      <div ref={printRef} style={{ display: "none", width: "7.5in", fontFamily: "Arial, sans-serif" }}>
        <div style={{ padding: "0.25in", backgroundColor: "#ffffff" }}>
          {/* Logo Header */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <img 
              src={tkbsoLogo} 
              alt="The Kitchen and Bath Store of Orlando" 
              style={{ maxWidth: "300px", height: "auto" }}
              crossOrigin="anonymous"
            />
          </div>

          {/* Title Area */}
          <div style={{ textAlign: "center", marginBottom: "32px", borderBottom: "2px solid #1e3a8a", paddingBottom: "16px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1e3a8a", margin: "0 0 8px 0" }}>
              Proposal for {quote.projectSnapshot.name}
            </h1>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: "4px 0" }}>
              {quote.projectSnapshot.location}
            </p>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: "4px 0" }}>
              {currentDate}
            </p>
          </div>

          {/* Project Summary */}
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#1e3a8a", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px", marginBottom: "12px" }}>
              Project Summary
            </h2>
            <table style={{ width: "100%", fontSize: "13px" }}>
              <tbody>
                <tr>
                  <td style={{ padding: "4px 0", color: "#6b7280", width: "140px" }}>Rooms:</td>
                  <td style={{ padding: "4px 0" }}>{quote.projectSnapshot.roomsSummary}</td>
                </tr>
                <tr>
                  <td style={{ padding: "4px 0", color: "#6b7280" }}>Scope:</td>
                  <td style={{ padding: "4px 0" }}>{quote.projectSnapshot.scopeSummary}</td>
                </tr>
                <tr>
                  <td style={{ padding: "4px 0", color: "#6b7280" }}>Permit/GC:</td>
                  <td style={{ padding: "4px 0" }}>{quote.projectSnapshot.permitGCSummary}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Investment Summary */}
          <div style={{ marginBottom: "24px", backgroundColor: "#f3f4f6", padding: "16px", borderRadius: "8px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "12px" }}>
              Investment Summary
            </h2>
            <div style={{ marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>Estimated Investment Range: </span>
              <span style={{ fontSize: "14px", fontWeight: "500" }}>
                {formatCurrency(quote.priceSummary.lowEstimate)} – {formatCurrency(quote.priceSummary.highEstimate)}
              </span>
            </div>
            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "12px", marginTop: "12px" }}>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>Recommended Quote: </span>
              <span style={{ fontSize: "22px", fontWeight: "bold", color: "#1e3a8a" }}>
                {formatCurrency(quote.priceSummary.recommendedPrice)}
              </span>
            </div>
            <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "8px" }}>
              {quote.priceSummary.perSqftNote}
            </p>
          </div>

          {/* Scope of Work */}
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#1e3a8a", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px", marginBottom: "12px" }}>
              Scope of Work
            </h2>
            {quote.scopeOfWork.map((section, idx) => (
              <div key={idx} style={{ marginBottom: "16px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                  {section.title}
                </h3>
                <ul style={{ margin: "0", paddingLeft: "20px", fontSize: "12px", color: "#4b5563" }}>
                  {section.items.map((item, itemIdx) => (
                    <li key={itemIdx} style={{ marginBottom: "3px" }}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Assumptions (Client-Safe) */}
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#1e3a8a", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px", marginBottom: "12px" }}>
              Notes & Clarifications
            </h2>
            <ul style={{ margin: "0", paddingLeft: "20px", fontSize: "12px", color: "#4b5563" }}>
              {quote.assumptions.map((item, idx) => (
                <li key={idx} style={{ marginBottom: "3px" }}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <div style={{ marginTop: "32px", paddingTop: "16px", borderTop: "2px solid #1e3a8a", textAlign: "center" }}>
            <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
              The Kitchen & Bath Store of Orlando
            </p>
            <p style={{ fontSize: "11px", color: "#9ca3af" }}>
              Thank you for considering TKBSO for your remodeling project.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

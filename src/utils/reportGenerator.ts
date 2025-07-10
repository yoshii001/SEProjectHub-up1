import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ClientInfo {
  name: string;
  company: string;
  email: string;
  phone: string;
}

interface ProjectRequirements {
  title: string;
  problemToSolve: string;
  description: string;
  targetUsers: string;
  goals: string;
  coreFeatures: string[];
  dataFields: string[];
  adminAccess: string;
  fileUploads: string;
  uiPreferences: {
    designInspiration: string;
    themeMode: string;
    animations: string;
    mustHaveComponents: string[];
  };
  technicalDetails: {
    hosting: string;
    database: string;
    adminDashboard: boolean;
    payments: boolean;
    paymentGateway?: string;
  };
  timeline: {
    deadline: string;
    budget: string;
    mvpFirst: boolean;
  };
  phases: Array<{
    name: string;
    duration: string;
  }>;
}

export const generateProjectRequirementsReport = (
  clientInfo: ClientInfo,
  requirements: ProjectRequirements
): string => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const reportHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Requirements Report - ${requirements.title}</title>
    <style>
        @page {
            size: A4;
            margin: 15mm;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            line-height: 1.4;
            color: #2d3748;
            background: white;
            font-size: 10pt;
            width: 180mm;
            margin: 0 auto;
        }
        
        .report-container {
            width: 100%;
            background: white;
            padding: 0;
        }
        
        .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #3182ce;
            page-break-after: avoid;
        }
        
        .header h1 {
            color: #2b6cb0;
            font-size: 18pt;
            font-weight: 700;
            margin-bottom: 6px;
        }
        
        .header .subtitle {
            color: #4a5568;
            font-size: 11pt;
            font-weight: 500;
        }
        
        .header .date {
            color: #718096;
            font-size: 9pt;
            margin-top: 6px;
        }
        
        .client-info {
            background: #f7fafc;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #3182ce;
            page-break-inside: avoid;
        }
        
        .client-info h2 {
            color: #2b6cb0;
            font-size: 12pt;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .client-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }
        
        .client-detail {
            font-size: 9pt;
        }
        
        .client-detail strong {
            color: #2d3748;
            margin-right: 6px;
            min-width: 60px;
            display: inline-block;
        }
        
        .section {
            margin-bottom: 20px;
            page-break-inside: avoid;
        }
        
        .section-header {
            background: #f7fafc;
            padding: 10px 12px;
            border-radius: 6px;
            margin-bottom: 12px;
            border-left: 3px solid #4299e1;
        }
        
        .section-header h2 {
            color: #2b6cb0;
            font-size: 12pt;
            font-weight: 600;
        }
        
        .section-content {
            padding: 0 12px;
        }
        
        .project-overview {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
        }
        
        .project-title {
            color: #2b6cb0;
            font-size: 14pt;
            font-weight: 700;
            margin-bottom: 10px;
            text-align: center;
        }
        
        .overview-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 12px;
        }
        
        .overview-item h4 {
            color: #2d3748;
            font-size: 10pt;
            font-weight: 600;
            margin-bottom: 4px;
        }
        
        .overview-item p {
            color: #4a5568;
            font-size: 9pt;
            line-height: 1.3;
        }
        
        .feature-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            margin-top: 8px;
        }
        
        .feature-item {
            background: #f0fff4;
            padding: 6px 10px;
            border-radius: 4px;
            border-left: 2px solid #38a169;
            font-size: 9pt;
            display: flex;
            align-items: center;
        }
        
        .feature-item::before {
            content: "✓";
            color: #38a169;
            font-weight: bold;
            margin-right: 6px;
            font-size: 8pt;
        }
        
        .data-field {
            background: #fffaf0;
            padding: 4px 8px;
            border-radius: 3px;
            border-left: 2px solid #ed8936;
            margin: 3px 0;
            font-size: 9pt;
        }
        
        .tech-stack {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-top: 8px;
        }
        
        .tech-item {
            background: #f0f4f8;
            padding: 8px;
            border-radius: 4px;
            text-align: center;
        }
        
        .tech-item strong {
            color: #2b6cb0;
            display: block;
            margin-bottom: 3px;
            font-size: 9pt;
        }
        
        .tech-item span {
            font-size: 8pt;
            color: #4a5568;
        }
        
        .timeline-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            background: white;
            border-radius: 6px;
            overflow: hidden;
            font-size: 9pt;
        }
        
        .timeline-table th {
            background: #4299e1;
            color: white;
            padding: 8px;
            text-align: left;
            font-weight: 600;
            font-size: 9pt;
        }
        
        .timeline-table td {
            padding: 6px 8px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 8pt;
        }
        
        .timeline-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        .phase-duration {
            background: #e6fffa;
            color: #2c7a7b;
            padding: 2px 6px;
            border-radius: 3px;
            font-weight: 600;
            font-size: 8pt;
        }
        
        .budget-highlight {
            background: #fed7d7;
            color: #c53030;
            padding: 6px 10px;
            border-radius: 4px;
            text-align: center;
            font-weight: 600;
            margin: 8px 0;
            font-size: 9pt;
        }
        
        .component-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 6px;
            margin-top: 8px;
        }
        
        .component-item {
            background: #e6fffa;
            color: #2c7a7b;
            padding: 4px 8px;
            border-radius: 3px;
            text-align: center;
            font-size: 8pt;
            font-weight: 500;
        }
        
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #718096;
            font-size: 8pt;
            page-break-inside: avoid;
        }
        
        .signature-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-top: 25px;
            page-break-inside: avoid;
        }
        
        .signature-box {
            text-align: center;
            padding: 15px;
            border: 1px dashed #cbd5e0;
            border-radius: 4px;
        }
        
        .signature-line {
            border-bottom: 1px solid #2d3748;
            margin: 15px 0 6px 0;
            height: 1px;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        h4 {
            font-size: 10pt;
            color: #2d3748;
            margin-bottom: 6px;
            margin-top: 8px;
        }
        
        p {
            font-size: 9pt;
            line-height: 1.3;
            margin-bottom: 6px;
        }
        
        .emoji {
            font-size: 11pt;
            margin-right: 6px;
        }
        
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .section {
                page-break-inside: avoid;
            }
            
            .timeline-table {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <!-- Header -->
        <div class="header">
            <h1>Project Requirements Report</h1>
            <div class="subtitle">Comprehensive Project Specification Document</div>
            <div class="date">Generated on ${currentDate}</div>
        </div>

        <!-- Client Information -->
        <div class="client-info">
            <h2>Client Information</h2>
            <div class="client-details">
                <div class="client-detail">
                    <strong>Name:</strong> ${clientInfo.name}
                </div>
                <div class="client-detail">
                    <strong>Company:</strong> ${clientInfo.company}
                </div>
                <div class="client-detail">
                    <strong>Email:</strong> ${clientInfo.email}
                </div>
                <div class="client-detail">
                    <strong>Phone:</strong> ${clientInfo.phone}
                </div>
            </div>
        </div>

        <!-- Project Overview -->
        <div class="section">
            <div class="section-header">
                <h2><span class="emoji">📌</span>Project Overview</h2>
            </div>
            <div class="section-content">
                <div class="project-overview">
                    <div class="project-title">${requirements.title}</div>
                    <div class="overview-grid">
                        <div class="overview-item">
                            <h4>Problem Statement</h4>
                            <p>${requirements.problemToSolve}</p>
                        </div>
                        <div class="overview-item">
                            <h4>Target Users</h4>
                            <p>${requirements.targetUsers}</p>
                        </div>
                    </div>
                    <div style="margin-top: 12px;">
                        <h4>Project Description</h4>
                        <p>${requirements.description}</p>
                    </div>
                    <div style="margin-top: 10px;">
                        <h4>Main Goals</h4>
                        <p>${requirements.goals}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Core Requirements -->
        <div class="section">
            <div class="section-header">
                <h2><span class="emoji">🧱</span>Core Requirements</h2>
            </div>
            <div class="section-content">
                <h4>Main Features</h4>
                <div class="feature-list">
                    ${requirements.coreFeatures.map(feature => `<div class="feature-item">${feature}</div>`).join('')}
                </div>
            </div>
        </div>

        <!-- Data Fields -->
        <div class="section">
            <div class="section-header">
                <h2><span class="emoji">📋</span>Data Requirements</h2>
            </div>
            <div class="section-content">
                <h4>Required Data Fields</h4>
                ${requirements.dataFields.map(field => `<div class="data-field">${field}</div>`).join('')}
                
                <div style="margin-top: 12px;">
                    <h4>Admin Access</h4>
                    <p>${requirements.adminAccess}</p>
                </div>
                
                <div style="margin-top: 8px;">
                    <h4>File Upload Requirements</h4>
                    <p>${requirements.fileUploads}</p>
                </div>
            </div>
        </div>

        <!-- UI/UX Preferences -->
        <div class="section">
            <div class="section-header">
                <h2><span class="emoji">🖼</span>UI/UX Preferences</h2>
            </div>
            <div class="section-content">
                <div class="overview-grid">
                    <div class="overview-item">
                        <h4>Design Inspiration</h4>
                        <p>${requirements.uiPreferences.designInspiration}</p>
                    </div>
                    <div class="overview-item">
                        <h4>Theme Mode</h4>
                        <p>${requirements.uiPreferences.themeMode}</p>
                    </div>
                </div>
                
                <div style="margin-top: 12px;">
                    <h4>Animation Preference</h4>
                    <p>${requirements.uiPreferences.animations}</p>
                </div>
                
                <div style="margin-top: 12px;">
                    <h4>Must-Have Components</h4>
                    <div class="component-grid">
                        ${requirements.uiPreferences.mustHaveComponents.map(component => 
                            `<div class="component-item">${component}</div>`
                        ).join('')}
                    </div>
                </div>
            </div>
        </div>

        <!-- Technical Details -->
        <div class="section">
            <div class="section-header">
                <h2><span class="emoji">⚙</span>Technical Specifications</h2>
            </div>
            <div class="section-content">
                <div class="tech-stack">
                    <div class="tech-item">
                        <strong>Hosting Platform</strong>
                        <span>${requirements.technicalDetails.hosting}</span>
                    </div>
                    <div class="tech-item">
                        <strong>Database</strong>
                        <span>${requirements.technicalDetails.database}</span>
                    </div>
                    <div class="tech-item">
                        <strong>Admin Dashboard</strong>
                        <span>${requirements.technicalDetails.adminDashboard ? 'Required' : 'Not Required'}</span>
                    </div>
                    <div class="tech-item">
                        <strong>Payment Processing</strong>
                        <span>${requirements.technicalDetails.payments ? 
                            `Yes - ${requirements.technicalDetails.paymentGateway}` : 'Not Required'}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Timeline & Budget -->
        <div class="section">
            <div class="section-header">
                <h2><span class="emoji">🕒</span>Timeline & Budget</h2>
            </div>
            <div class="section-content">
                <div class="overview-grid">
                    <div class="overview-item">
                        <h4>Project Deadline</h4>
                        <p>${requirements.timeline.deadline}</p>
                    </div>
                    <div class="overview-item">
                        <h4>Development Approach</h4>
                        <p>${requirements.timeline.mvpFirst ? 'MVP First, then scale' : 'Full development'}</p>
                    </div>
                </div>
                
                <div class="budget-highlight">
                    Budget Range: ${requirements.timeline.budget}
                </div>
            </div>
        </div>

        <!-- Project Timeline -->
        <div class="section">
            <div class="section-header">
                <h2><span class="emoji">📆</span>Project Timeline</h2>
            </div>
            <div class="section-content">
                <table class="timeline-table">
                    <thead>
                        <tr>
                            <th>Phase</th>
                            <th>Duration</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${requirements.phases.map(phase => `
                            <tr>
                                <td><strong>${phase.name}</strong></td>
                                <td><span class="phase-duration">${phase.duration}</span></td>
                                <td>${getPhaseDescription(phase.name)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
            <div class="signature-box">
                <strong>Client Approval</strong>
                <div class="signature-line"></div>
                <div>${clientInfo.name}</div>
                <div style="font-size: 8pt; color: #718096;">Date: ___________</div>
            </div>
            <div class="signature-box">
                <strong>Project Manager</strong>
                <div class="signature-line"></div>
                <div>SE Project Hub Team</div>
                <div style="font-size: 8pt; color: #718096;">Date: ___________</div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>SE Project Hub</strong> - Professional Software Development Services</p>
            <p>This document serves as the official project requirements specification.</p>
            <p>Generated automatically on ${currentDate}</p>
        </div>
    </div>
</body>
</html>`;

  return reportHTML;
};

function getPhaseDescription(phaseName: string): string {
  const descriptions: { [key: string]: string } = {
    'Requirement Analysis': 'Detailed analysis of project requirements, stakeholder interviews, and technical feasibility study.',
    'UI/UX Design': 'User interface design, user experience optimization, wireframing, and prototype development.',
    'Development': 'Core application development, feature implementation, and integration of all components.',
    'Testing': 'Comprehensive testing including unit tests, integration tests, and user acceptance testing.',
    'Deployment': 'Production deployment, final configuration, and go-live activities.'
  };
  
  return descriptions[phaseName] || 'Project phase execution and deliverable completion.';
}

export const downloadReportAsPDF = async (
  clientInfo: ClientInfo,
  requirements: ProjectRequirements
): Promise<void> => {
  try {
    console.log('🔄 Starting PDF generation...');
    
    // Create PDF directly using jsPDF with proper A4 formatting
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // Set up PDF styling
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Helper function to add text with word wrapping
    const addText = (text: string, x: number, y: number, options: any = {}) => {
      const fontSize = options.fontSize || 10;
      const maxWidth = options.maxWidth || contentWidth;
      const lineHeight = options.lineHeight || fontSize * 0.35;
      
      pdf.setFontSize(fontSize);
      if (options.bold) pdf.setFont('helvetica', 'bold');
      else pdf.setFont('helvetica', 'normal');
      
      const lines = pdf.splitTextToSize(text, maxWidth);
      
      // Check if we need a new page
      if (y + (lines.length * lineHeight) > pageHeight - margin) {
        pdf.addPage();
        y = margin;
      }
      
      lines.forEach((line: string, index: number) => {
        pdf.text(line, x, y + (index * lineHeight));
      });
      
      return y + (lines.length * lineHeight) + (options.marginBottom || 5);
    };

    // Helper function to add section header
    const addSectionHeader = (title: string, y: number) => {
      // Background rectangle
      pdf.setFillColor(247, 250, 252);
      pdf.rect(margin, y - 5, contentWidth, 12, 'F');
      
      // Border
      pdf.setDrawColor(65, 153, 225);
      pdf.setLineWidth(0.5);
      pdf.line(margin, y - 5, margin + 4, y - 5);
      pdf.line(margin, y - 5, margin, y + 7);
      pdf.line(margin, y + 7, margin + 4, y + 7);
      
      return addText(title, margin + 8, y + 2, { fontSize: 12, bold: true, marginBottom: 8 });
    };

    // Add header
    pdf.setFillColor(49, 130, 176);
    pdf.rect(0, 0, pageWidth, 25, 'F');
    
    pdf.setTextColor(255, 255, 255);
    yPosition = addText('Project Requirements Report', margin, 12, { fontSize: 18, bold: true, marginBottom: 2 });
    yPosition = addText('Comprehensive Project Specification Document', margin, yPosition - 3, { fontSize: 11, marginBottom: 2 });
    
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    yPosition = addText(`Generated on ${currentDate}`, margin, yPosition - 3, { fontSize: 9, marginBottom: 15 });

    // Reset text color
    pdf.setTextColor(45, 55, 72);
    yPosition += 10;

    // Client Information
    pdf.setFillColor(235, 248, 255);
    pdf.rect(margin, yPosition - 5, contentWidth, 25, 'F');
    pdf.setDrawColor(49, 130, 176);
    pdf.setLineWidth(1);
    pdf.line(margin, yPosition - 5, margin, yPosition + 20);
    
    yPosition = addText('Client Information', margin + 5, yPosition, { fontSize: 12, bold: true, marginBottom: 5 });
    yPosition = addText(`Name: ${clientInfo.name}`, margin + 5, yPosition, { fontSize: 10, marginBottom: 3 });
    yPosition = addText(`Company: ${clientInfo.company}`, margin + 5, yPosition, { fontSize: 10, marginBottom: 3 });
    yPosition = addText(`Email: ${clientInfo.email}`, margin + 5, yPosition, { fontSize: 10, marginBottom: 3 });
    yPosition = addText(`Phone: ${clientInfo.phone}`, margin + 5, yPosition, { fontSize: 10, marginBottom: 10 });

    // Project Overview
    yPosition = addSectionHeader('📌 Project Overview', yPosition);
    
    // Project title
    yPosition = addText(requirements.title, margin, yPosition, { fontSize: 14, bold: true, marginBottom: 8 });
    
    yPosition = addText('Problem Statement:', margin, yPosition, { fontSize: 10, bold: true, marginBottom: 2 });
    yPosition = addText(requirements.problemToSolve, margin, yPosition, { fontSize: 10, marginBottom: 5 });
    
    yPosition = addText('Target Users:', margin, yPosition, { fontSize: 10, bold: true, marginBottom: 2 });
    yPosition = addText(requirements.targetUsers, margin, yPosition, { fontSize: 10, marginBottom: 5 });
    
    yPosition = addText('Project Description:', margin, yPosition, { fontSize: 10, bold: true, marginBottom: 2 });
    yPosition = addText(requirements.description, margin, yPosition, { fontSize: 10, marginBottom: 5 });
    
    yPosition = addText('Main Goals:', margin, yPosition, { fontSize: 10, bold: true, marginBottom: 2 });
    yPosition = addText(requirements.goals, margin, yPosition, { fontSize: 10, marginBottom: 10 });

    // Core Requirements
    yPosition = addSectionHeader('🧱 Core Requirements', yPosition);
    yPosition = addText('Main Features:', margin, yPosition, { fontSize: 10, bold: true, marginBottom: 3 });
    
    requirements.coreFeatures.forEach(feature => {
      yPosition = addText(`✓ ${feature}`, margin + 5, yPosition, { fontSize: 9, marginBottom: 2 });
    });
    yPosition += 5;

    // Data Requirements
    yPosition = addSectionHeader('📋 Data Requirements', yPosition);
    yPosition = addText('Required Data Fields:', margin, yPosition, { fontSize: 10, bold: true, marginBottom: 3 });
    
    requirements.dataFields.forEach(field => {
      yPosition = addText(`• ${field}`, margin + 5, yPosition, { fontSize: 9, marginBottom: 2 });
    });
    
    yPosition = addText('Admin Access:', margin, yPosition + 3, { fontSize: 10, bold: true, marginBottom: 2 });
    yPosition = addText(requirements.adminAccess, margin, yPosition, { fontSize: 10, marginBottom: 5 });
    
    yPosition = addText('File Upload Requirements:', margin, yPosition, { fontSize: 10, bold: true, marginBottom: 2 });
    yPosition = addText(requirements.fileUploads, margin, yPosition, { fontSize: 10, marginBottom: 10 });

    // UI/UX Preferences
    yPosition = addSectionHeader('🖼 UI/UX Preferences', yPosition);
    
    yPosition = addText('Design Inspiration:', margin, yPosition, { fontSize: 10, bold: true, marginBottom: 2 });
    yPosition = addText(requirements.uiPreferences.designInspiration, margin, yPosition, { fontSize: 10, marginBottom: 5 });
    
    yPosition = addText('Theme Mode:', margin, yPosition, { fontSize: 10, bold: true, marginBottom: 2 });
    yPosition = addText(requirements.uiPreferences.themeMode, margin, yPosition, { fontSize: 10, marginBottom: 5 });
    
    yPosition = addText('Animation Preference:', margin, yPosition, { fontSize: 10, bold: true, marginBottom: 2 });
    yPosition = addText(requirements.uiPreferences.animations, margin, yPosition, { fontSize: 10, marginBottom: 5 });
    
    yPosition = addText('Must-Have Components:', margin, yPosition, { fontSize: 10, bold: true, marginBottom: 3 });
    requirements.uiPreferences.mustHaveComponents.forEach(component => {
      yPosition = addText(`• ${component}`, margin + 5, yPosition, { fontSize: 9, marginBottom: 2 });
    });
    yPosition += 5;

    // Technical Specifications
    yPosition = addSectionHeader('⚙ Technical Specifications', yPosition);
    
    yPosition = addText(`Hosting Platform: ${requirements.technicalDetails.hosting}`, margin, yPosition, { fontSize: 10, marginBottom: 3 });
    yPosition = addText(`Database: ${requirements.technicalDetails.database}`, margin, yPosition, { fontSize: 10, marginBottom: 3 });
    yPosition = addText(`Admin Dashboard: ${requirements.technicalDetails.adminDashboard ? 'Required' : 'Not Required'}`, margin, yPosition, { fontSize: 10, marginBottom: 3 });
    yPosition = addText(`Payment Processing: ${requirements.technicalDetails.payments ? `Yes - ${requirements.technicalDetails.paymentGateway}` : 'Not Required'}`, margin, yPosition, { fontSize: 10, marginBottom: 10 });

    // Timeline & Budget
    yPosition = addSectionHeader('🕒 Timeline & Budget', yPosition);
    
    yPosition = addText(`Project Deadline: ${requirements.timeline.deadline}`, margin, yPosition, { fontSize: 10, marginBottom: 3 });
    yPosition = addText(`Development Approach: ${requirements.timeline.mvpFirst ? 'MVP First, then scale' : 'Full development'}`, margin, yPosition, { fontSize: 10, marginBottom: 5 });
    
    // Budget highlight
    pdf.setFillColor(254, 215, 215);
    pdf.rect(margin, yPosition - 2, contentWidth, 8, 'F');
    yPosition = addText(`Budget Range: ${requirements.timeline.budget}`, margin + 5, yPosition + 2, { fontSize: 10, bold: true, marginBottom: 10 });

    // Project Timeline
    yPosition = addSectionHeader('📆 Project Timeline', yPosition);
    
    requirements.phases.forEach(phase => {
      yPosition = addText(`${phase.name}: ${phase.duration}`, margin, yPosition, { fontSize: 10, bold: true, marginBottom: 2 });
      yPosition = addText(getPhaseDescription(phase.name), margin + 5, yPosition, { fontSize: 9, marginBottom: 5 });
    });

    // Add signature section on new page if needed
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = margin;
    }

    yPosition += 20;
    
    // Signature boxes
    pdf.setDrawColor(203, 213, 224);
    pdf.setLineWidth(0.5);
    
    // Client signature
    pdf.rect(margin, yPosition, (contentWidth / 2) - 5, 25);
    yPosition = addText('Client Approval', margin + 5, yPosition + 8, { fontSize: 10, bold: true, marginBottom: 8 });
    yPosition = addText(clientInfo.name, margin + 5, yPosition + 5, { fontSize: 10, marginBottom: 3 });
    addText('Date: ___________', margin + 5, yPosition + 3, { fontSize: 9 });
    
    // Project manager signature
    pdf.rect(margin + (contentWidth / 2) + 5, yPosition - 20, (contentWidth / 2) - 5, 25);
    addText('Project Manager', margin + (contentWidth / 2) + 10, yPosition - 12, { fontSize: 10, bold: true, marginBottom: 8 });
    addText('SE Project Hub Team', margin + (contentWidth / 2) + 10, yPosition - 3, { fontSize: 10, marginBottom: 3 });
    addText('Date: ___________', margin + (contentWidth / 2) + 10, yPosition, { fontSize: 9 });

    // Footer
    yPosition = pageHeight - 20;
    pdf.setDrawColor(226, 232, 240);
    pdf.line(margin, yPosition - 5, pageWidth - margin, yPosition - 5);
    
    yPosition = addText('SE Project Hub - Professional Software Development Services', margin, yPosition, { fontSize: 8, marginBottom: 2 });
    yPosition = addText('This document serves as the official project requirements specification.', margin, yPosition, { fontSize: 8, marginBottom: 2 });
    addText(`Generated automatically on ${currentDate}`, margin, yPosition, { fontSize: 8 });

    // Generate filename and save
    const filename = `${requirements.title.replace(/\s+/g, '_')}_Requirements_Report.pdf`;
    
    console.log('💾 Saving PDF file...');
    pdf.save(filename);
    
    console.log('✅ PDF generated successfully!');
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    throw new Error('Failed to generate PDF report. Please try again.');
  }
};

export const downloadReportAsHTML = (
  clientInfo: ClientInfo,
  requirements: ProjectRequirements
): void => {
  try {
    const reportHTML = generateProjectRequirementsReport(clientInfo, requirements);
    
    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${requirements.title.replace(/\s+/g, '_')}_Requirements_Report.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading HTML report:', error);
    throw new Error('Failed to download HTML report');
  }
};
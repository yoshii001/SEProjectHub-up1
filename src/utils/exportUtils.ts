export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle dates, objects, and strings with commas
        if (value instanceof Date) {
          return `"${value.toISOString()}"`;
        }
        if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value)}"`;
        }
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = async (data: any[], filename: string, title: string) => {
  // This is a simplified PDF export. In a real app, you'd use a library like jsPDF
  const content = `
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #3B82F6; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f8f9fa; font-weight: bold; }
          tr:nth-child(even) { background-color: #f8f9fa; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        <table>
          <thead>
            <tr>
              ${Object.keys(data[0] || {}).map(key => `<th>${key}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${Object.values(row).map(value => `<td>${value}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }
};

export const formatDataForExport = (data: any[], type: 'clients' | 'projects' | 'meetings') => {
  return data.map(item => {
    const formatted: any = {};
    
    switch (type) {
      case 'clients':
        formatted.Name = item.name;
        formatted.Email = item.email;
        formatted.Phone = item.phone;
        formatted.Company = item.company;
        formatted.Category = item.category;
        formatted.Status = item.status;
        formatted['Created Date'] = new Date(item.createdAt).toLocaleDateString();
        break;
        
      case 'projects':
        formatted.Title = item.title;
        formatted.Description = item.description;
        formatted.Status = item.status;
        formatted.Priority = item.priority;
        formatted.Progress = `${item.progress}%`;
        formatted.Budget = `$${item.budget.toLocaleString()}`;
        formatted['Start Date'] = new Date(item.startDate).toLocaleDateString();
        formatted['End Date'] = new Date(item.endDate).toLocaleDateString();
        formatted['Created Date'] = new Date(item.createdAt).toLocaleDateString();
        break;
        
      case 'meetings':
        formatted.Title = item.title;
        formatted.Description = item.description;
        formatted.Status = item.status;
        formatted.Duration = `${item.duration} minutes`;
        formatted.Date = new Date(item.date).toLocaleDateString();
        formatted.Time = new Date(item.date).toLocaleTimeString();
        formatted['Meeting URL'] = item.meetingUrl || 'N/A';
        formatted['Created Date'] = new Date(item.createdAt).toLocaleDateString();
        break;
    }
    
    return formatted;
  });
};
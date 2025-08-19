export interface ExportData {
  title: string
  headers: string[]
  data: any[]
  summary?: { label: string; value: string | number }[]
}

export const exportToExcel = (exportData: ExportData) => {
  const { title, headers, data, summary } = exportData

  // Create CSV content
  let csvContent = `${title}\n\n`

  // Add headers
  csvContent += headers.join(",") + "\n"

  // Add data rows
  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header.toLowerCase().replace(/\s+/g, "_")]
      return typeof value === "string" ? `"${value}"` : value || ""
    })
    csvContent += values.join(",") + "\n"
  })

  // Add summary if provided
  if (summary && summary.length > 0) {
    csvContent += "\nResumen:\n"
    summary.forEach((item) => {
      csvContent += `${item.label},${item.value}\n`
    })
  }

  // Create and download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const exportToPDF = (exportData: ExportData) => {
  const { title, headers, data, summary } = exportData

  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          color: #333;
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }
        .date { 
          text-align: right; 
          margin-bottom: 20px; 
          color: #666;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 30px;
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left; 
        }
        th { 
          background-color: #f2f2f2; 
          font-weight: bold;
        }
        tr:nth-child(even) { 
          background-color: #f9f9f9; 
        }
        .summary { 
          margin-top: 30px; 
          padding: 15px; 
          background-color: #f5f5f5; 
          border-radius: 5px;
        }
        .summary h3 { 
          margin-top: 0; 
          color: #333;
        }
        .summary-item { 
          display: flex; 
          justify-content: space-between; 
          margin: 5px 0;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
      </div>
      <div class="date">
        Generado el: ${new Date().toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
      <table>
        <thead>
          <tr>
            ${headers.map((header) => `<th>${header}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (row) => `
            <tr>
              ${headers
                .map((header) => {
                  const value = row[header.toLowerCase().replace(/\s+/g, "_")]
                  return `<td>${value || ""}</td>`
                })
                .join("")}
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
      ${
        summary && summary.length > 0
          ? `
        <div class="summary">
          <h3>Resumen</h3>
          ${summary
            .map(
              (item) => `
            <div class="summary-item">
              <span>${item.label}:</span>
              <strong>${item.value}</strong>
            </div>
          `,
            )
            .join("")}
        </div>
      `
          : ""
      }
    </body>
    </html>
  `

  // Open in new window and trigger print
  const printWindow = window.open("", "_blank")
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }
}

export const generateFinancialReport = (
  gastos: any[],
  ingresos: any[],
  nominas: any[],
  startDate: string,
  endDate: string,
) => {
  const totalGastos = gastos.reduce((sum, gasto) => sum + gasto.monto, 0)
  const totalIngresos = ingresos.reduce((sum, ingreso) => sum + ingreso.monto, 0)
  const totalNominas = nominas.reduce((sum, nomina) => sum + nomina.monto_total, 0)
  const beneficio = totalIngresos - totalGastos - totalNominas

  return {
    title: `Reporte Financiero (${startDate} - ${endDate})`,
    summary: [
      { label: "Total Ingresos", value: `€${totalIngresos.toFixed(2)}` },
      { label: "Total Gastos", value: `€${totalGastos.toFixed(2)}` },
      { label: "Total Nóminas", value: `€${totalNominas.toFixed(2)}` },
      { label: "Beneficio Neto", value: `€${beneficio.toFixed(2)}` },
      {
        label: "Margen de Beneficio",
        value: `${totalIngresos > 0 ? ((beneficio / totalIngresos) * 100).toFixed(2) : 0}%`,
      },
    ],
    gastos,
    ingresos,
    nominas,
  }
}

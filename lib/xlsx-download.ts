import * as XLSX from "xlsx"

/**
 * Creates a beautifully formatted Excel workbook with professional styling
 */
export function createBeautifulWorkbook(data: any[], sheetName: string, title?: string) {
  const wb = XLSX.utils.book_new()

  // Create worksheet with extra rows for title and formatting
  const wsData: any[][] = []

  // Add title row if provided
  if (title) {
    wsData.push([title])
    wsData.push([]) // Empty row for spacing
  }

  // Add headers
  const headers = Object.keys(data[0] || {})
  wsData.push(headers)

  // Add data rows
  data.forEach((row) => {
    wsData.push(headers.map((header) => row[header] || ""))
  })

  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Set column widths for better readability
  const colWidths = [
    { wch: 12 }, // 공종
    { wch: 30 }, // EN
    { wch: 30 }, // KR
    { wch: 45 }, // 설명
  ]
  ws["!cols"] = colWidths

  // Apply styling to cells
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1")

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
      if (!ws[cellAddress]) continue

      // Initialize cell style
      ws[cellAddress].s = {}

      // Title row styling (if exists)
      if (title && R === 0) {
        ws[cellAddress].s = {
          font: { bold: true, sz: 16, color: { rgb: "0047AB" } },
          alignment: { horizontal: "center", vertical: "center" },
          fill: { fgColor: { rgb: "F0F8FF" } },
          border: {
            top: { style: "thick", color: { rgb: "0047AB" } },
            bottom: { style: "thick", color: { rgb: "0047AB" } },
            left: { style: "thick", color: { rgb: "0047AB" } },
            right: { style: "thick", color: { rgb: "0047AB" } },
          },
        }
      }

      // Header row styling
      else if ((title && R === 2) || (!title && R === 0)) {
        ws[cellAddress].s = {
          font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
          alignment: { horizontal: "center", vertical: "center" },
          fill: { fgColor: { rgb: "0047AB" } },
          border: {
            top: { style: "medium", color: { rgb: "000000" } },
            bottom: { style: "medium", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
          },
        }
      }

      // Data rows styling
      else if ((title && R > 2) || (!title && R > 0)) {
        const isEvenRow = (title && R % 2 === 1) || (!title && R % 2 === 1)
        ws[cellAddress].s = {
          font: { sz: 11 },
          alignment: { horizontal: "left", vertical: "center", wrapText: true },
          fill: { fgColor: { rgb: isEvenRow ? "F8F9FA" : "FFFFFF" } },
          border: {
            top: { style: "thin", color: { rgb: "E0E0E0" } },
            bottom: { style: "thin", color: { rgb: "E0E0E0" } },
            left: { style: "thin", color: { rgb: "E0E0E0" } },
            right: { style: "thin", color: { rgb: "E0E0E0" } },
          },
        }

        // Special styling for discipline column (first column)
        if (C === 0) {
          ws[cellAddress].s.alignment = { horizontal: "center", vertical: "center" }
          ws[cellAddress].s.font = { sz: 11, bold: true }
          ws[cellAddress].s.fill = { fgColor: { rgb: "E6F0FF" } }
        }
      }
    }
  }

  // Merge title cell across all columns if title exists
  if (title && range.e.c > 0) {
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: range.e.c } }]
  }

  // Set row heights for better appearance
  ws["!rows"] = []
  for (let i = 0; i <= range.e.r; i++) {
    if (title && i === 0) {
      ws["!rows"][i] = { hpt: 30 } // Title row height
    } else if ((title && i === 2) || (!title && i === 0)) {
      ws["!rows"][i] = { hpt: 25 } // Header row height
    } else {
      ws["!rows"][i] = { hpt: 20 } // Data row height
    }
  }

  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  return wb
}

/**
 * Triggers a browser download for the given workbook.
 * Works in any browser environment without relying on fs/Deno APIs.
 */
export function downloadWorkbook(wb: XLSX.WorkBook, filename: string) {
  /* create an ArrayBuffer */
  const wbArray: ArrayBuffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
  }) as ArrayBuffer

  /* wrap in a Blob and trigger download */
  const blob = new Blob([wbArray], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/**
 * Creates a beautiful template file for users to download and fill
 */
export function createTemplateWorkbook() {
  const templateData = [
    {
      공종: "Gen",
      EN: "Project Management",
      KR: "프로젝트 관리",
      설명: "프로젝트 전반적인 관리 업무",
    },
    {
      공종: "Arch",
      EN: "Building Design",
      KR: "건물 설계",
      설명: "건축물의 전반적인 설계",
    },
    {
      공종: "Elec",
      EN: "Power Distribution",
      KR: "전력 분배",
      설명: "전력을 각 구역으로 분배하는 시스템",
    },
  ]

  const wb = createBeautifulWorkbook(templateData, "용어 템플릿", "SAMOO 하이테크 1본부 - 한영 기술용어집 템플릿")

  // Add instructions sheet
  const instructionsData = [
    ["사용 방법"],
    [""],
    ["1. 공종 열에는 다음 약어 중 하나를 입력하세요:"],
    ["   • Gen: 프로젝트 일반 용어"],
    ["   • Arch: Architecture (건축)"],
    ["   • Elec: Electrical (전기)"],
    ["   • Piping: Piping (배관)"],
    ["   • Civil: Civil (토목)"],
    ["   • I&C: Instrument & Control (제어)"],
    ["   • FP: Fire Protection (소방)"],
    ["   • HVAC: HVAC (공조)"],
    ["   • Struct: Structure (구조)"],
    ["   • Cell: Cell (배터리)"],
    [""],
    ["2. EN 열에는 영어 용어를 입력하세요."],
    [""],
    ["3. KR 열에는 한국어 용어를 입력하세요."],
    [""],
    ["4. 설명 열에는 용어에 대한 설명을 입력하세요 (선택사항)."],
    [""],
    ["5. 작성 완료 후 파일을 저장하고 웹사이트에서 업로드하세요."],
    [""],
    ["주의사항:"],
    ["• 첫 번째 행(헤더)은 삭제하지 마세요."],
    ["• 공종 약어는 정확히 입력해야 합니다."],
    ["• 영어와 한국어 용어는 필수 입력 항목입니다."],
  ]

  const instructionsWs = XLSX.utils.aoa_to_sheet(instructionsData)

  // Style the instructions sheet
  const instrRange = XLSX.utils.decode_range(instructionsWs["!ref"] || "A1")

  // Set column width
  instructionsWs["!cols"] = [{ wch: 60 }]

  // Style cells
  for (let R = instrRange.s.r; R <= instrRange.e.r; ++R) {
    const cellAddress = XLSX.utils.encode_cell({ r: R, c: 0 })
    if (!instructionsWs[cellAddress]) continue

    instructionsWs[cellAddress].s = {}

    // Title styling
    if (R === 0) {
      instructionsWs[cellAddress].s = {
        font: { bold: true, sz: 14, color: { rgb: "0047AB" } },
        alignment: { horizontal: "center", vertical: "center" },
        fill: { fgColor: { rgb: "F0F8FF" } },
      }
    }
    // Section headers
    else if (
      instructionsWs[cellAddress].v &&
      typeof instructionsWs[cellAddress].v === "string" &&
      (instructionsWs[cellAddress].v.includes("1.") || instructionsWs[cellAddress].v.includes("주의사항:"))
    ) {
      instructionsWs[cellAddress].s = {
        font: { bold: true, sz: 12, color: { rgb: "0047AB" } },
        alignment: { horizontal: "left", vertical: "center" },
      }
    }
    // Regular text
    else {
      instructionsWs[cellAddress].s = {
        font: { sz: 11 },
        alignment: { horizontal: "left", vertical: "center", wrapText: true },
      }
    }
  }

  XLSX.utils.book_append_sheet(wb, instructionsWs, "사용방법")

  return wb
}

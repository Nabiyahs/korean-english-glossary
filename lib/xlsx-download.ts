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
    { wch: 15 }, // 공종
    { wch: 35 }, // EN
    { wch: 35 }, // KR
    { wch: 50 }, // 설명
  ]
  ws["!cols"] = colWidths

  // Apply styling to cells
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1")

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
      if (!ws[cellAddress]) {
        ws[cellAddress] = { t: "s", v: "" }
      }

      // Title row styling (if exists)
      if (title && R === 0) {
        ws[cellAddress].s = {
          font: {
            bold: true,
            sz: 18,
            color: { rgb: "0047AB" },
            name: "Arial",
          },
          alignment: {
            horizontal: "center",
            vertical: "center",
            wrapText: false,
          },
          fill: {
            patternType: "solid",
            fgColor: { rgb: "E6F0FF" },
          },
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
          font: {
            bold: true,
            sz: 12,
            color: { rgb: "FFFFFF" },
            name: "Arial",
          },
          alignment: {
            horizontal: "center",
            vertical: "center",
            wrapText: false,
          },
          fill: {
            patternType: "solid",
            fgColor: { rgb: "0047AB" },
          },
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
        const isEvenRow = (title && (R - 3) % 2 === 0) || (!title && (R - 1) % 2 === 0)

        ws[cellAddress].s = {
          font: {
            sz: 11,
            name: "Arial",
            color: { rgb: "000000" },
          },
          alignment: {
            horizontal: C === 0 ? "center" : "left",
            vertical: "center",
            wrapText: true,
          },
          fill: {
            patternType: "solid",
            fgColor: { rgb: isEvenRow ? "F8F9FA" : "FFFFFF" },
          },
          border: {
            top: { style: "thin", color: { rgb: "D0D0D0" } },
            bottom: { style: "thin", color: { rgb: "D0D0D0" } },
            left: { style: "thin", color: { rgb: "D0D0D0" } },
            right: { style: "thin", color: { rgb: "D0D0D0" } },
          },
        }

        // Special styling for discipline column (first column)
        if (C === 0) {
          ws[cellAddress].s.font.bold = true
          ws[cellAddress].s.fill = {
            patternType: "solid",
            fgColor: { rgb: "E6F0FF" },
          }
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
      ws["!rows"][i] = { hpt: 35 } // Title row height
    } else if (title && i === 1) {
      ws["!rows"][i] = { hpt: 15 } // Empty row height
    } else if ((title && i === 2) || (!title && i === 0)) {
      ws["!rows"][i] = { hpt: 25 } // Header row height
    } else {
      ws["!rows"][i] = { hpt: 22 } // Data row height
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
  /* create an ArrayBuffer with proper options for styling */
  const wbArray: ArrayBuffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
    cellStyles: true, // Enable cell styling
    sheetStubs: false,
    bookSST: false,
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

  // Add instructions sheet with styling
  const instructionsData = [
    ["📋 SAMOO 하이테크 1본부 - 용어집 업로드 가이드"],
    [""],
    ["✅ 사용 방법"],
    [""],
    ["1️⃣ 공종 열에는 다음 약어 중 하나를 정확히 입력하세요:"],
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
    ["2️⃣ EN 열에는 영어 용어를 입력하세요."],
    [""],
    ["3️⃣ KR 열에는 한국어 용어를 입력하세요."],
    [""],
    ["4️⃣ 설명 열에는 용어에 대한 설명을 입력하세요 (선택사항)."],
    [""],
    ["5️⃣ 작성 완료 후 파일을 저장하고 웹사이트에서 업로드하세요."],
    [""],
    ["⚠️ 주의사항:"],
    ["• 첫 번째 행(헤더)은 절대 삭제하지 마세요."],
    ["• 공종 약어는 대소문자를 구분하여 정확히 입력해야 합니다."],
    ["• 영어와 한국어 용어는 필수 입력 항목입니다."],
    ["• 중복된 용어는 자동으로 건너뛰어집니다."],
    [""],
    ["💡 팁: 이 템플릿을 참고하여 용어를 추가하세요!"],
  ]

  const instructionsWs = XLSX.utils.aoa_to_sheet(instructionsData)

  // Style the instructions sheet
  const instrRange = XLSX.utils.decode_range(instructionsWs["!ref"] || "A1")

  // Set column width
  instructionsWs["!cols"] = [{ wch: 70 }]

  // Style cells
  for (let R = instrRange.s.r; R <= instrRange.e.r; ++R) {
    const cellAddress = XLSX.utils.encode_cell({ r: R, c: 0 })
    if (!instructionsWs[cellAddress]) {
      instructionsWs[cellAddress] = { t: "s", v: "" }
    }

    // Title styling
    if (R === 0) {
      instructionsWs[cellAddress].s = {
        font: {
          bold: true,
          sz: 16,
          color: { rgb: "0047AB" },
          name: "Arial",
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
          wrapText: true,
        },
        fill: {
          patternType: "solid",
          fgColor: { rgb: "E6F0FF" },
        },
        border: {
          top: { style: "medium", color: { rgb: "0047AB" } },
          bottom: { style: "medium", color: { rgb: "0047AB" } },
          left: { style: "medium", color: { rgb: "0047AB" } },
          right: { style: "medium", color: { rgb: "0047AB" } },
        },
      }
    }
    // Section headers
    else if (
      instructionsWs[cellAddress].v &&
      typeof instructionsWs[cellAddress].v === "string" &&
      (instructionsWs[cellAddress].v.includes("사용 방법") ||
        instructionsWs[cellAddress].v.includes("주의사항:") ||
        instructionsWs[cellAddress].v.includes("팁:"))
    ) {
      instructionsWs[cellAddress].s = {
        font: {
          bold: true,
          sz: 13,
          color: { rgb: "0047AB" },
          name: "Arial",
        },
        alignment: {
          horizontal: "left",
          vertical: "center",
          wrapText: true,
        },
        fill: {
          patternType: "solid",
          fgColor: { rgb: "F0F8FF" },
        },
      }
    }
    // Regular text
    else {
      instructionsWs[cellAddress].s = {
        font: {
          sz: 11,
          name: "Arial",
          color: { rgb: "000000" },
        },
        alignment: {
          horizontal: "left",
          vertical: "center",
          wrapText: true,
        },
      }
    }
  }

  // Set row heights for instructions
  instructionsWs["!rows"] = []
  for (let i = 0; i <= instrRange.e.r; i++) {
    if (i === 0) {
      instructionsWs["!rows"][i] = { hpt: 30 } // Title row
    } else {
      instructionsWs["!rows"][i] = { hpt: 18 } // Regular rows
    }
  }

  XLSX.utils.book_append_sheet(wb, instructionsWs, "📋 사용방법")

  return wb
}

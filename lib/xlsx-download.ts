import * as XLSX from "xlsx"

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

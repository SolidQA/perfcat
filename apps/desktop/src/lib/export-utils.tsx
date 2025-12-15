import { save } from "@tauri-apps/plugin-dialog"
import { writeFile, writeTextFile } from "@tauri-apps/plugin-fs"
import html2canvas from "html2canvas-pro"
import { jsPDF } from "jspdf"
import type { ReportChartData } from "@/types/report"

/**
 * 导出CSV文件
 */
export async function exportToCSV(chartData: ReportChartData, filename: string) {
  if (chartData.length === 0) {
    throw new Error("没有数据可导出")
  }

  // 获取所有列名
  const headers = Object.keys(chartData[0])

  // 创建CSV内容
  const csvRows: string[] = []

  // 添加BOM以支持中文
  csvRows.push("\ufeff")

  // 添加表头
  csvRows.push(headers.map(h => `"${h}"`).join(","))

  // 添加数据行
  for (const row of chartData) {
    const values = headers.map(header => {
      const value = row[header]
      // 处理包含逗号、引号或换行符的值
      if (value === null || value === undefined) {
        return '""'
      }
      const stringValue = String(value)
      if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return `"${stringValue}"`
    })
    csvRows.push(values.join(","))
  }

  // 使用Tauri dialog保存文件
  const csvContent = csvRows.join("\n")
  const filePath = await save({
    defaultPath: `${filename}.csv`,
    filters: [
      {
        name: "CSV",
        extensions: ["csv"],
      },
    ],
  })

  if (filePath) {
    await writeTextFile(filePath, csvContent)
  } else {
    throw new Error("用户取消了文件保存")
  }
}

/**
 * 在克隆的文档中替换所有样式表中的 oklch 颜色
 */
function replaceOklchInStylesheets(clonedDoc: Document): void {
  // 获取原始文档的计算样式
  const root = document.documentElement
  const computedStyle = window.getComputedStyle(root)

  // 获取所有 CSS 变量的 RGB 值
  const colorMap = new Map<string, string>()
  const cssVars = [
    "--background",
    "--foreground",
    "--card",
    "--card-foreground",
    "--popover",
    "--popover-foreground",
    "--primary",
    "--primary-foreground",
    "--secondary",
    "--secondary-foreground",
    "--muted",
    "--muted-foreground",
    "--accent",
    "--accent-foreground",
    "--destructive",
    "--border",
    "--input",
    "--ring",
    "--chart-1",
    "--chart-2",
    "--chart-3",
    "--chart-4",
    "--chart-5",
  ]

  // 创建临时元素来获取计算后的 RGB 值
  const tempEl = document.createElement("div")
  tempEl.style.position = "absolute"
  tempEl.style.visibility = "hidden"
  document.body.appendChild(tempEl)

  try {
    for (const variable of cssVars) {
      const value = computedStyle.getPropertyValue(variable).trim()
      if (value && (value.includes("oklch") || value.includes("oklab"))) {
        tempEl.style.setProperty(variable, value)
        const tempComputed = window.getComputedStyle(tempEl)
        const rgbValue = tempComputed.getPropertyValue(variable)

        if (
          rgbValue &&
          !rgbValue.includes("oklch") &&
          !rgbValue.includes("oklab") &&
          rgbValue !== "rgba(0, 0, 0, 0)"
        ) {
          colorMap.set(value, rgbValue)
        }
      }
    }
  } finally {
    document.body.removeChild(tempEl)
  }

  // 处理克隆文档中的所有样式表
  const styleSheets = clonedDoc.styleSheets
  for (let i = 0; i < styleSheets.length; i++) {
    const sheet = styleSheets[i]
    try {
      const rules = Array.from(sheet.cssRules || [])
      for (const rule of rules) {
        if (rule instanceof CSSStyleRule) {
          let cssText = rule.cssText

          // 替换所有 oklch 颜色
          for (const [oklchValue, rgbValue] of colorMap) {
            cssText = cssText.replace(
              new RegExp(oklchValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
              rgbValue
            )
          }

          // 更新规则的 CSS 文本
          if (cssText !== rule.cssText) {
            rule.cssText = cssText
          }
        }
      }
    } catch {
      // 跨域样式表可能无法访问，忽略
    }
  }

  // 注入覆盖样式，确保所有 oklch 值都被替换
  if (colorMap.size > 0) {
    const style = clonedDoc.createElement("style")
    const rules: string[] = []

    for (const [oklchValue, rgbValue] of colorMap) {
      // 创建 CSS 规则来覆盖所有使用该颜色的地方
      rules.push(
        `* { ${oklchValue
          .replace("oklch", "")
          .replace(/\([^)]+\)/, "")
          .trim()}: ${rgbValue} !important; }`
      )
    }

    style.textContent = rules.join("\n")
    clonedDoc.head.appendChild(style)
  }
}

/**
 * 导出PDF文件
 * 使用 html2canvas + jspdf 生成PDF，与CSV导出一样的交互体验
 */
export async function exportToPDF(element: HTMLElement, filename: string): Promise<void> {
  if (!element) {
    throw new Error("没有可导出的内容")
  }

  try {
    // 使用 html2canvas 将DOM转换为canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      allowTaint: false,
      onclone: clonedDoc => {
        // 在克隆的文档中替换样式表中的 oklch 颜色
        replaceOklchInStylesheets(clonedDoc)

        // 隐藏不需要打印的元素（只在克隆文档中）
        const clonedNoPrint = clonedDoc.querySelectorAll(".no-print")
        clonedNoPrint.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.display = "none"
          }
        })
      },
    })

    // 将canvas转换为图片数据
    const imgData = canvas.toDataURL("image/png")

    // 创建PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = canvas.width
    const imgHeight = canvas.height

    // 计算缩放比例，确保图片适合PDF页面宽度
    const ratio = pdfWidth / imgWidth
    const imgScaledWidth = pdfWidth
    const imgScaledHeight = imgHeight * ratio

    // 计算水平居中位置
    const xOffset = 0

    // 如果内容超过一页，需要分页
    let heightLeft = imgScaledHeight
    let position = 0

    // 添加第一页
    pdf.addImage(imgData, "PNG", xOffset, position, imgScaledWidth, imgScaledHeight)
    heightLeft -= pdfHeight

    // 如果内容超过一页，添加更多页面
    while (heightLeft > 0) {
      position = position - pdfHeight
      pdf.addPage()
      pdf.addImage(imgData, "PNG", xOffset, position, imgScaledWidth, imgScaledHeight)
      heightLeft -= pdfHeight
    }

    // 生成PDF二进制数据
    const pdfBlob = pdf.output("blob")
    const pdfArrayBuffer = await pdfBlob.arrayBuffer()
    const pdfUint8Array = new Uint8Array(pdfArrayBuffer)

    // 使用Tauri dialog保存文件
    const filePath = await save({
      defaultPath: `${filename}.pdf`,
      filters: [
        {
          name: "PDF",
          extensions: ["pdf"],
        },
      ],
    })

    if (filePath) {
      await writeFile(filePath, pdfUint8Array)
    } else {
      throw new Error("用户取消了文件保存")
    }
  } catch (error) {
    // 重新抛出错误，让调用方处理
    throw error
  }
}

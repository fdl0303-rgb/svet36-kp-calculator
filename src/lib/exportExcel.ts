import ExcelJS from 'exceljs'
import logoInline from '../assets/logo.png?inline'
import type { Company, Proposal } from '../types'
import { discountAmount, itemSubtotal, itemsTotal } from './calc'
import { addDaysISO, daysWord, formatDate, formatDateShort, num } from './format'

const BLACK = 'FF141416'
const RED = 'FFD81F27'
const GREY = 'FF5B5B63'
const HEAD_FILL = 'FFF1F1F2'
const SOFT_FILL = 'FFFAFAFB'

const MONEY_FMT = '# ##0.00" ₽"'
const QTY_FMT = '# ##0.##'

export async function exportExcel(proposal: Proposal, company: Company): Promise<void> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = company.name
  workbook.lastModifiedBy = company.name
  workbook.title = `Коммерческое предложение № ${proposal.number}`
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Коммерческое предложение', {
    views: [{ showGridLines: false, state: 'frozen', ySplit: 12 }],
    pageSetup: { orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  })

  sheet.columns = [
    { width: 5 },
    { width: 13 },
    { width: 46 },
    { width: 15 },
    { width: 7 },
    { width: 9 },
    { width: 16 },
    { width: 17 },
  ]

  const { client, options, items } = proposal
  const sum = itemsTotal(items)
  const discount = discountAmount(sum, options.discount)
  const grand = Math.round((sum - discount) * 100) / 100
  const validUntil = addDaysISO(proposal.date, options.validDays)

  sheet.mergeCells('A1:H1')
  const logoId = workbook.addImage({ base64: stripDataUrl(logoInline), extension: 'png' })
  sheet.addImage(logoId, { tl: { col: 0.1, row: 0.05 }, ext: { width: 168, height: 48 } })

  sheet.mergeCells('A2:H2')
  const title = sheet.getCell('A2')
  title.value = 'КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ'
  title.font = { name: 'Calibri', size: 20, bold: true, color: { argb: BLACK } }
  title.alignment = { vertical: 'middle' }
  sheet.getRow(2).height = 30

  sheet.mergeCells('A3:C3')
  const number = sheet.getCell('A3')
  number.value = `№ ${proposal.number}`
  number.font = { size: 12, bold: true, color: { argb: RED } }

  sheet.mergeCells('D3:H3')
  const dates = sheet.getCell('D3')
  dates.value = `Дата: ${formatDate(proposal.date)}   •   Действует до: ${formatDateShort(validUntil)}`
  dates.font = { size: 10, color: { argb: GREY } }
  dates.alignment = { horizontal: 'right' }

  sheet.mergeCells('A5:D5')
  const left = sheet.getCell('A5')
  left.value = {
    richText: [
      { text: `${company.name}\n`, font: { bold: true, size: 10 } },
      { text: company.address, font: { size: 9, color: { argb: GREY } } },
      {
        text: company.extraAddress ? `\n${company.extraAddress}` : '',
        font: { size: 9, color: { argb: GREY } },
      },
      { text: `\n${company.hours}`, font: { size: 9, color: { argb: GREY } } },
    ],
  }
  left.alignment = { vertical: 'top', wrapText: true }

  sheet.mergeCells('E5:H5')
  const right = sheet.getCell('E5')
  right.value = {
    richText: [
      { text: `${company.phone}\n`, font: { bold: true, size: 11 } },
      { text: `${company.email}\n`, font: { size: 9, color: { argb: GREY } } },
      { text: `${company.site}\n`, font: { size: 9, color: { argb: GREY } } },
      ...requisiteLines(company).map((line) => ({
        text: `${line}\n`,
        font: { size: 9, color: { argb: GREY } },
      })),
    ],
  }
  right.alignment = { vertical: 'top', horizontal: 'right' }
  sheet.getRow(5).height = 72

  sheet.mergeCells('A6:H6')
  sheet.getRow(6).height = 8

  sheet.mergeCells('A7:D7')
  const clientTitle = sheet.getCell('A7')
  clientTitle.value = 'КЛИЕНТ'
  clientTitle.font = { size: 9, bold: true, color: { argb: GREY } }

  sheet.mergeCells('E7:H7')
  const objectTitle = sheet.getCell('E7')
  objectTitle.value = 'ОБЪЕКТ И УСЛОВИЯ'
  objectTitle.font = { size: 9, bold: true, color: { argb: GREY } }
  objectTitle.alignment = { horizontal: 'right' }

  sheet.mergeCells('A8:D9')
  const clientCell = sheet.getCell('A8')
  clientCell.value = {
    richText: [
      {
        text: `${client.name || 'Клиент'}${client.company ? `, ${client.company}` : ''}\n`,
        font: { bold: true },
      },
      {
        text: [client.phone, client.email, client.address].filter(Boolean).join('\n'),
        font: { color: { argb: GREY } },
      },
    ],
  }
  clientCell.alignment = { vertical: 'top', wrapText: true }

  sheet.mergeCells('E8:H9')
  const objectCell = sheet.getCell('E8')
  objectCell.value = {
    richText: [
      { text: `${client.object || 'Уточняется'}\n`, font: { bold: true } },
      {
        text: [options.delivery, options.payment].filter(Boolean).join('\n'),
        font: { color: { argb: GREY } },
      },
    ],
  }
  objectCell.alignment = { vertical: 'top', horizontal: 'right', wrapText: true }
  sheet.getRow(8).height = 26
  sheet.getRow(9).height = 26

  const headerRowIndex = 11
  const headerRow = sheet.getRow(headerRowIndex)
  headerRow.values = ['№', 'Фото', 'Наименование', 'Артикул', 'Ед.', 'Кол-во', 'Цена за 1 шт', 'Сумма']
  headerRow.height = 26
  headerRow.eachCell((cell) => {
    cell.font = { size: 10, bold: true, color: { argb: BLACK } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEAD_FILL } }
    cell.border = thinBorder()
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
  })

  const firstItemRow = headerRowIndex + 1
  items.forEach((item, index) => {
    const row = sheet.getRow(firstItemRow + index)
    row.height = 76
    row.values = [
      index + 1,
      '',
      item.name || 'Без названия',
      item.sku,
      item.unit,
      item.qty,
      item.price,
      itemSubtotal(item),
    ]
    row.eachCell((cell, col) => {
      cell.font = { size: 10, color: { argb: BLACK } }
      cell.border = thinBorder()
      cell.alignment = {
        vertical: 'middle',
        horizontal: col === 1 || col === 2 || col === 5 ? 'center' : col >= 6 ? 'right' : 'left',
        wrapText: col === 3,
      }
    })
    sheet.getCell(`F${firstItemRow + index}`).numFmt = QTY_FMT
    sheet.getCell(`G${firstItemRow + index}`).numFmt = MONEY_FMT
    sheet.getCell(`H${firstItemRow + index}`).numFmt = MONEY_FMT
    sheet.getCell(`H${firstItemRow + index}`).font = { size: 10, bold: true }

    if (item.note) {
      const nameCell = sheet.getCell(`C${firstItemRow + index}`)
      nameCell.value = {
        richText: [
          { text: `${item.name || 'Без названия'}\n`, font: { bold: true, size: 10 } },
          { text: item.note, font: { size: 9, color: { argb: GREY } } },
        ],
      }
      nameCell.alignment = { vertical: 'middle', wrapText: true }
    }

    if (item.photo) {
      const imageId = workbook.addImage({
        base64: stripDataUrl(item.photo),
        extension: imageExtension(item.photo),
      })
      sheet.addImage(imageId, {
        tl: { col: 1.14, row: firstItemRow + index - 0.92 },
        ext: { width: 80, height: 80 },
        editAs: 'oneCell',
      })
    }
  })

  const lastItemRow = firstItemRow + items.length - 1
  const totalRow = sheet.getRow(lastItemRow + 1)
  totalRow.height = 30
  totalRow.getCell(1).value = 'ИТОГО'
  totalRow.getCell(1).font = { size: 12, bold: true }
  totalRow.getCell(3).value = `Позиций: ${items.length}, всего ${num(
    items.reduce((acc, item) => acc + (Number(item.qty) || 0), 0),
  )} шт.`
  totalRow.getCell(3).font = { size: 10, color: { argb: GREY } }
  const totalFormula = { formula: `SUM(H${firstItemRow}:H${lastItemRow})`, result: sum }
  totalRow.getCell(8).value = totalFormula
  totalRow.getCell(8).numFmt = MONEY_FMT
  totalRow.getCell(8).font = { size: 13, bold: true, color: { argb: RED } }
  totalRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SOFT_FILL } }
    cell.border = thinBorder()
    cell.alignment = { vertical: 'middle' }
  })
  totalRow.getCell(8).alignment = { vertical: 'middle', horizontal: 'right' }

  let cursor = lastItemRow + 3
  const discountRowIndex = discount > 0 ? cursor : 0

  if (discount > 0) {
    const discountRow = sheet.getRow(cursor)
    sheet.mergeCells(`A${cursor}:G${cursor}`)
    discountRow.getCell(1).value = `Скидка ${options.discount}%`
    discountRow.getCell(1).font = { size: 10, color: { argb: GREY } }
    discountRow.getCell(1).alignment = { horizontal: 'right' }
    discountRow.getCell(8).value = -discount
    discountRow.getCell(8).numFmt = MONEY_FMT
    discountRow.getCell(8).font = { size: 10, color: { argb: GREY } }
    cursor += 1
  }

  const grandRow = sheet.getRow(cursor)
  sheet.mergeCells(`A${cursor}:G${cursor}`)
  grandRow.getCell(1).value = 'ИТОГО К ОПЛАТЕ'
  grandRow.getCell(1).font = { size: 13, bold: true }
  grandRow.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' }
  grandRow.getCell(8).value = {
    formula:
      discountRowIndex > 0 ? `H${lastItemRow + 1}-H${discountRowIndex}` : `H${lastItemRow + 1}`,
    result: grand,
  }
  grandRow.getCell(8).numFmt = MONEY_FMT
  grandRow.getCell(8).font = { size: 14, bold: true, color: { argb: RED } }
  grandRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'thick', color: { argb: BLACK } },
      bottom: thinBorder().bottom,
      left: thinBorder().left,
      right: thinBorder().right,
    }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SOFT_FILL } }
  })
  grandRow.height = 32
  cursor += 2

  const notes: string[] = [
    'Цена указана за покупку всех товаров, перечисленных в настоящем предложении.',
    `Предложение действительно ${options.validDays} ${daysWord(options.validDays)} с даты формирования — до ${formatDate(validUntil)}.`,
  ]
  if (options.comment) notes.push(options.comment)
  if (options.manager) notes.push(`Менеджер: ${options.manager}`)

  for (const note of notes) {
    sheet.mergeCells(`A${cursor}:H${cursor}`)
    const cell = sheet.getCell(`A${cursor}`)
    cell.value = note
    cell.font = { size: 10, color: { argb: GREY } }
    cell.alignment = { wrapText: true, vertical: 'top' }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SOFT_FILL } }
    cell.border = thinBorder()
    sheet.getRow(cursor).height = 20
    cursor += 1
  }

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${fileName(proposal)}.xlsx`
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function requisiteLines(company: Company): string[] {
  const lines: string[] = []
  if (company.inn) lines.push(`ИНН ${company.inn}`)
  if (company.kpp) lines.push(`КПП ${company.kpp}`)
  if (company.ogrn) lines.push(`ОГРН ${company.ogrn}`)
  if (company.account) lines.push(`Р/с ${company.account}`)
  if (company.bank) lines.push(`Банк ${company.bank}`)
  if (company.director) lines.push(`Руководитель: ${company.director}`)
  return lines
}

function thinBorder() {
  const side = { style: 'thin' as const, color: { argb: 'FFD9D9DE' } }
  return { top: side, bottom: side, left: side, right: side }
}

function stripDataUrl(dataUrl: string): string {
  const comma = dataUrl.indexOf(',')
  return comma < 0 ? dataUrl : dataUrl.slice(comma + 1)
}

function imageExtension(dataUrl: string): 'png' | 'jpeg' | 'gif' {
  if (/^data:image\/jpe?g/i.test(dataUrl)) return 'jpeg'
  if (/^data:image\/gif/i.test(dataUrl)) return 'gif'
  return 'png'
}

function fileName(proposal: Proposal): string {
  const safe = proposal.number.replace(/[^\wа-яА-ЯёЁ-]+/g, '-')
  return `КП_${safe}_${proposal.date}`
}

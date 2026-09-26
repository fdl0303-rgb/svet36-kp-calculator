import pdfMake from 'pdfmake/build/pdfmake'
import vfs from 'pdfmake/build/vfs_fonts'
import logoInline from '../assets/logo.png?inline'
import type { Company, Proposal } from '../types'
import { discountAmount, itemSubtotal, itemsTotal } from './calc'
import { RUB, addDaysISO, daysWord, formatDate, formatDateShort, num } from './format'

type PdfMakeStatic = {
  fonts?: Record<string, unknown>
  vfs?: Record<string, string>
  addVirtualFileSystem?: (vfs: Record<string, string>) => void
  createPdf: (doc: unknown) => { download: (filename?: string) => void; open: () => void }
}

const pdf = pdfMake as PdfMakeStatic

pdf.addVirtualFileSystem?.(vfs)

const BLACK = '#141416'
const RED = '#d81f27'
const GREY = '#5b5b63'
const LIGHT = '#8a8a93'
const LINE = '#e2e2e6'

const money = (value: number): string =>
  `${new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)} ${RUB}`

export async function exportPdf(proposal: Proposal, company: Company): Promise<void> {
  const { client, options, items } = proposal
  const sum = itemsTotal(items)
  const discount = discountAmount(sum, options.discount)
  const grand = Math.round((sum - discount) * 100) / 100
  const validUntil = addDaysISO(proposal.date, options.validDays)

  const header = (): Content => ({
    columns: [
      {
        width: '*',
        stack: [
          {
            image: 'logo',
            width: 132,
            height: 38,
            margin: [0, 0, 0, 8],
          },
          {
            text: [
              { text: `${company.address}\n`, bold: true },
              company.extraAddress ? `${company.extraAddress}\n` : '',
              { text: company.hours, color: LIGHT },
            ],
            fontSize: 8.5,
            color: GREY,
            lineHeight: 1.35,
          },
        ],
      },
      {
        width: 200,
        stack: [
          {
            text: [
              { text: `${company.phone}\n`, bold: true, fontSize: 11.5, color: BLACK },
              { text: `${company.email}\n`, color: GREY },
              { text: company.site, color: GREY },
            ],
            fontSize: 8.5,
            alignment: 'right',
            lineHeight: 1.4,
          },
        ],
      },
    ],
    margin: [0, 0, 0, 14],
  })

  const requisites: string[] = []
  if (company.inn) requisites.push(`ИНН ${company.inn}`)
  if (company.kpp) requisites.push(`КПП ${company.kpp}`)
  if (company.ogrn) requisites.push(`ОГРН ${company.ogrn}`)
  if (company.account) requisites.push(`Р/с ${company.account}`)
  if (company.bank) requisites.push(`Банк ${company.bank}`)
  if (company.director) requisites.push(`Руководитель: ${company.director}`)

  const doc = {
    pageSize: 'A4',
    pageMargins: [40, 38, 40, 44],
    defaultStyle: { font: 'Roboto', fontSize: 9, color: BLACK },
    images: { logo: logoInline },
    info: {
      title: `Коммерческое предложение № ${proposal.number}`,
      author: company.name,
      subject: `Освещение · ${company.phone}`,
      keywords: 'коммерческое предложение, освещение, свет-36',
    },
    footer: (currentPage: number, pageCount: number) => ({
      columns: [
        {
          text: `КП № ${proposal.number} · ${company.name}`,
          fontSize: 7.5,
          color: LIGHT,
        },
        {
          text: `${currentPage} / ${pageCount}`,
          fontSize: 7.5,
          color: LIGHT,
          alignment: 'right',
        },
      ],
      margin: [40, 12, 40, 0],
    }),
    content: [
      header(),
      {
        columns: [
          {
            stack: [
              {
                text: 'Коммерческое предложение',
                fontSize: 19,
                bold: true,
                characterSpacing: 0.4,
              },
              {
                text: `№ ${proposal.number}`,
                fontSize: 11,
                bold: true,
                color: RED,
                margin: [0, 5, 0, 0],
              },
            ],
          },
          {
            width: 190,
            stack: [
              {
                text: `Дата: ${formatDate(proposal.date)}`,
                fontSize: 9,
                color: GREY,
                alignment: 'right',
              },
              {
                text: [
                  { text: 'Действует до: ', color: GREY },
                  { text: formatDateShort(validUntil), color: RED, bold: true },
                ],
                fontSize: 9,
                alignment: 'right',
                margin: [0, 3, 0, 0],
              },
            ],
          },
        ],
        margin: [0, 0, 0, 12],
      },
      {
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.6, lineColor: BLACK },
        ],
        margin: [0, 0, 0, 12],
      },
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'Кому', fontSize: 7.5, bold: true, color: LIGHT, characterSpacing: 1 },
              {
                text: `${client.name || 'Клиент'}${client.company ? `, ${client.company}` : ''}`,
                fontSize: 10,
                bold: true,
                margin: [0, 3, 0, 0],
              },
              client.phone ? { text: client.phone, fontSize: 8.5, color: GREY } : null,
              client.email ? { text: client.email, fontSize: 8.5, color: GREY } : null,
              client.address ? { text: client.address, fontSize: 8.5, color: GREY } : null,
            ].filter(Boolean) as Content[],
          },
          {
            width: 250,
            stack: [
              { text: 'Объект и условия', fontSize: 7.5, bold: true, color: LIGHT, characterSpacing: 1 },
              {
                text: [
                  { text: `${client.object || 'Уточняется'}\n`, bold: true },
                  { text: options.delivery ? `${options.delivery}\n` : '' },
                  { text: options.payment ?? '' },
                ],
                fontSize: 8.5,
                color: GREY,
                margin: [0, 3, 0, 0],
                lineHeight: 1.4,
              },
            ],
          },
        ],
        margin: [0, 0, 0, 14],
      },
      {
        table: {
          headerRows: 1,
          widths: [22, 88, '*', 32, 38, 62, 66],
          body: [
            [
              { text: '№', alignment: 'center' },
              { text: 'Фото', alignment: 'center' },
              { text: 'Наименование', alignment: 'left' },
              { text: 'Ед.', alignment: 'center' },
              { text: 'Кол-во', alignment: 'right' },
              { text: `Цена, ${RUB}`, alignment: 'right' },
              { text: 'Сумма', alignment: 'right' },
            ],
            ...items.map((item, index) => [
              { text: String(index + 1), alignment: 'center', color: LIGHT },
              item.photo
                ? { image: item.photo, width: 76, height: 76, margin: [0, 2, 0, 2] }
                : {
                    text: String(index + 1),
                    alignment: 'center',
                    color: '#b0b0b8',
                    fontSize: 9,
                  },
              {
                stack: [
                  { text: item.name || 'Без названия', bold: true, fontSize: 9 },
                  item.sku ? { text: `арт. ${item.sku}`, fontSize: 7.5, color: LIGHT } : null,
                  item.note ? { text: item.note, fontSize: 7.5, color: GREY } : null,
                ].filter(Boolean) as Content[],
                margin: [0, 2, 0, 2],
              },
              { text: item.unit, alignment: 'center', color: GREY, fontSize: 8 },
              { text: num(item.qty), alignment: 'right' },
              { text: money(item.price), alignment: 'right' },
              { text: money(itemSubtotal(item)), alignment: 'right', bold: true },
            ]),
          ],
        },
        layout: {
          hLineWidth: (i: number) => (i === 0 ? 0 : 0.5),
          vLineWidth: () => 0.5,
          hLineColor: () => LINE,
          vLineColor: () => LINE,
          paddingTop: () => 6,
          paddingBottom: () => 6,
          paddingLeft: () => 5,
          paddingRight: () => 5,
        },
        fontSize: 8.5,
        margin: [0, 0, 0, 12],
      },
      {
        columns: [
          { text: '', width: '*' },
          {
            width: 240,
            stack: [
              totalRow(`Итого (${items.length} ${itemsWord(items.length)}):`, money(sum)),
              ...(discount > 0
                ? [totalRow(`Скидка ${options.discount}%:`, `− ${money(discount)}`)]
                : []),
              {
                columns: [
                  { text: 'Итого к оплате', bold: true, fontSize: 10, characterSpacing: 0.4 },
                  { text: money(grand), bold: true, fontSize: 14, color: RED, alignment: 'right' },
                ],
                margin: [0, 6, 0, 0],
              },
            ],
          },
        ],
        margin: [0, 0, 0, 10],
      },
      ...(options.comment
        ? [
            {
              text: options.comment,
              fontSize: 8.5,
              color: GREY,
              lineHeight: 1.45,
              margin: [0, 0, 0, 10],
            } as Content,
          ]
        : []),
      {
        table: {
          widths: ['*'],
          body: [
            [
              {
                stack: [
                  {
                    text: 'Цена указана за покупку всех товаров, перечисленных в настоящем предложении.',
                    bold: true,
                  },
                  {
                    text: `Предложение действительно ${options.validDays} ${daysWord(options.validDays)} с даты формирования — до ${formatDate(validUntil)}.`,
                    margin: [0, 2, 0, 0],
                  },
                ],
                fontSize: 8.5,
                color: '#6d1b1b',
                lineHeight: 1.4,
                margin: [8, 8, 8, 8],
                fillColor: '#fdf3f3',
              },
            ],
          ],
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#f0c9cb',
          vLineColor: () => '#f0c9cb',
        },
        margin: [0, 0, 0, 16],
      },
      {
        columns: [
          {
            width: '*',
            stack: [
              options.manager ? { text: `Менеджер: ${options.manager}`, fontSize: 8.5 } : null,
              { text: `${company.name} · ${company.phone} · ${company.email}`, fontSize: 8.5, color: GREY },
              requisites.length
                ? { text: requisites.join(' · '), fontSize: 8, color: LIGHT }
                : null,
            ].filter(Boolean) as Content[],
          },
          {
            width: 200,
            stack: [
              {
                canvas: [{ type: 'line', x1: 0, y1: 30, x2: 200, y2: 30, lineWidth: 0.6, lineColor: '#b9b9c0' }],
              },
              { text: 'Менеджер Свет-36 / подпись', fontSize: 7.5, color: LIGHT, alignment: 'center' },
            ],
          },
        ],
      },
    ],
  }

  pdf.createPdf(doc).download(fileName(proposal))
}

function totalRow(label: string, value: string): Content {
  return {
    columns: [
      { text: label, fontSize: 9, color: GREY },
      { text: value, fontSize: 9, alignment: 'right' },
    ],
    margin: [0, 1, 0, 1],
  }
}

function itemsWord(count: number): string {
  const n = Math.abs(count) % 100
  const n1 = n % 10
  if (n > 10 && n < 20) return 'позиций'
  if (n1 > 1 && n1 < 5) return 'позиции'
  if (n1 === 1) return 'позиция'
  return 'позиций'
}

export function fileName(proposal: Proposal): string {
  const safe = proposal.number.replace(/[^\wа-яА-ЯёЁ-]+/g, '-')
  return `КП_${safe}_${proposal.date}`
}

type Content = Record<string, unknown>

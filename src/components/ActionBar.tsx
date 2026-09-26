import { useState } from 'react'
import { FileSpreadsheet, FileText, Loader2, Send, TriangleAlert } from 'lucide-react'
import type { Company, Proposal } from '../types'
import { itemsWord, money, num } from '../lib/format'
import { Button, Stat } from './ui'

interface Props {
  proposal: Proposal
  company: Company
  totals: { count: number; qty: number; sum: number; discount: number; grand: number }
  onShare: () => void
}

export function ActionBar({ proposal, company, totals, onShare }: Props) {
  const [busy, setBusy] = useState<'pdf' | 'xlsx' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const hasItems = proposal.items.some((item) => item.name.trim() !== '')

  const run = async (kind: 'pdf' | 'xlsx') => {
    setBusy(kind)
    setError(null)
    try {
      if (kind === 'pdf') {
        const { exportPdf } = await import('../lib/exportPdf')
        await exportPdf(proposal, company)
      } else {
        const { exportExcel } = await import('../lib/exportExcel')
        await exportExcel(proposal, company)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось сформировать файл')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="surface overflow-hidden">
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
        <Stat label="Позиций" value={num(totals.count)} hint={itemsWord(totals.count)} />
        <Stat label="Всего штук" value={num(totals.qty)} hint="суммарно" />
        <Stat label="Сумма" value={money(totals.sum)} hint="без скидки" />
        <Stat label="К оплате" value={money(totals.grand)} hint={totals.discount ? 'со скидкой' : 'итого'} />
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-line p-4">
        <Button
          variant="accent"
          size="lg"
          className="min-w-0"
          onClick={() => void run('pdf')}
          disabled={busy !== null || !hasItems}
        >
          {busy === 'pdf' ? <Loader2 size={17} className="animate-spin" /> : <FileText size={17} />}
          <span className="truncate">Скачать PDF</span>
        </Button>
        <Button
          variant="primary"
          size="lg"
          className="min-w-0"
          onClick={() => void run('xlsx')}
          disabled={busy !== null || !hasItems}
        >
          {busy === 'xlsx' ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <FileSpreadsheet size={17} />
          )}
          <span className="truncate">Скачать Excel</span>
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="col-span-2 w-full"
          onClick={onShare}
          disabled={!hasItems}
        >
          <Send size={16} /> Отправить клиенту ссылкой
        </Button>
      </div>

      {error ? (
        <p className="flex items-start gap-2 border-t border-line px-4 py-3 text-[12.5px] text-accent">
          <TriangleAlert size={14} className="mt-0.5 shrink-0" />
          {error}
        </p>
      ) : null}

      {!hasItems ? (
        <p className="border-t border-line px-4 py-3 text-[12.5px] text-muted">
          Заполните хотя бы одно наименование товара — после этого можно собрать PDF, Excel и ссылку.
        </p>
      ) : null}
    </div>
  )
}

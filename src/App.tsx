import { useState } from 'react'
import { FilePlus2, Link2, X } from 'lucide-react'
import { Hero } from './components/Hero'
import { SiteHeader } from './components/SiteHeader'
import { SiteFooter } from './components/SiteFooter'
import { ClientForm } from './components/ClientForm'
import { ItemsEditor } from './components/ItemsEditor'
import { OptionsForm } from './components/OptionsForm'
import { KpPreview } from './components/KpPreview'
import { ActionBar } from './components/ActionBar'
import { HistoryPanel } from './components/HistoryPanel'
import { SaveDialog } from './components/SaveDialog'
import { ShareDialog } from './components/ShareDialog'
import { Button } from './components/ui'
import { defaultHistoryName } from './lib/history'
import { useProposal } from './state/useProposal'

export default function App() {
  const state = useProposal()
  const { proposal, company, totals, fromLink } = state
  const [shareOpen, setShareOpen] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)
  const current = state.history.find((entry) => entry.id === state.currentId) ?? null

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      {fromLink ? (
        <div className="border-b border-line bg-accent-soft">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
            <Link2 size={15} className="text-accent" />
            <span className="text-[13px]">
              Открыто коммерческое предложение <strong className="num">{proposal.number}</strong>{' '}
              от {company.name}. Данные загружены из ссылки — их можно скачать в PDF или Excel.
            </span>
            <Button variant="accent" size="sm" className="ml-auto" onClick={state.newProposal}>
              <FilePlus2 size={14} /> Составить своё КП
            </Button>
          </div>
        </div>
      ) : null}

      <main className="flex-1">
        <Hero
          proposal={proposal}
          onNumber={state.setNumber}
          onDate={state.setDate}
          onNew={state.newProposal}
        />

        <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-start gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
          <div className="min-w-0 space-y-5">
            <ClientForm client={proposal.client} onChange={state.setClient} />

            <ItemsEditor
              items={proposal.items}
              onAdd={state.addItem}
              onAddMany={state.addManyItems}
              onChange={state.updateItem}
              onRemove={state.removeItem}
              onDuplicate={state.duplicateItem}
              onMove={state.moveItem}
            />

            <OptionsForm
              options={proposal.options}
              company={company}
              onChange={state.setOptions}
              onCompanyChange={state.setCompany}
              onCompanyReset={state.resetCompany}
            />

            <p className="flex items-start gap-2 px-1 text-[12px] leading-relaxed text-muted">
              <X size={13} className="mt-0.5 shrink-0 text-accent" />
              Все расчёты выполняются в браузере: данные не отправляются на сторонние серверы.
              Фотографии сжимаются и встраиваются в PDF и Excel.
            </p>

            <HistoryPanel
              entries={state.history}
              loading={state.historyLoading}
              error={state.historyError}
              currentId={state.currentId}
              dirty={state.dirty}
              onOpen={state.openFromHistory}
              onDelete={state.deleteFromHistory}
            />
          </div>

          <div className="min-w-0 space-y-5 lg:sticky lg:top-[170px]">
            <ActionBar
              proposal={proposal}
              company={company}
              totals={totals}
              current={current}
              dirty={state.dirty}
              onSave={() => setSaveOpen(true)}
              onShare={() => setShareOpen(true)}
            />
            <KpPreview proposal={proposal} company={company} />
          </div>
        </div>
      </main>

      <SiteFooter company={company} />

      {saveOpen ? (
        <SaveDialog
          proposal={proposal}
          totals={totals}
          current={current}
          initialName={current?.name ?? defaultHistoryName(proposal)}
          onSave={state.saveToHistory}
          onClose={() => setSaveOpen(false)}
        />
      ) : null}

      <ShareDialog
        key={shareOpen ? 'share-open' : 'share-closed'}
        open={shareOpen}
        proposal={proposal}
        company={company}
        total={totals.grand}
        onClose={() => setShareOpen(false)}
      />
    </div>
  )
}

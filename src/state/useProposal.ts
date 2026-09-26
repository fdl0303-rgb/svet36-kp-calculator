import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Client, Company, Item, Options, Proposal } from '../types'
import { createItem, cryptoId, discountAmount, grandTotal, itemsTotal, sumQty } from '../lib/calc'
import { DEFAULT_COMPANY } from '../lib/company'
import { todayISO } from '../lib/format'
import { buildProposalNumber } from '../lib/number'
import { readHashProposal } from '../lib/share'
import { COMPANY_KEY, DRAFT_KEY, loadJSON, saveJSON } from '../lib/storage'

const DEFAULT_CLIENT: Client = {
  name: '',
  company: '',
  phone: '',
  email: '',
  address: '',
  object: '',
}

const DEFAULT_OPTIONS: Options = {
  validDays: 3,
  payment: 'Оплата по счёту либо наличными/картой в магазине',
  delivery: 'Самовывоз из магазина (Воронеж, Донбасская 16з) либо доставка по городу',
  comment: '',
  manager: '',
  discount: 0,
}

function createDraft(): Proposal {
  const date = todayISO()
  return {
    number: buildProposalNumber(date),
    date,
    client: { ...DEFAULT_CLIENT },
    items: [createItem()],
    options: { ...DEFAULT_OPTIONS },
  }
}

function withItems(p: Proposal): Proposal {
  return {
    ...p,
    client: { ...DEFAULT_CLIENT, ...p.client },
    options: { ...DEFAULT_OPTIONS, ...p.options },
    items: p.items.length
      ? p.items.map((item) => ({ ...createItem(), ...item, id: item.id || cryptoId() }))
      : [createItem()],
  }
}

export interface ProposalState {
  proposal: Proposal
  company: Company
  fromLink: boolean
  totals: { count: number; qty: number; sum: number; discount: number; grand: number }
  setClient: (patch: Partial<Client>) => void
  setOptions: (patch: Partial<Options>) => void
  setCompany: (patch: Partial<Company>) => void
  setNumber: (value: string) => void
  setDate: (value: string) => void
  addItem: () => void
  addManyItems: (count: number) => void
  updateItem: (id: string, patch: Partial<Item>) => void
  removeItem: (id: string) => void
  duplicateItem: (id: string) => void
  moveItem: (id: string, direction: -1 | 1) => void
  newProposal: () => void
  loadFromLink: (p: Proposal) => void
  resetCompany: () => void
}

export function useProposal(): ProposalState {
  const [proposal, setProposal] = useState<Proposal>(() => {
    const linked = readHashProposal()
    if (linked) return withItems(linked)
    const draft = loadJSON<Proposal | null>(DRAFT_KEY, null)
    if (draft?.items?.length) {
      return {
        number: draft.number || buildProposalNumber(todayISO()),
        date: draft.date || todayISO(),
        client: { ...DEFAULT_CLIENT, ...draft.client },
        items: draft.items.map((item) => ({ ...createItem(), ...item })),
        options: { ...DEFAULT_OPTIONS, ...draft.options },
      }
    }
    return createDraft()
  })
  const [company, setCompanyState] = useState<Company>(() =>
    loadJSON<Company>(COMPANY_KEY, DEFAULT_COMPANY),
  )
  const [fromLink, setFromLink] = useState<boolean>(() => Boolean(readHashProposal()))
  const firstRun = useRef(true)

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    saveJSON(DRAFT_KEY, proposal)
  }, [proposal])

  useEffect(() => {
    saveJSON(COMPANY_KEY, company)
  }, [company])

  const totals = useMemo(() => {
    const sum = itemsTotal(proposal.items)
    const d = Math.min(100, Math.max(0, proposal.options.discount || 0))
    return {
      count: proposal.items.length,
      qty: sumQty(proposal.items),
      sum,
      discount: discountAmount(sum, d),
      grand: grandTotal(proposal),
    }
  }, [proposal])

  const setClient = useCallback((patch: Partial<Client>) => {
    setProposal((prev) => ({ ...prev, client: { ...prev.client, ...patch } }))
  }, [])

  const setOptions = useCallback((patch: Partial<Options>) => {
    setProposal((prev) => ({ ...prev, options: { ...prev.options, ...patch } }))
  }, [])

  const setCompany = useCallback((patch: Partial<Company>) => {
    setCompanyState((prev) => ({ ...prev, ...patch }))
  }, [])

  const resetCompany = useCallback(() => setCompanyState({ ...DEFAULT_COMPANY }), [])

  const setNumber = useCallback((value: string) => {
    setProposal((prev) => ({ ...prev, number: value }))
  }, [])

  const setDate = useCallback((value: string) => {
    setProposal((prev) => ({ ...prev, date: value }))
  }, [])

  const addItem = useCallback(() => {
    setProposal((prev) => ({ ...prev, items: [...prev.items, createItem()] }))
  }, [])

  const addManyItems = useCallback((count: number) => {
    setProposal((prev) => ({
      ...prev,
      items: [...prev.items, ...Array.from({ length: Math.max(1, count) }, () => createItem())],
    }))
  }, [])

  const updateItem = useCallback((id: string, patch: Partial<Item>) => {
    setProposal((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }))
  }, [])

  const removeItem = useCallback((id: string) => {
    setProposal((prev) => {
      const items = prev.items.filter((item) => item.id !== id)
      return { ...prev, items: items.length ? items : [createItem()] }
    })
  }, [])

  const duplicateItem = useCallback((id: string) => {
    setProposal((prev) => {
      const index = prev.items.findIndex((item) => item.id === id)
      if (index < 0) return prev
      const source = prev.items[index]
      const copy = { ...source, id: cryptoId() }
      const items = [...prev.items]
      items.splice(index + 1, 0, copy)
      return { ...prev, items }
    })
  }, [])

  const moveItem = useCallback((id: string, direction: -1 | 1) => {
    setProposal((prev) => {
      const index = prev.items.findIndex((item) => item.id === id)
      const target = index + direction
      if (index < 0 || target < 0 || target >= prev.items.length) return prev
      const items = [...prev.items]
      const [moved] = items.splice(index, 1)
      items.splice(target, 0, moved)
      return { ...prev, items }
    })
  }, [])

  const newProposal = useCallback(() => {
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    setFromLink(false)
    setProposal(createDraft())
  }, [])

  const loadFromLink = useCallback((p: Proposal) => {
    setFromLink(true)
    setProposal(withItems(p))
  }, [])

  return {
    proposal,
    company,
    fromLink,
    totals,
    setClient,
    setOptions,
    setCompany,
    setNumber,
    setDate,
    addItem,
    addManyItems,
    updateItem,
    removeItem,
    duplicateItem,
    moveItem,
    newProposal,
    loadFromLink,
    resetCompany,
  }
}

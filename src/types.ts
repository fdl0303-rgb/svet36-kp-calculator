export interface Company {
  name: string
  tagline: string
  address: string
  extraAddress: string
  phone: string
  phoneHref: string
  email: string
  site: string
  hours: string
  inn: string
  kpp: string
  ogrn: string
  bank: string
  account: string
  director: string
}

export interface Client {
  name: string
  company: string
  phone: string
  email: string
  address: string
  object: string
}

export interface Item {
  id: string
  name: string
  sku: string
  unit: string
  qty: number
  price: number
  totalOverride: number | null
  note: string
  photo: string | null
}

export interface Options {
  validDays: number
  payment: string
  delivery: string
  comment: string
  manager: string
  discount: number
  /** Показывать блок «При оплате наличными или картой в магазине» рядом с итоговой ценой. */
  cashPayment: boolean
}

export interface Proposal {
  number: string
  date: string
  client: Client
  items: Item[]
  options: Options
}

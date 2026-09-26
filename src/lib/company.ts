import type { Company } from '../types'

export const PHONE = '8 920 22-58-222'
export const PHONE_HREF = 'tel:+79202258222'
export const SITE = 'https://svet-36.ru'

export const DEFAULT_COMPANY: Company = {
  name: 'Свет-36',
  tagline: 'Магазин дизайнерского освещения',
  address: 'г. Воронеж, ул. Донбасская, 16з',
  extraAddress: 'г. Воронеж, ул. Холмистая, 68а, Строительная ярмарка, пав. 112',
  phone: PHONE,
  phoneHref: PHONE_HREF,
  email: 'svet36-online@yandex.ru',
  site: 'svet-36.ru',
  hours: 'Пн–Пт 10:00–19:00, Сб–Вс 10:00–16:00',
  inn: '',
  kpp: '',
  ogrn: '',
  bank: '',
  account: '',
  director: '',
}

export const CATEGORIES = [
  'Люстры',
  'Светильники',
  'Настенные',
  'Трековые',
  'Уличные',
  'Споты',
  'Настольные',
  'Торшеры',
  'Офисные',
  'Светодиодная лента',
  'Лампочки',
  'Электротовары',
]

export const CATEGORY_MAP: Record<string, string> = {
  'Люстры': 'lyustry',
  'Светильники': 'svetilniki',
  'Настенные': 'nastennie',
  'Трековые': 'trekovye',
  'Уличные': 'ulichnye',
  'Споты': 'spoty',
  'Настольные': 'nastolnye',
  'Торшеры': 'torshery',
  'Офисные': 'ofisnye',
  'Светодиодная лента': 'Svetodiodnaya-lenta',
  'Лампочки': 'lampochki',
  'Электротовары': 'elektrotovary',
}

export function categoryHref(name: string): string {
  return `${SITE}/catalog/${CATEGORY_MAP[name] ?? ''}/`
}

export const NAV_LINKS = [
  { label: 'О компании', href: `${SITE}/o-kompanii` },
  { label: 'Доставка и оплата', href: `${SITE}/dostavka-i-oplata` },
  { label: 'Сотрудничество', href: `${SITE}/sotrudnichestvo` },
  { label: 'Контактная информация', href: `${SITE}/kontakty` },
]

export const UNITS = ['шт', 'компл.', 'уп.', 'м', 'м²', 'кг', 'л']

import { FileText } from 'lucide-react'
import logoUrl from '../assets/logo.png'
import type { Company, Proposal } from '../types'
import { discountAmount, itemSubtotal, itemsTotal } from '../lib/calc'
import {
  RUB,
  addDaysISO,
  daysWord,
  formatDate,
  formatDateShort,
  moneyExact,
  num,
} from '../lib/format'
import { useAutoScale } from '../lib/useAutoScale'

const PAPER_WIDTH = 794

interface Props {
  proposal: Proposal
  company: Company
}

export function KpPreview({ proposal, company }: Props) {
  const { outerRef, innerRef, scale, height } = useAutoScale(PAPER_WIDTH)
  const { client, options, items } = proposal
  const sum = itemsTotal(items)
  const discount = discountAmount(sum, options.discount)
  const grand = Math.round((sum - discount) * 100) / 100
  const validUntil = addDaysISO(proposal.date, options.validDays)

  return (
    <div className="surface overflow-hidden">
      <header className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <FileText size={15} className="text-accent" />
        <span className="text-[13px] font-semibold">Предпросмотр документа</span>
        <span className="num ml-auto rounded-md bg-elevated px-2 py-0.5 text-[11px] text-muted">
          A4 · {Math.round(scale * 100)}%
        </span>
      </header>

      <div
        ref={outerRef}
        className="thin-scroll max-h-[74vh] overflow-y-auto overflow-x-hidden bg-elevated/40 p-3"
      >
        <div style={{ height: height * scale }}>
          <div
            ref={innerRef}
            style={{
              width: PAPER_WIDTH,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
            className="bg-white text-[#141416] shadow-[0_18px_50px_-24px_rgba(0,0,0,0.5)]"
          >
            <div className="px-12 pt-11 pb-8">
              <div className="flex items-start justify-between gap-8">
                <div className="min-w-0">
                  <img src={logoUrl} alt="Свет-36" className="h-auto w-[176px]" />
                  <div className="mt-3 max-w-[300px] text-[9.5px] leading-[1.5] text-[#5b5b63]">
                    {company.address}
                    {company.extraAddress ? (
                      <>
                        <br />
                        {company.extraAddress}
                      </>
                    ) : null}
                    <br />
                    {company.hours}
                  </div>
                </div>
                <div className="text-right text-[9.5px] leading-[1.6] text-[#5b5b63]">
                  <div className="num text-[12.5px] font-bold text-[#141416]">
                    {company.phone}
                  </div>
                  <div>{company.email}</div>
                  <div>{company.site}</div>
                  {company.inn ? <div className="num">ИНН {company.inn}</div> : null}
                  {company.ogrn ? <div className="num">ОГРН {company.ogrn}</div> : null}
                </div>
              </div>

              <div className="mt-7 flex items-end justify-between gap-6 border-b-2 border-[#141416] pb-3">
                <div>
                  <div className="font-display text-[19px] leading-none font-extrabold tracking-tight uppercase">
                    Коммерческое предложение
                  </div>
                  <div className="num mt-2 text-[11px] font-semibold text-[#d81f27]">
                    № {proposal.number}
                  </div>
                </div>
                <div className="text-right text-[9.5px] leading-[1.7] text-[#5b5b63]">
                  <div>Дата: {formatDate(proposal.date)}</div>
                  <div>
                    Действует до: <span className="font-semibold text-[#d81f27]">{formatDateShort(validUntil)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-6">
                <div className="text-[9.5px] leading-[1.7]">
                  <div className="text-[8.5px] font-semibold tracking-[0.12em] text-[#8a8a93] uppercase">
                    Кому
                  </div>
                  <div className="mt-1 text-[11px] font-semibold">
                    {client.name || 'Клиент'}
                    {client.company ? `, ${client.company}` : ''}
                  </div>
                  {client.phone ? <div className="num text-[#3a3a42]">{client.phone}</div> : null}
                  {client.email ? <div className="text-[#3a3a42]">{client.email}</div> : null}
                  {client.address ? <div className="text-[#3a3a42]">{client.address}</div> : null}
                </div>
                <div className="text-[9.5px] leading-[1.7]">
                  <div className="text-[8.5px] font-semibold tracking-[0.12em] text-[#8a8a93] uppercase">
                    Объект / условия
                  </div>
                  <div className="mt-1 text-[#3a3a42]">
                    {client.object || 'Уточняется'}
                    {options.delivery ? (
                      <>
                        <br />
                        {options.delivery}
                      </>
                    ) : null}
                    {options.payment ? (
                      <>
                        <br />
                        {options.payment}
                      </>
                    ) : null}
                  </div>
                </div>
              </div>

              <table className="mt-5 w-full border-collapse text-[9.5px]">
                <thead>
                  <tr className="bg-[#f4f4f5]">
                    <th className="w-8 border border-[#e2e2e6] px-1.5 py-1.5 text-left font-semibold">
                      №
                    </th>
                    <th className="w-[136px] border border-[#e2e2e6] px-1.5 py-1.5 text-center font-semibold">
                      Фото
                    </th>
                    <th className="border border-[#e2e2e6] px-2 py-1.5 text-left font-semibold">
                      Наименование
                    </th>
                    <th className="w-11 border border-[#e2e2e6] px-1.5 py-1.5 text-center font-semibold">
                      Ед.
                    </th>
                    <th className="w-14 border border-[#e2e2e6] px-1.5 py-1.5 text-right font-semibold">
                      Кол-во
                    </th>
                    <th className="w-20 border border-[#e2e2e6] px-1.5 py-1.5 text-right font-semibold">
                      Цена, {RUB}
                    </th>
                    <th className="w-24 border border-[#e2e2e6] px-2 py-1.5 text-right font-semibold">
                      Сумма
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className="align-top">
                      <td className="num border border-[#e2e2e6] px-1.5 py-1.5 text-center text-[#8a8a93]">
                        {index + 1}
                      </td>
                      <td className="border border-[#e2e2e6] p-1 text-center">
                        {item.photo ? (
                          <img
                            src={item.photo}
                            alt=""
                            className="mx-auto size-[117px] rounded object-cover"
                          />
                        ) : (
                          <div className="num mx-auto grid size-[117px] place-items-center rounded bg-[#f4f4f5] text-[10px] text-[#b0b0b8]">
                            {index + 1}
                          </div>
                        )}
                      </td>
                      <td className="border border-[#e2e2e6] px-2 py-1.5">
                        <div className="text-[10px] font-medium">{item.name || 'Без названия'}</div>
                        {item.sku ? (
                          <div className="num text-[8.5px] text-[#8a8a93]">арт. {item.sku}</div>
                        ) : null}
                        {item.note ? (
                          <div className="text-[8.5px] text-[#5b5b63]">{item.note}</div>
                        ) : null}
                      </td>
                      <td className="border border-[#e2e2e6] px-1.5 py-1.5 text-center text-[#5b5b63]">
                        {item.unit}
                      </td>
                      <td className="num border border-[#e2e2e6] px-1.5 py-1.5 text-right">
                        {num(item.qty)}
                      </td>
                      <td className="num border border-[#e2e2e6] px-1.5 py-1.5 text-right">
                        {moneyExact(item.price)}
                      </td>
                      <td className="num border border-[#e2e2e6] px-2 py-1.5 text-right font-semibold">
                        {moneyExact(itemSubtotal(item))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-5 flex justify-end">
                <div className="w-[260px]">
                  <Row label={`Итого (${num(items.length)} поз.):`} value={moneyExact(sum)} />
                  {discount > 0 ? (
                    <Row label={`Скидка ${options.discount}%:`} value={`− ${moneyExact(discount)}`} />
                  ) : null}
                  <div className="mt-2 flex items-baseline justify-between border-t-2 border-[#141416] pt-2">
                    <span className="text-[10px] font-bold uppercase">Итого к оплате</span>
                    <span className="num text-[15px] font-bold text-[#d81f27]">
                      {moneyExact(grand)}
                    </span>
                  </div>
                </div>
              </div>

              {options.comment ? (
                <p className="mt-4 text-[9.5px] leading-[1.6] text-[#3a3a42]">
                  {options.comment}
                </p>
              ) : null}

              <div className="mt-5 rounded-md border border-[#f0c9cb] bg-[#fdf3f3] px-3 py-2.5 text-[9px] leading-[1.6] text-[#6d1b1b]">
                <strong>Цена указана за покупку всех товаров, перечисленных в настоящем
                предложении.</strong> Предложение действительно{' '}
                {options.validDays} {daysWord(options.validDays)} с даты формирования — до{' '}
                {formatDateShort(validUntil)}.
              </div>

              <div className="mt-6 flex items-end justify-between gap-8 text-[9px] text-[#5b5b63]">
                <div className="leading-[1.7]">
                  {options.manager ? <div>Менеджер: {options.manager}</div> : null}
                  <div>
                    {company.name} · {company.phone} · {company.email}
                  </div>
                  <div className="num">
                    {company.inn ? `ИНН ${company.inn} · ` : ''}
                    {company.ogrn ? `ОГРН ${company.ogrn}` : ''}
                    {company.account ? ` · р/с ${company.account}` : ''}
                  </div>
                </div>
                <div className="w-[220px] shrink-0">
                  <div className="h-9 border-b border-[#b9b9c0]" />
                  <div className="mt-1 text-center text-[8.5px]">
                    Менеджер Свет-36 / подпись
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between py-0.5 text-[10px]">
      <span className="text-[#5b5b63]">{label}</span>
      <span className="num font-medium">{value}</span>
    </div>
  )
}

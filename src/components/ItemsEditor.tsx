import { Boxes, Plus, Sparkles } from 'lucide-react'
import type { Item } from '../types'
import { itemSubtotal } from '../lib/calc'
import { itemsWord, money, num } from '../lib/format'
import { Button, Card, Pill } from './ui'
import { ItemCard } from './ItemCard'

interface Props {
  items: Item[]
  onAdd: () => void
  onAddMany: (count: number) => void
  onChange: (id: string, patch: Partial<Item>) => void
  onRemove: (id: string) => void
  onDuplicate: (id: string) => void
  onMove: (id: string, direction: -1 | 1) => void
}

export function ItemsEditor({
  items,
  onAdd,
  onAddMany,
  onChange,
  onRemove,
  onDuplicate,
  onMove,
}: Props) {
  const total = items.reduce((acc, item) => acc + itemSubtotal(item), 0)
  const empty = items.filter((item) => item.name.trim() === '').length

  return (
    <Card
      title="Товары и услуги"
      step="2"
      icon={<Boxes size={16} />}
      action={
        <Pill tone="neutral">
          {num(items.length)} {itemsWord(items.length)}
        </Pill>
      }
    >
      <div className="space-y-3">
        {items.map((item, index) => (
          <ItemCard
            key={item.id}
            item={item}
            index={index}
            total={itemSubtotal(item) === 0 ? 0 : (Number(item.qty) || 0) * (Number(item.price) || 0)}
            canMoveUp={index > 0}
            canMoveDown={index < items.length - 1}
            onChange={(patch) => onChange(item.id, patch)}
            onRemove={() => onRemove(item.id)}
            onDuplicate={() => onDuplicate(item.id)}
            onMove={(direction) => onMove(item.id, direction)}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={onAdd}>
          <Plus size={16} /> Добавить товар
        </Button>
        <Button variant="ghost" size="md" onClick={() => onAddMany(5)}>
          <Sparkles size={15} /> Добавить 5 позиций
        </Button>
        <span className="num ml-auto text-[13px] text-muted">
          Итого по позициям:{' '}
          <span className="font-bold text-fg">{money(total)}</span>
        </span>
      </div>

      {empty > 0 ? (
        <p className="mt-3 text-[12px] text-muted">
          Заполните наименования всех позиций — так предложение выглядит аккуратно и сразу готово к
          отправке.
        </p>
      ) : null}
    </Card>
  )
}

import type { Carrier } from '../../../domain/Carrier'
import type { Order } from '../../../domain/Order'
import { DataTable } from '../../../components/DataTable'
import { OrderRow } from './OrderRow'

const COLUMNS = ['Nº de seguimiento', 'Cliente', 'Destino', 'Producto', 'Transportista']

interface OrdersTableProps {
  orders: Order[]
  emptyMessage: string
  carriers: Carrier[]
  selectedCarriers: Record<string, number | undefined>
  onCarrierChange: (trackingNumber: string, carrierId?: number) => void
  onConfirm: (order: Order) => void
}

export function OrdersTable({ orders, emptyMessage, carriers, selectedCarriers, onCarrierChange, onConfirm }: OrdersTableProps) {
  return (
    <DataTable
      columns={COLUMNS}
      isEmpty={orders.length === 0}
      emptyMessage={emptyMessage}
    >
      {orders.map((order) => (
        <OrderRow
          key={order.trackingNumber}
          order={order}
          carriers={carriers}
          selectedCarrierId={selectedCarriers[order.trackingNumber]}
          onCarrierChange={(carrierId) => onCarrierChange(order.trackingNumber, carrierId)}
          onConfirm={() => onConfirm(order)}
        />
      ))}
    </DataTable>
  )
}

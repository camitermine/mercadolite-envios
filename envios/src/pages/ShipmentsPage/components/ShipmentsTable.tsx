
import type { Shipment } from '../../../domain/Shipment'
import { DataTable } from '../../../components/DataTable'
import { ShipmentRow } from './ShipmentRow'

const COLUMNS = [
  'Nº de seguimiento',
  'Cliente',
  'Destino',
  'Estado',
  'Transportista',
  'Fecha estimada',
]

interface ShipmentsTableProps {
  shipments: Shipment[]
  onDeliver: (trackingNumber: string) => void
  deliveringId: string | null
}

export function ShipmentsTable({
  shipments,
  onDeliver,
  deliveringId,
}: ShipmentsTableProps) {
  return (
    <DataTable
      columns={COLUMNS}
      isEmpty={shipments.length === 0}
      emptyMessage="No hay envíos que coincidan con la búsqueda."
    >
      {shipments.map((shipment) => (
        <ShipmentRow
          key={shipment.id}
          shipment={shipment}
          onDeliver={onDeliver}
          isDelivering={deliveringId === shipment.trackingNumber}
          deliverDisabled={deliveringId !== null}
        />
      ))}
    </DataTable>
  )
}

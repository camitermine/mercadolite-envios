import { Button, MenuItem, Select, TableCell, TableRow } from '@mui/material'
import type { Carrier } from '../../../domain/Carrier'
import type { Order } from '../../../domain/Order'

const NO_CARRIER = ''

interface OrderRowProps {
  order: Order
  carriers: Carrier[]
  selectedCarrierId?: number
  onCarrierChange: (carrierId?: number) => void
  onConfirm: () => void
}

export function OrderRow({ order, carriers, selectedCarrierId, onCarrierChange, onConfirm }: OrderRowProps) {
  return (
    <TableRow hover>
      <TableCell>{order.trackingNumber}</TableCell>
      <TableCell>{order.clientName}</TableCell>
      <TableCell>{order.destination}</TableCell>
      <TableCell>{order.product}</TableCell>
      <TableCell>
        <Select<number | typeof NO_CARRIER>
          size="small"
          fullWidth
          displayEmpty
          value={selectedCarrierId ?? NO_CARRIER}
          onChange={(event) => {
            const value = event.target.value
            onCarrierChange(value === NO_CARRIER ? undefined : Number(value))
          }}
          inputProps={{ 'aria-label': `Transportista para ${order.trackingNumber}` }}
          sx={{ fontSize: 13, minWidth: 160 }}
        >
          <MenuItem value={NO_CARRIER}>Sin asignar</MenuItem>
          {carriers.map((carrier) => (
            <MenuItem key={carrier.id} value={carrier.id}>
              {carrier.name}
            </MenuItem>
          ))}
        </Select>
      </TableCell>
      <TableCell align="right">
        <Button
          variant="contained"
          size="small"
          disableElevation
          disabled={selectedCarrierId === undefined}
          onClick={onConfirm}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Confirmar
        </Button>
      </TableCell>
    </TableRow>
  )
}

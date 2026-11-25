
import {
  Box,
  Button,
  Chip,
  TableCell,
  TableRow,
} from '@mui/material'
import { useNavigate } from 'react-router'
import type { Shipment, ShipmentStatus } from '../../../domain/Shipment'
import { PATHS } from '../../../routes/paths'

interface ShipmentRowProps {
  shipment: Shipment
  onDeliver: (trackingNumber: string) => void
  isDelivering: boolean
  deliverDisabled: boolean
}

const statusStyles: Record<ShipmentStatus,{ backgroundColor: string; color: string }> = {
  'En camino': {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  Demorado: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
  },
  Entregado: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
  },
}

export function ShipmentRow({
  shipment,
  onDeliver,
  isDelivering,
  deliverDisabled,
}: ShipmentRowProps) {
  const navigate = useNavigate()

  return (
    <TableRow hover>
      <TableCell>{shipment.trackingNumber}</TableCell>
      <TableCell>{shipment.clientName}</TableCell>
      <TableCell>{shipment.destination}</TableCell>

      <TableCell>
        <Chip
          label={shipment.status}
          size="small"
          sx={{
            ...statusStyles[shipment.status],
            fontWeight: 600,
            fontSize: 11,
            height: 22,
          }}
        />
      </TableCell>

      <TableCell>{shipment.carrier}</TableCell>
      <TableCell>{shipment.estimatedDate}</TableCell>

      <TableCell align="right">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 0.5,
          }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="text"
              size="small"
              onClick={() =>
                navigate(PATHS.viewShipment(shipment.trackingNumber))
              }
              sx={{
                textTransform: 'none',
                minWidth: 0,
                padding: 0,
                fontSize: 12,
              }}
            >
              Ver
            </Button>

            <Button
              variant="text"
              size="small"
              onClick={() =>
                navigate(PATHS.editShipment(shipment.trackingNumber))
              }
              sx={{
                textTransform: 'none',
                minWidth: 0,
                padding: 0,
                fontSize: 12,
              }}
            >
              Editar
            </Button>
          </Box>

          {shipment.status !== 'Entregado' && (
            <Button
              variant="contained"
              size="small"
              onClick={() => onDeliver(shipment.trackingNumber)}
              disabled={deliverDisabled}
              sx={{
                textTransform: 'none',
                fontSize: 11,
                minWidth: 0,
                padding: '3px 10px',
              }}
            >
              {isDelivering ? 'Entregando...' : 'Entregar'}
            </Button>
          )}
        </Box>
      </TableCell>
    </TableRow>
  )
}

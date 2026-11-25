import { Box, Button, Typography } from '@mui/material'
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import { Navigate, useLocation, useNavigate } from 'react-router'
import type { Order } from '../../domain/Order'
import { INITIAL_SHIPMENT_STATUS } from '../../domain/Shipment'
import { PATHS } from '../../routes/paths'
import { shipmentService } from '../../services/shipmentService'
import { ShipmentForm } from '../ShipmentsPage/components/ShipmentForm'

interface NewShipmentLocationState {
  order?: Order
  carrierId?: number
}

export function NewShipmentPage() {
  const navigate = useNavigate()
  const state = useLocation().state as NewShipmentLocationState | null

  // Un envío solo se crea confirmando una orden desde Pendientes
  if (!state?.order) {
    return <Navigate to={PATHS.pending} replace />
  }

  return (
    <Box sx={{ maxWidth: 720 }}>
      <Button
        size="small"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(PATHS.pending)}
        sx={{ mb: 2, color: 'text.secondary', textTransform: 'none' }}
      >
        Volver a pendientes
      </Button>

      <Typography variant="h5" component="h1" sx={{ mb: 3, fontWeight: 700 }}>
        Nuevo envío
      </Typography>

      <ShipmentForm
        mode="create"
        initialShipment={{
          ...state.order,
          carrierId: state.carrierId,
          estimatedDate: '',
        }}
        status={INITIAL_SHIPMENT_STATUS}
        cancelPath={PATHS.pending}
        onSubmit={(shipment) => shipmentService.create(shipment)}
      />
    </Box>
  )
}

import { useEffect, useState } from 'react'
import { Alert, Box, Button, Typography } from '@mui/material'
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router'
import type { Shipment, ShipmentInput } from '../../domain/Shipment'
import { LoadingState } from '../../components/LoadingState'
import { errorMessage, isAbortError } from '../../services/errors'
import { shipmentService } from '../../services/shipmentService'
import { PATHS } from '../../routes/paths'
import { ShipmentForm } from './components/ShipmentForm'

interface ShipmentFormPageProps {
  mode: 'edit' | 'view'
}

function toShipmentInput(shipment: Shipment): ShipmentInput {
  return {
    trackingNumber: shipment.trackingNumber,
    clientName: shipment.clientName,
    address: shipment.address,
    destination: shipment.destination,
    product: shipment.product,
    carrierId: shipment.carrierId,
    estimatedDate: shipment.estimatedDate,
  }
}

export function ShipmentFormPage({ mode }: ShipmentFormPageProps) {
  const navigate = useNavigate()
  const { trackingNumber } = useParams<{ trackingNumber: string }>()
  const [shipment, setShipment] = useState<Shipment>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  useEffect(() => {
    const controller = new AbortController()

    async function loadShipment() {
      try {
        // Si el envío no existe, el backend responde 404 con el mensaje a mostrar
        setShipment(await shipmentService.getByTrackingNumber(trackingNumber ?? '', controller.signal))
      } catch (loadError) {
        if (!isAbortError(loadError)) {
          setError(errorMessage(loadError, 'No pudimos cargar el envío'))
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadShipment()
    return () => controller.abort()
  }, [trackingNumber])

  const handleSubmit = ({ trackingNumber: tracking, ...data }: ShipmentInput) =>
    shipmentService.update(tracking, data)

  return (
    <Box sx={{ maxWidth: 720 }}>
      <Button
        size="small"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(PATHS.shipments)}
        sx={{ mb: 2, color: 'text.secondary', textTransform: 'none' }}
      >
        Volver a envíos
      </Button>

      <Typography variant="h5" component="h1" sx={{ mb: 3, fontWeight: 700 }}>
        {mode === 'edit' ? 'Editar envío' : 'Ver envío'}
      </Typography>

      {loading && <LoadingState label="Cargando envío" />}
      {error && <Alert severity="error">{error}</Alert>}
      {shipment && (
        <ShipmentForm
          mode={mode}
          initialShipment={toShipmentInput(shipment)}
          status={shipment.status}
          effectiveDate={shipment.effectiveDate}
          cancelPath={PATHS.shipments}
          onSubmit={handleSubmit}
        />
      )}
    </Box>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Alert, Box, TextField, Typography } from '@mui/material'
import { isActiveCarrier, type Carrier } from '../../domain/Carrier'
import { matchesOrderSearch, type Order } from '../../domain/Order'
import { carrierService } from '../../services/carrierService'
import { errorMessage, isAbortError } from '../../services/errors'
import { orderService } from '../../services/orderService'
import { PATHS } from '../../routes/paths'
import { LoadingState } from '../../components/LoadingState'
import { OrdersTable } from './components/OrdersTable'

export function PendingPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [selectedCarriers, setSelectedCarriers] = useState<Record<string, number | undefined>>({})
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  useEffect(() => {
    const controller = new AbortController()

    Promise.all([orderService.getAll(controller.signal), carrierService.getAll(controller.signal)])
      .then(([pendingOrders, allCarriers]) => {
        setOrders(pendingOrders)
        setCarriers(allCarriers.filter(isActiveCarrier))
      })
      .catch((loadError) => {
        if (!isAbortError(loadError)) {
          setError(errorMessage(loadError, 'No pudimos cargar las órdenes pendientes'))
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [])

  const filteredOrders = orders.filter((order) => matchesOrderSearch(order, search))

  const handleCarrierChange = (trackingNumber: string, carrierId?: number) => {
    setSelectedCarriers((previous) => ({ ...previous, [trackingNumber]: carrierId }))
  }

  const handleConfirm = (order: Order) => {
    navigate(PATHS.newShipment, {
      state: { order, carrierId: selectedCarriers[order.trackingNumber] },
    })
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 3, mb: 3 }}>
        <Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
            Pendientes
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 420 }}>
            Envíos con los datos del cliente cargados. Asigná un transportista y confirmá para pasarlos a Envíos.
          </Typography>
        </Box>
        <TextField
          size="small"
          placeholder="Buscar por nº o cliente"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ width: 260, bgcolor: 'background.paper' }}
        />
      </Box>

      {loading && <LoadingState />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <OrdersTable
          orders={filteredOrders}
          emptyMessage={orders.length === 0 ? 'No hay órdenes pendientes.' : 'No hay órdenes que coincidan con la búsqueda.'}
          carriers={carriers}
          selectedCarriers={selectedCarriers}
          onCarrierChange={handleCarrierChange}
          onConfirm={handleConfirm}
        />
      )}
    </Box>
  )
}

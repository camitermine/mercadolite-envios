import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  MenuItem,
  Pagination,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import {
  matchesShipmentSearch,
  type Shipment,
  type ShipmentStatus,
} from '../../domain/Shipment'
import { shipmentService } from '../../services/shipmentService'
import { errorMessage, isAbortError } from '../../services/errors'
import { LoadingState } from '../../components/LoadingState'
import { ShipmentsTable } from './components/ShipmentsTable'

const SHIPMENTS_PER_PAGE = 10

// Opción del combo que significa "sin filtro": no es un estado del backend
const ALL_STATUSES = 'Todos'
type StatusFilter = ShipmentStatus | typeof ALL_STATUSES

export function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [statuses, setStatuses] = useState<ShipmentStatus[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(ALL_STATUSES)
  const [page, setPage] = useState(1)
  // Solo la primera carga muestra el spinner: al filtrar o entregar la tabla queda visible
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [statusesError, setStatusesError] = useState<string>()
  const [deliveringId, setDeliveringId] = useState<string | null>(null)

  const selectedStatus = statusFilter === ALL_STATUSES ? undefined : statusFilter

  useEffect(() => {
    const controller = new AbortController()

    shipmentService
      .getStatuses(controller.signal)
      .then(setStatuses)
      .catch((loadError) => {
        if (!isAbortError(loadError)) {
          setStatusesError(errorMessage(loadError, 'No pudimos cargar los estados'))
        }
      })

    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    shipmentService
      .getAll(controller.signal, selectedStatus)
      .then((data) => {
        setShipments(data)
        setError(undefined)
      })
      .catch((loadError) => {
        if (!isAbortError(loadError)) {
          setShipments([])
          setError(errorMessage(loadError, 'No pudimos cargar los envíos'))
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [selectedStatus])

  const filteredShipments = shipments.filter((shipment) =>
    matchesShipmentSearch(shipment, search),
  )

  const pageCount = Math.ceil(
    filteredShipments.length / SHIPMENTS_PER_PAGE,
  )

  const currentPage = Math.min(page, Math.max(1, pageCount))

  const start = (currentPage - 1) * SHIPMENTS_PER_PAGE
  const paginatedShipments = filteredShipments.slice(
    start,
    start + SHIPMENTS_PER_PAGE,
  )

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleStatusChange = (value: StatusFilter) => {
    setStatusFilter(value)
    setPage(1)
  }

  // Entregar y recargar van en serie; mientras tanto el botón queda deshabilitado
  // para que un doble click no mande dos PATCH
  const handleDeliver = async (trackingNumber: string) => {
    if (deliveringId) return

    setDeliveringId(trackingNumber)
    setError(undefined)

    try {
      await shipmentService.deliver(trackingNumber)
      setShipments(await shipmentService.getAll(undefined, selectedStatus))
    } catch (deliverError) {
      setError(errorMessage(deliverError, 'No pudimos completar la entrega'))
    } finally {
      setDeliveringId(null)
    }
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 3,
          mb: 2,
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{ fontWeight: 700 }}
        >
          Envíos
        </Typography>

        <TextField
          size="small"
          placeholder="Buscar por nº o cliente"
          value={search}
          onChange={(event) =>
            handleSearchChange(event.target.value)
          }
          sx={{
            width: 260,
            bgcolor: 'background.paper',
          }}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 2,
        }}
      >
        <Typography variant="body2">
          Estado:
        </Typography>

        <Select
          size="small"
          value={statusFilter}
          onChange={(event) =>
            handleStatusChange(event.target.value as StatusFilter)
          }
          sx={{
            minWidth: 130,
            bgcolor: 'background.paper',
          }}
        >
          <MenuItem value={ALL_STATUSES}>{ALL_STATUSES}</MenuItem>

          {statuses.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {loading && <LoadingState />}

      {[statusesError, error].filter(Boolean).map((message) => (
        <Alert key={message} severity="error" sx={{ mb: 2 }}>
          {message}
        </Alert>
      ))}

      {!loading && (
        <>
          <ShipmentsTable
            shipments={paginatedShipments}
            onDeliver={handleDeliver}
            deliveringId={deliveringId}
          />

          {pageCount > 1 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 3,
              }}
            >
              <Pagination
                count={pageCount}
                page={currentPage}
                onChange={(_, newPage) =>
                  setPage(newPage)
                }
              />
            </Box>
          )}
        </>
      )}
    </Box>
  )
}

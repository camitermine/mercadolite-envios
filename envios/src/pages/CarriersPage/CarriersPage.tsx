import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router'
import { isActiveCarrier, type Carrier } from '../../domain/Carrier'
import { carrierService } from '../../services/carrierService'
import { errorMessage, isAbortError } from '../../services/errors'
import { PATHS } from '../../routes/paths'

interface CarrierLocationState {
  feedback?: string
}

export function CarriersPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const feedback = (location.state as CarrierLocationState | null)?.feedback
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [carrierToDelete, setCarrierToDelete] = useState<Carrier | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadCarriers() {
      try {
        const data = await carrierService.getAll(controller.signal)
        setCarriers(data)
      } catch (error) {
        if (!isAbortError(error)) {
          setPageError(errorMessage(error, 'No pudimos cargar los transportistas'))
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadCarriers()
    return () => controller.abort()
  }, [])

  const handleRetry = async () => {
    setLoading(true)
    setPageError(null)

    try {
      setCarriers(await carrierService.getAll())
    } catch (error) {
      setPageError(errorMessage(error, 'No pudimos cargar los transportistas'))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!carrierToDelete) return

    const carrier = carrierToDelete
    setDeletingId(carrier.id)
    setPageError(null)

    try {
      await carrierService.delete(carrier.id)
      setCarriers((currentCarriers) => currentCarriers.filter(({ id }) => id !== carrier.id))
    } catch (error) {
      setPageError(errorMessage(error, 'No pudimos eliminar el transportista'))
    } finally {
      setDeletingId(null)
      setCarrierToDelete(null)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 3, mb: 2 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
          Transportistas
        </Typography>
        <Button
          variant="contained"
          size="small"
          disableElevation
          startIcon={<AddIcon />}
          onClick={() => navigate(PATHS.newCarrier)}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Nuevo transportista
        </Button>
      </Box>

      {feedback && <Alert severity="success" sx={{ mb: 2 }}>{feedback}</Alert>}
      {pageError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={loading ? undefined : <Button color="inherit" size="small" onClick={handleRetry}>Reintentar</Button>}
        >
          {pageError}
        </Alert>
      )}

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table
          sx={{
            '& th': {
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              color: 'text.tertiary',
            },
            '& td': { fontSize: 13, color: 'text.primary' },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Cobertura</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={28} aria-label="Cargando transportistas" />
                </TableCell>
              </TableRow>
            ) : carriers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No hay transportistas registrados.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              carriers.map((carrier) => (
                <TableRow key={carrier.id} hover>
                  <TableCell>{carrier.name}</TableCell>
                  <TableCell>{carrier.phone}</TableCell>
                  <TableCell>{carrier.coverage}</TableCell>
                  <TableCell>
                    <Chip
                      label={carrier.status}
                      size="small"
                      sx={{
                        backgroundColor: isActiveCarrier(carrier) ? '#DCFCE7' : '#F1F5F9',
                        color: isActiveCarrier(carrier) ? '#166534' : '#475569',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        aria-label={`Editar ${carrier.name}`}
                        sx={{ textTransform: 'none' }}
                        onClick={() => navigate(PATHS.editCarrier(carrier.id))}
                        disabled={deletingId === carrier.id}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        aria-label={`Eliminar ${carrier.name}`}
                        sx={{ textTransform: 'none' }}
                        onClick={() => setCarrierToDelete(carrier)}
                        disabled={deletingId === carrier.id}
                      >
                        {deletingId === carrier.id ? 'Eliminando...' : 'Eliminar'}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={Boolean(carrierToDelete)}
        onClose={() => deletingId === null && setCarrierToDelete(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 2 } } }}
      >
        <DialogTitle>Eliminar transportista</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Querés eliminar a {carrierToDelete?.name}? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => setCarrierToDelete(null)}
            disabled={deletingId !== null}
            sx={{ textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            disableElevation
            onClick={handleDelete}
            disabled={deletingId !== null}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {deletingId !== null ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

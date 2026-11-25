import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router'
import { CARRIER_STATUSES, type CarrierInput, type CarrierStatus } from '../../domain/Carrier'
import {
  normalizeCarrierInput,
  validateCarrier,
  type CarrierErrors,
} from '../../domain/carrierValidation'
import { carrierService } from '../../services/carrierService'
import { errorMessage, fieldErrors, isAbortError } from '../../services/errors'
import { PATHS } from '../../routes/paths'

const EMPTY_CARRIER: CarrierInput = {
  name: '',
  phone: '',
  coverage: '',
  status: 'Activo',
}

const CARRIER_FIELDS = Object.keys(EMPTY_CARRIER) as (keyof CarrierInput)[]

interface CarrierFormProps {
  id?: string
}

function CarrierForm({ id }: CarrierFormProps) {
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [formData, setFormData] = useState<CarrierInput>(EMPTY_CARRIER)
  const [errors, setErrors] = useState<CarrierErrors>({})
  const [initialLoading, setInitialLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const carrierId = Number(id)
    const controller = new AbortController()

    async function loadCarrier() {
      try {
        const carrier = await carrierService.getById(carrierId, controller.signal)
        setFormData({
          name: carrier.name,
          phone: carrier.phone,
          coverage: carrier.coverage,
          status: carrier.status,
        })
      } catch (error) {
        if (!isAbortError(error)) {
          setLoadError(errorMessage(error, 'No pudimos cargar el transportista'))
        }
      } finally {
        if (!controller.signal.aborted) {
          setInitialLoading(false)
        }
      }
    }

    void loadCarrier()
    return () => controller.abort()
  }, [id])

  const handleChange = (field: keyof CarrierInput, value: string) => {
    setFormData((currentForm) => ({ ...currentForm, [field]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }))
    setSubmitError(null)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedCarrier = normalizeCarrierInput(formData)
    const validationErrors = validateCarrier(normalizedCarrier)

    setFormData(normalizedCarrier)
    setErrors(validationErrors)
    setSubmitError(null)

    if (Object.keys(validationErrors).length > 0) return

    setSaving(true)

    try {
      if (id) {
        await carrierService.update(Number(id), normalizedCarrier)
      } else {
        await carrierService.create(normalizedCarrier)
      }

      navigate(PATHS.carriers, {
        state: {
          feedback: id
            ? 'Transportista actualizado correctamente'
            : 'Transportista creado correctamente',
        },
      })
    } catch (error) {
      const backendErrors = fieldErrors(error, CARRIER_FIELDS)

      if (Object.keys(backendErrors).length > 0) {
        setErrors(backendErrors)
      } else {
        setSubmitError(errorMessage(error, 'No pudimos guardar el transportista'))
      }
    } finally {
      setSaving(false)
    }
  }

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress aria-label="Cargando transportista" />
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 720 }}>
      <Button
        size="small"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(PATHS.carriers)}
        sx={{ mb: 2, color: 'text.secondary', textTransform: 'none' }}
      >
        Volver a transportistas
      </Button>

      <Typography variant="h5" component="h1" sx={{ mb: 3, fontWeight: 700 }}>
        {isEditing ? 'Editar transportista' : 'Nuevo transportista'}
      </Typography>

      {loadError ? (
        <Alert severity="error" action={<Button color="inherit" onClick={() => navigate(PATHS.carriers)}>Volver</Button>}>
          {loadError}
        </Alert>
      ) : (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {submitError && <Alert severity="error">{submitError}</Alert>}

              <TextField
                size="small"
                label="Nombre"
                placeholder="Nombre del transportista"
                fullWidth
                value={formData.name}
                onChange={(event) => handleChange('name', event.target.value)}
                error={Boolean(errors.name)}
                helperText={errors.name}
                slotProps={{ htmlInput: { maxLength: 80 } }}
                autoFocus
              />

              <TextField
                size="small"
                label="Teléfono"
                placeholder="Ej: 0810-000-0000"
                fullWidth
                value={formData.phone}
                onChange={(event) => handleChange('phone', event.target.value)}
                error={Boolean(errors.phone)}
                helperText={errors.phone}
                slotProps={{ htmlInput: { maxLength: 30 } }}
              />

              <TextField
                size="small"
                label="Cobertura"
                placeholder="Ej: Nacional, AMBA..."
                fullWidth
                value={formData.coverage}
                onChange={(event) => handleChange('coverage', event.target.value)}
                error={Boolean(errors.coverage)}
                helperText={errors.coverage}
                slotProps={{ htmlInput: { maxLength: 120 } }}
              />

              <FormControl fullWidth size="small" error={Boolean(errors.status)}>
                <InputLabel id="status-label">Estado</InputLabel>
                <Select
                  labelId="status-label"
                  value={formData.status}
                  label="Estado"
                  onChange={(event) => handleChange('status', event.target.value as CarrierStatus)}
                >
                  {CARRIER_STATUSES.map((status) => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
                {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
              </FormControl>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 1,
                  mt: 1,
                  pt: 2,
                  borderTop: 1,
                  borderColor: 'divider',
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  color="inherit"
                  onClick={() => navigate(PATHS.carriers)}
                  sx={{ textTransform: 'none' }}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="small"
                  disableElevation
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  )
}

export function CarrierFormPage() {
  const { id } = useParams<{ id: string }>()
  return <CarrierForm key={id ?? 'new'} id={id} />
}

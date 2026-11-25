
import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
} from '@mui/material'
import { useNavigate } from 'react-router'
import { assignableCarriers, type Carrier } from '../../../domain/Carrier'
import type { ShipmentInput, ShipmentStatus } from '../../../domain/Shipment'
import {
  normalizeShipmentInput,
  SHIPMENT_MAX_LENGTHS,
  validateShipment,
  type ShipmentErrors,
} from '../../../domain/shipmentValidation'
import { carrierService } from '../../../services/carrierService'
import { errorMessage, fieldErrors, isAbortError } from '../../../services/errors'
import { LoadingState } from '../../../components/LoadingState'
import { PATHS } from '../../../routes/paths'

const NO_CARRIER = ''

const SHIPMENT_FIELDS = [
  'trackingNumber',
  'clientName',
  'address',
  'destination',
  'product',
  'carrierId',
  'estimatedDate',
] as const

const TEXT_FIELDS = [
  { field: 'clientName', label: 'Cliente' },
  { field: 'address', label: 'Dirección' },
  { field: 'destination', label: 'Localidad' },
  { field: 'product', label: 'Producto' },
] as const

export type ShipmentFormMode = 'create' | 'edit' | 'view'

interface ShipmentFormProps {
  mode: ShipmentFormMode
  initialShipment: ShipmentInput
  status: ShipmentStatus
  effectiveDate?: string | null
  cancelPath: string
  onSubmit: (shipment: ShipmentInput) => Promise<unknown>
}

export function ShipmentForm({
  mode,
  initialShipment,
  status,
  effectiveDate,
  cancelPath,
  onSubmit,
}: ShipmentFormProps) {
  const navigate = useNavigate()
  const isCreating = mode === 'create'
  const isViewing = mode === 'view'
  const isDelivered = status === 'Entregado'
  const isDisabled = isViewing || isDelivered

  const [formData, setFormData] = useState<ShipmentInput>(initialShipment)
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [errors, setErrors] = useState<ShipmentErrors>({})
  const [loadingCarriers, setLoadingCarriers] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadCarriers() {
      try {
        // Un envío existente conserva su transportista aunque ya no esté activo
        const options = assignableCarriers(
          await carrierService.getAll(controller.signal),
          isCreating ? undefined : initialShipment.carrierId,
        )
        setCarriers(options)

        // Al crear, si el transportista elegido dejó de estar activo hay que volver a elegir
        setFormData((currentForm) =>
          options.some((carrier) => carrier.id === currentForm.carrierId)
            ? currentForm
            : { ...currentForm, carrierId: undefined },
        )
      } catch (error) {
        if (!isAbortError(error)) {
          setLoadError(errorMessage(error, 'No pudimos cargar los transportistas'))
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingCarriers(false)
        }
      }
    }

    void loadCarriers()
    return () => controller.abort()
  }, [isCreating, initialShipment.carrierId])

  const handleChange = <Field extends keyof ShipmentInput>(
    field: Field,
    value: ShipmentInput[Field],
  ) => {
    setFormData((currentForm) => ({ ...currentForm, [field]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }))
    setSubmitError(null)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isDisabled) return

    const normalizedShipment = normalizeShipmentInput(formData)
    const validationErrors = validateShipment(
      normalizedShipment,
      new Date(),
      isCreating ? undefined : initialShipment.estimatedDate,
    )

    setFormData(normalizedShipment)
    setErrors(validationErrors)
    setSubmitError(null)

    if (Object.keys(validationErrors).length > 0) return

    setSaving(true)

    try {
      await onSubmit(normalizedShipment)
      navigate(PATHS.shipments, { replace: true })
    } catch (error) {
      const backendErrors = fieldErrors(error, SHIPMENT_FIELDS)

      if (Object.keys(backendErrors).length > 0) {
        setErrors(backendErrors)
      } else {
        setSubmitError(errorMessage(error, 'No pudimos guardar el envío'))
      }
    } finally {
      setSaving(false)
    }
  }

  if (loadingCarriers) {
    return <LoadingState label="Cargando transportistas" />
  }

  if (loadError) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" onClick={() => navigate(cancelPath)}>
            Volver
          </Button>
        }
      >
        {loadError}
      </Alert>
    )
  }

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {submitError && <Alert severity="error">{submitError}</Alert>}

          <TextField
            size="small"
            label="Nº de seguimiento"
            fullWidth
            disabled
            value={formData.trackingNumber}
            error={Boolean(errors.trackingNumber)}
            helperText={errors.trackingNumber}
            slotProps={{ htmlInput: { readOnly: true } }}
          />

          {TEXT_FIELDS.map(({ field, label }) => (
            <TextField
              key={field}
              size="small"
              label={label}
              fullWidth
              disabled={isDisabled}
              value={formData[field]}
              onChange={(event) => handleChange(field, event.target.value)}
              error={Boolean(errors[field])}
              helperText={errors[field]}
              slotProps={{
                htmlInput: { maxLength: SHIPMENT_MAX_LENGTHS[field] },
              }}
            />
          ))}

          <FormControl
            fullWidth
            size="small"
            disabled={isDisabled}
            error={Boolean(errors.carrierId)}
          >
            <InputLabel id="shipment-carrier-label">
              Transportista
            </InputLabel>
            <Select<number | typeof NO_CARRIER>
              labelId="shipment-carrier-label"
              value={formData.carrierId ?? NO_CARRIER}
              label="Transportista"
              onChange={(event) => {
                const value = event.target.value
                handleChange(
                  'carrierId',
                  value === NO_CARRIER ? undefined : Number(value),
                )
              }}
            >
              {carriers.map((carrier) => (
                <MenuItem key={carrier.id} value={carrier.id}>
                  {carrier.name}
                </MenuItem>
              ))}
            </Select>
            {errors.carrierId && (
              <FormHelperText>{errors.carrierId}</FormHelperText>
            )}
          </FormControl>

          <TextField
            size="small"
            label="Estado"
            fullWidth
            disabled
            value={status}
            slotProps={{ htmlInput: { readOnly: true } }}
          />

          <TextField
            size="small"
            type="date"
            label="Fecha estimada de entrega"
            fullWidth
            disabled={isDisabled}
            value={formData.estimatedDate}
            onChange={(event) =>
              handleChange('estimatedDate', event.target.value)
            }
            error={Boolean(errors.estimatedDate)}
            helperText={errors.estimatedDate}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          {!isCreating && (
            <TextField
              size="small"
              label="Fecha efectiva de entrega"
              fullWidth
              disabled
              value={effectiveDate ?? 'Sin entregar'}
              slotProps={{ htmlInput: { readOnly: true } }}
            />
          )}

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
              onClick={() => navigate(cancelPath)}
              sx={{ textTransform: 'none' }}
              disabled={saving}
            >
              {isViewing || isDelivered ? 'Volver' : 'Cancelar'}
            </Button>

            {!isDisabled && (
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
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  )
}

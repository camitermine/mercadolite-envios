import { Alert } from '@mui/material'
import { LoadingState } from '../../../components/LoadingState'
import { useUtils } from '../../../hooks/useUtils'
import { dashboardService } from '../dashboardService'
import { useDashboardPage } from '../hooks/useDashboardPage'
import { SummaryList } from './SummaryList'

export function DelayedShipmentsList() {
  const { formatDays } = useUtils()
  const { data, page, setPage, loading, error } = useDashboardPage(
    dashboardService.getDelayedShipments,
    'No pudimos cargar los envíos demorados',
  )

  if (error) return <Alert severity="error">{error}</Alert>
  if (loading && !data) return <LoadingState label="Cargando envíos demorados" />

  const items = (data?.content ?? []).map((shipment) => ({
    id: shipment.trackingNumber,
    title: shipment.trackingNumber,
    subtitle: shipment.clientName,
    value: formatDays(shipment.delayDays),
    isAlert: true,
  }))

  return (
    <SummaryList
      title="Envíos demorados"
      items={items}
      emptyMessage="No hay envíos demorados."
      page={page}
      pageCount={data?.totalPages}
      onPageChange={setPage}
    />
  )
}

import { Alert } from '@mui/material'
import { LoadingState } from '../../../components/LoadingState'
import { dashboardService } from '../dashboardService'
import { useDashboardPage } from '../hooks/useDashboardPage'
import { SummaryList } from './SummaryList'

export function UpcomingDeliveriesList() {
  const { data, page, setPage, loading, error } = useDashboardPage(
    dashboardService.getUpcomingDeliveries,
    'No pudimos cargar las próximas entregas',
  )

  if (error) return <Alert severity="error">{error}</Alert>
  if (loading && !data) return <LoadingState label="Cargando próximas entregas" />

  const items = (data?.content ?? []).map((delivery) => ({
    id: delivery.trackingNumber,
    title: delivery.clientName,
    subtitle: delivery.destination,
    value: delivery.estimatedDate,
  }))

  return (
    <SummaryList
      title="Próximas entregas"
      items={items}
      emptyMessage="No hay entregas próximas."
      page={page}
      pageCount={data?.totalPages}
      onPageChange={setPage}
    />
  )
}

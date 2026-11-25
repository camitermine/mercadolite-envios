import { useEffect, useState } from 'react'
import { Alert, Box, Typography } from '@mui/material'
import { LoadingState } from '../../components/LoadingState'
import { errorMessage } from '../../services/errors'
import { dashboardService, type DashboardStats } from './dashboardService'
import { StatCard } from './components/StatCard'
import { DelayedShipmentsList } from './components/DelayedShipmentsList'
import { UpcomingDeliveriesList } from './components/UpcomingDeliveriesList'

export function HomePage() {
  const [stats, setStats] = useState<DashboardStats>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  useEffect(() => {
    dashboardService.getStats()
      .then(setStats)
      .catch((loadError) => setError(errorMessage(loadError, 'No pudimos cargar el resumen')))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Box>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 3 }}>
        Resumen
      </Typography>

      {loading && <LoadingState />}
      {error && <Alert severity="error">{error}</Alert>}

      {stats && (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
            <StatCard value={stats.preparing} label="En preparación" />
            <StatCard value={stats.inTransit} label="En camino" />
            <StatCard value={stats.deliveredToday} label="Entregados hoy" />
            <StatCard value={stats.delayed} label="Demorados" isHighlighted />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, alignItems: 'start' }}>
            <DelayedShipmentsList />
            <UpcomingDeliveriesList />
          </Box>
        </>
      )}
    </Box>
  )
}

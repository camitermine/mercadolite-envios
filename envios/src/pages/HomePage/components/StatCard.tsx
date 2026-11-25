import { Paper, Typography } from '@mui/material'

interface StatCardProps {
  value: number
  label: string
  isHighlighted?: boolean
}

export function StatCard({ value, label, isHighlighted = false }: StatCardProps) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, px: 2.5, py: 2.5 }}>
      <Typography
        sx={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2, color: isHighlighted ? 'error.main' : 'text.primary' }}
      >
        {value}
      </Typography>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5 }}>{label}</Typography>
    </Paper>
  )
}

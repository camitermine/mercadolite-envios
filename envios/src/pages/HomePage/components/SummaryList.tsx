import { Box, Pagination, Paper, Typography } from '@mui/material'

export interface SummaryListItem {
  id: string
  title: string
  subtitle: string
  value: string
  isAlert?: boolean
}

interface SummaryListProps {
  title: string
  items: SummaryListItem[]
  emptyMessage: string
  page?: number
  pageCount?: number
  onPageChange?: (page: number) => void
}

export function SummaryList({ title, items, emptyMessage, page, pageCount = 0, onPageChange }: SummaryListProps) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Typography
        component="h2"
        sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary', px: 2.5, py: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        {title}
      </Typography>
      {items.map((item) => (
        <Box
          key={item.id}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            px: 2.5,
            py: 1.5,
            '&:not(:last-of-type)': { borderBottom: 1, borderColor: 'divider' },
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>{item.title}</Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{item.subtitle}</Typography>
          </Box>
          <Typography
            sx={{ fontSize: 12, fontWeight: 600, flexShrink: 0, color: item.isAlert ? 'error.main' : 'text.primary' }}
          >
            {item.value}
          </Typography>
        </Box>
      ))}
      {items.length === 0 && (
        <Typography sx={{ fontSize: 13, color: 'text.secondary', textAlign: 'center', py: 4 }}>{emptyMessage}</Typography>
      )}
      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5, borderTop: 1, borderColor: 'divider' }}>
          <Pagination
            size="small"
            count={pageCount}
            page={page}
            onChange={(_, newPage) => onPageChange?.(newPage)}
          />
        </Box>
      )}
    </Paper>
  )
}

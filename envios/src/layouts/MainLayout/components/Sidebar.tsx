import { Box, List, ListItemButton, Typography } from '@mui/material'
import { NavLink } from 'react-router'
import { PATHS } from '../../../routes/paths'

const SIDEBAR_WIDTH = 240

const NAV_ITEMS = [
  { label: 'Dashboard', path: PATHS.dashboard },
  { label: 'Pendientes', path: PATHS.pending },
  { label: 'Envíos', path: PATHS.shipments },
  { label: 'Transportistas', path: PATHS.carriers },
]

export function Sidebar() {
  return (
    <Box
      component="aside"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        px: 1.5,
        py: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, mb: 3 }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1.5,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          E
        </Box>
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: 'text.primary' }}>Envíos</Typography>
      </Box>
      <List component="nav" disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            end
            sx={{
              borderRadius: 2,
              px: 1.5,
              py: 1,
              fontSize: 14,
              fontWeight: 500,
              color: 'text.secondary',
              '&.active': {
                bgcolor: 'primary.lighter',
                color: 'primary.main',
                fontWeight: 600,
              },
            }}
          >
            {item.label}
          </ListItemButton>
        ))}
      </List>
    </Box>
  )
}

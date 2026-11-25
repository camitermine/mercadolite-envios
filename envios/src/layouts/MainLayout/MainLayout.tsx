import { Box } from '@mui/material'
import { Outlet } from 'react-router'
import { Sidebar } from './components/Sidebar'

export function MainLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: 4 }}>
        <Outlet />
      </Box>
    </Box>
  )
}

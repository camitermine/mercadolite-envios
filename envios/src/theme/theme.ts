import { createTheme } from '@mui/material/styles'
import { COLORS } from './colors'

declare module '@mui/material/styles' {
  interface PaletteColor {
    lighter?: string
  }
  interface SimplePaletteColorOptions {
    lighter?: string
  }
  interface TypeText {
    tertiary: string
  }
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: COLORS.indigo600,
      lighter: COLORS.indigo50,
      contrastText: COLORS.white,
    },
    error: {
      main: COLORS.red600,
      contrastText: COLORS.white,
    },
    background: {
      default: COLORS.slate50,
      paper: COLORS.white,
    },
    divider: COLORS.slate200,
    text: {
      primary: COLORS.slate900,
      secondary: COLORS.slate600,
      tertiary: COLORS.slate500,
    },
  },
})

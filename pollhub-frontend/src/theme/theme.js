// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark', // Isso ativa o tema escuro
    primary: {
      main: '#1976d2', // Azul padrão MUI, pode customizar
    },
    background: {
      default: '#101624', // Fundo escuro igual ao template
      paper: '#1a2236',   // Card escuro
    },
    text: {
      primary: '#fff',
      secondary: '#b0b8c1',
    },
  },
  shape: {
    borderRadius: 12,
  },
});

export default theme;

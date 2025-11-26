// theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontSize: 14, // base
    fontFamily: "'Roboto', 'Arial', sans-serif",
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: 200, // standard drawer
        },
      },
    },
  },
});

export default theme;

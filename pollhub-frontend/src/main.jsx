import React from "react";
import ReactDOM from "react-dom/client";
import App from "./AppRoutes";
import { BrowserRouter } from "react-router-dom";
import theme from "./theme/theme.js"; 
import { ThemeProvider } from "@mui/material";
import { CssBaseline } from '@mui/material';
import { AuthProvider } from "./contexts/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <CssBaseline />
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);

import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Helmet } from "react-helmet";
import {
  Box,
  CssBaseline,
  Typography,
  Container,
  Paper,
  Button,
  TextField,
  Link,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  FormLabel,
  InputAdornment,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import api from '../api/client';

// Estilos consistentes com o padrão do Dashboard
const StyledPaper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(135deg, rgba(138,43,226,0.22) 0%, rgba(24,8,124,0.22) 100%)',
  border: '1.5px solid rgba(255,255,255,0.12)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRadius: 24,
  boxShadow: '0px 8px 32px 0px rgba(0,0,0,0.45)',
  width: '100%',
  maxWidth: 420,
  padding: theme.spacing(4),
  margin: 'auto',
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

// Container para a página de cadastro
const RegisterContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100vw',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  background: `
    radial-gradient(
      ellipse at 50% 50%,
      rgba(138, 43, 226, 0.20) 0%,    /* MESMA COR DO CARD, translúcida */
      rgba(24, 23, 31, 0.92) 70%,     /* escurecendo para fora */
      rgba(18, 18, 28, 1) 100%
    )
  `,
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  padding: theme.spacing(2),
}));

// Componente estilizado para o botão
const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#8A2BE2',
  color: 'white',
  borderRadius: 8,
  padding: theme.spacing(1.5),
  fontWeight: 500,
  textTransform: 'none',
  fontSize: '1rem',
  '&:hover': {
    backgroundColor: '#7B1FA2',
  },
  '&.Mui-disabled': {
    backgroundColor: 'rgba(138, 43, 226, 0.5)',
    color: 'rgba(255, 255, 255, 0.7)',
  }
}));

// Componente estilizado para campos de texto
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    '&.Mui-focused fieldset': {
      borderColor: '#8A2BE2',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: theme.spacing(1.5),
    color: 'white',
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    '&.Mui-focused': {
      color: '#8A2BE2',
    },
  },
  '& .MuiInputAdornment-root': {
    color: 'rgba(255, 255, 255, 0.5)',
  },
}));

export default function Register() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({
    username: { error: false, message: '' },
    email: { error: false, message: '' },
    password: { error: false, message: '' }
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpa os erros ao digitar
    if (errors[name]?.error) {
      setErrors({
        ...errors,
        [name]: { error: false, message: '' }
      });
    }
  };

  const validateInputs = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!formData.username || formData.username.length < 3) {
      newErrors.username = { error: true, message: 'Nome de usuário deve ter pelo menos 3 caracteres.' };
      isValid = false;
    } else {
      newErrors.username = { error: false, message: '' };
    }

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = { error: true, message: 'Por favor, insira um email válido.' };
      isValid = false;
    } else {
      newErrors.email = { error: false, message: '' };
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = { error: true, message: 'A senha deve ter pelo menos 6 caracteres.' };
      isValid = false;
    } else {
      newErrors.password = { error: false, message: '' };
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateInputs()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Conectando com o endpoint de registro da API
      const response = await api.post('/api/users/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      setSnackbar({
        open: true,
        message: 'Cadastro realizado com sucesso!',
        severity: 'success'
      });
      
      // Redirecionamento para login após cadastro com sucesso
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao registrar:', error);
      
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Erro ao realizar cadastro. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
     <Helmet>
        <title>Cadastro - PollHub</title>
      </Helmet>
      <CssBaseline />
      <RegisterContainer>
        <Container maxWidth="sm">
          <StyledPaper elevation={6}>
            {/* Cabeçalho do Cadastro */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3
            }}>
              <Box sx={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}>
                <BarChartIcon fontSize="large" sx={{ color: '#8A2BE2', fontSize: '2rem' }} />
              </Box>
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  color: 'blueviolet',
                  fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
                  fontWeight: 400,
                  letterSpacing: '0.5px',
                  fontSize: '1.8rem'
                }}
              >
                PollHub
              </Typography>
              <Typography 
                variant="h6" 
                component="h2" 
                sx={{ 
                  color: 'white',
                  fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
                  fontWeight: 300,
                  mt: 1
                }}
              >
                Crie sua conta
              </Typography>
            </Box>

            {/* Formulário de Cadastro */}
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}
            >
              <FormControl fullWidth>
                <FormLabel 
                  htmlFor="username" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    mb: 1,
                    fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif'
                  }}
                >
                  Nome de usuário
                </FormLabel>
                <StyledTextField
                  variant="outlined"
                  sx={{ mb: -1}}
                  id="username"
                  name="username"
                  placeholder="Digite seu nome de usuário"
                  fullWidth
                  value={formData.username}
                  onChange={handleInputChange}
                  error={errors.username.error}
                  helperText={errors.username.message}
                  autoComplete="username"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>

              <FormControl fullWidth>
                <FormLabel 
                  htmlFor="email" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    mb: 1,
                    fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif'
                  }}
                >
                  Email
                </FormLabel>
                <StyledTextField
                  variant="outlined"
                  sx={{ mb: -1}}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Digite seu email"
                  fullWidth
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email.error}
                  helperText={errors.email.message}
                  autoComplete="email"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>

              <FormControl fullWidth>
                <FormLabel 
                  htmlFor="password" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    mb: 1,
                    fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif'
                  }}
                >
                  Senha
                </FormLabel>
                <StyledTextField
                  variant="outlined"
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha"
                  fullWidth
                  value={formData.password}
                  onChange={handleInputChange}
                  error={errors.password.error}
                  helperText={errors.password.message}
                  autoComplete="new-password"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                          sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>

              <StyledButton
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  'Cadastrar'
                )}
              </StyledButton>
            </Box>

            {/* Links adicionais */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
                fontSize: '0.9rem'
              }}>
                Já tem uma conta?{' '}
                <Link 
                  component={RouterLink} 
                  to="/login" 
                  sx={{ 
                    color: '#8A2BE2',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Entrar
                </Link>
              </Typography>
            </Box>
          </StyledPaper>
        </Container>
      </RegisterContainer>

      {/* Snackbar para notificações */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleClose} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            '& .MuiAlert-message': {
              fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const RegisterContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function Register(props) {
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
    }
  };

  return (
    <>
      <CssBaseline enableColorScheme />
      <RegisterContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Box sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "#1976d2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1
          }}>
            <Typography variant="h4" sx={{ color: "#fff" }}>📊</Typography>
          </Box>
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Cadastro
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <FormControl>
              <FormLabel htmlFor="username">Nome de usuário</FormLabel>
              <TextField
                autoComplete="username"
                name="username"
                required
                fullWidth
                id="username"
                placeholder="usuario123"
                value={formData.username}
                onChange={handleInputChange}
                error={errors.username.error}
                helperText={errors.username.message}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                required
                fullWidth
                id="email"
                placeholder="seu@email.com"
                name="email"
                autoComplete="email"
                variant="outlined"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email.error}
                helperText={errors.email.message}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Senha</FormLabel>
              <TextField
                required
                fullWidth
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="new-password"
                variant="outlined"
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password.error}
                helperText={errors.password.message}
              />
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
            >
              Cadastrar
            </Button>
            <Typography sx={{ textAlign: 'center' }}>
              Já tem uma conta?{' '}
              <Link
                href="/login"
                variant="body2"
                sx={{ alignSelf: 'center' }}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
                }}
              >
                Entrar
              </Link>
            </Typography>
          </Box>
        </Card>
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </RegisterContainer>
    </>
  );
  
}
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  CssBaseline,
  Typography,
  Container,
  Grid,
  Paper,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import PollIcon from '@mui/icons-material/Poll';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import api from '../api/client';
import PollCard from '../components/PollCard';
import PollCreationDialog from '../components/PollCreationDialog';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom'; 4
import HowToVoteIcon from '@mui/icons-material/HowToVote';



const drawerWidth = 240;

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  // Log para debug - verificar a estrutura do objeto user
  console.log('User object:', user);

  // Estado para gerenciar UI e dados
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userPolls, setUserPolls] = useState([]);
  const [allPolls, setAllPolls] = useState([]);
  const [showResultsMap, setShowResultsMap] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Carregar dados quando o componente montar
  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleResults = (pollId, value) => {
    setShowResultsMap(prev => ({ ...prev, [pollId]: value }));
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Faz chamadas autenticadas conforme os endpoints do swagger
      const [userPollsRes, allPollsRes] = await Promise.all([
        api.get('/api/users/me/polls'),
        api.get('/api/polls')
      ]);

      // Processa os dados
      const sortByDate = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);
      setUserPolls(userPollsRes.data.sort(sortByDate));
      setAllPolls(allPollsRes.data.sort(sortByDate));

    } catch (error) {
      console.error('Erro ao buscar dados:', error);

      // Se receber erro 401 (não autorizado), redirecionar para login
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      }

      // Trata erros específicos
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Erro ao carregar dados',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Usa o método logout do contexto
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreatePoll = async (pollData) => {
    try {
      const response = await api.post('/api/polls', pollData);

      setUserPolls(prev => [response.data, ...prev]);
      setAllPolls(prev => [response.data, ...prev]);

      setSnackbar({
        open: true,
        message: 'Enquete criada com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      // Se receber erro 401 (não autorizado), redirecionar para login
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
        return;
      }

      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        'Erro ao criar enquete';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setDialogOpen(false);
    }
  };

  // Lidar com o voto conforme o endpoint /api/polls/{id}/vote
  const handleVote = async (pollId, optionId) => {
    try {
      await api.post(`/api/polls/${pollId}/vote?optionId=${optionId}`);
      fetchData();
      setSnackbar({
        open: true,
        message: 'Voto registrado com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
        setSnackbar({
          open: true,
          message: 'Sessão expirada. Redirecionando para login...',
          severity: 'error'
        });
      } else if (
        error.response?.status === 400 &&
        error.response.data.message === "Você já votou nesta enquete"
      ) {
        handleToggleResults(pollId, true);
        setSnackbar({
          open: true,
          message: 'Você já votou nesta enquete',
          severity: 'warning'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Erro ao processar seu voto',
          severity: 'error'
        });
      }
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const drawer = (
    <Box sx={{ bgcolor: '#1a1e2b', color: 'white', height: '100%' }}>
      {/* Logo e nome do app */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: '#2c3149',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mr: 1
        }}>
          <Typography variant="h6" sx={{ color: '#fff' }}>📊</Typography>
        </Box>
        <Typography variant="h6" noWrap component="div" sx={{ color: 'white' }}>
          Poll App
        </Typography>
      </Box>
      <Divider sx={{ backgroundColor: '#2c3149' }} />

      {/* Perfil do usuário */}
      <Box sx={{ py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton sx={{ py: 1.5 }}>
            <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText
              primary={user ? (user.username || user.name || user.email || 'Usuário') : 'Usuário'}
              primaryTypographyProps={{ sx: { color: 'white' } }}
            />
          </ListItemButton>
        </ListItem>
      </Box>

      {/* Menu principal */}
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => setDialogOpen(true)} sx={{ py: 1.5 }}>
            <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
              <AddCircleIcon />
            </ListItemIcon>
            <ListItemText
              primary="Nova Enquete"
              primaryTypographyProps={{ sx: { color: 'white' } }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
          component={Link}
          to="/dashboard" sx={{ py: 1.5 }}>
            <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
              <PollIcon />
            </ListItemIcon>
            <ListItemText
              primary="Minhas Enquetes"
              primaryTypographyProps={{ sx: { color: 'white' } }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/my-votes"
            sx={{ py: 1.5 }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
              <HowToVoteIcon />
            </ListItemIcon>
            <ListItemText
              primary="Meus Votos"
              primaryTypographyProps={{ sx: { color: 'white' } }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/polls"
            sx={{ py: 1.5 }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
              <PollIcon />
            </ListItemIcon>
            <ListItemText
              primary="Todas Enquetes"
              primaryTypographyProps={{ sx: { color: 'white' } }}
            />
          </ListItemButton>
        </ListItem>
      </List>

      {/* Botão de sair - FORA do <List> */}
      <Box sx={{ mt: 2 }}>
        <Divider sx={{ backgroundColor: '#2c3149' }} />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout} sx={{ py: 1.5 }}>
              <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Sair"
                primaryTypographyProps={{ sx: { color: 'white' } }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  // Mostra loading enquanto carrega dados
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#2c3149',
          boxShadow: 'none',
          borderBottom: '1px solid #3a3f50'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="abrir menu"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Drawer para dispositivos móveis */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Melhor desempenho em dispositivos móveis
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: '#1a1e2b',
              borderRight: '1px solid #2c3149'
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* Drawer permanente para desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: '#1a1e2b',
              borderRight: '1px solid #2c3149'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          backgroundColor: '#252a3b',
          minHeight: '100vh'
        }}
      >
        <Container maxWidth="lg">
          {userPolls.length > 0 && (
            <>
              <Typography variant="h5" gutterBottom>
                Minhas Enquetes
              </Typography>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {userPolls.map((poll) => (
                  <Grid item xs={12} sm={6} md={4} key={poll.id}>
                    <PollCard
                      poll={poll}
                      onVote={handleVote}
                      showResults={showResultsMap[poll.id] || false}
                      isOwner={true}
                      onToggleResults={handleToggleResults}
                    />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Container>

        {/* Dialog para criação de enquete */}
        <PollCreationDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleCreatePoll}
        />

        {/* Snackbar para notificações */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
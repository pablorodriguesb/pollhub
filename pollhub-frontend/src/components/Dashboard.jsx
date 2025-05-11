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
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import PollIcon from '@mui/icons-material/Poll';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import api from '../api/client';
import PollCard from './PollCard';
import PollCreationDialog from './PollCreationDialog';

const drawerWidth = 240;

export default function Dashboard() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userPolls, setUserPolls] = useState([]);
  const [allPolls, setAllPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [user, setUser] = useState({
    username: ''
  });

  useEffect(() => {
    // Verificar se o usuário está autenticado
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Erro ao processar dados do usuário:', e);
        navigate('/login');
        return;
      }
    }
    
    // Configurar o token de autenticação para todas as requisições
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Carregar dados
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Busca paralela para melhor performance
      const [userPollsRes, allPollsRes] = await Promise.all([
        api.get('/api/users/me/polls'),
        api.get('/api/polls')
      ]);
  
      // Ordenação por data de criação (mais recente primeiro)
      const sortByDate = (a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt);
  
      setUserPolls(userPollsRes.data.sort(sortByDate));
      setAllPolls(allPollsRes.data.sort(sortByDate));
  
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      
      // Tratamento melhorado de erro 401
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/login', { state: { from: location.pathname } });
      } else {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Erro ao carregar dados',
          severity: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };
  

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleCreatePoll = async (pollData) => {
    try {
      const response = await api.post('/api/polls', {
        ...pollData,
        durationInDays: expirationDays // Campo esperado pelo DTO
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      // Atualização otimizada do estado local
      setUserPolls(prev => [response.data, ...prev]);
      setAllPolls(prev => [response.data, ...prev]);
  
      setSnackbar({
        open: true,
        message: 'Enquete criada com sucesso!',
        severity: 'success'
      });
  
    } catch (error) {
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
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Erro ao votar.',
        severity: 'error'
      });
    }
  };
  

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const drawer = (
    <Box sx={{ bgcolor: 'background.default', height: '100%' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: '#1976d2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mr: 1
        }}>
          <Typography variant="h4" sx={{ color: '#fff' }}>📊</Typography>
        </Box>
        <Typography variant="h6" noWrap component="div">
          Poll App
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary={user.username} />
          </ListItemButton>
        </ListItem>
        <Divider />
        <ListItem disablePadding>
          <ListItemButton onClick={() => setDialogOpen(true)}>
            <ListItemIcon>
              <AddCircleIcon />
            </ListItemIcon>
            <ListItemText primary="Nova Enquete" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <PollIcon />
            </ListItemIcon>
            <ListItemText primary="Minhas Enquetes" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <HowToVoteIcon />
            </ListItemIcon>
            <ListItemText primary="Todas Enquetes" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Sair" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  if (loading) {
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
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        {/* Drawer permanente para desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
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
          backgroundColor: (theme) => theme.palette.mode === 'light' 
            ? theme.palette.grey[100] 
            : theme.palette.grey[900],
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
                      isOwner={true}
                    />
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          <Typography variant="h5" gutterBottom>
            Todas Enquetes
          </Typography>
          {allPolls.length > 0 ? (
            <Grid container spacing={3}>
              {allPolls.map((poll) => (
                <Grid item xs={12} sm={6} md={4} key={poll.id}>
                  <PollCard 
                    poll={poll} 
                    onVote={handleVote} 
                    isOwner={poll.createdBy === user.username}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Nenhuma enquete disponível. Crie uma nova enquete!
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddCircleIcon />}
                onClick={() => setDialogOpen(true)}
                sx={{ mt: 2 }}
              >
                Nova Enquete
              </Button>
            </Paper>
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
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
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import PollIcon from '@mui/icons-material/Poll';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import api from '../api/client';
import PollCard from '../components/PollCard';
import PollCreationDialog from '../components/PollCreationDialog';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import BarChartIcon from '@mui/icons-material/BarChart';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import InfoIcon from '@mui/icons-material/Info';




// Definição da largura do drawer (menu lateral)
const drawerWidth = 240;

// Estilos consistentes com o componente de referência
const StyledPaper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'hsl(220, 30%, 15%)',
  borderRadius: 0,
  boxShadow: 'none',
  width: '100%',
}));

// ContentWrapper ajustado para remover espaço entre o menu e o conteúdo
const ContentWrapper = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: 0,
  margin: 0,
  paddingTop: 0,
  marginTop: theme.spacing(7),
  minHeight: '100vh',
  backgroundColor: 'hsl(220, 30%, 10%)',
  backgroundImage: 'none',
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.up('sm')]: {
    marginLeft: 0, // Colado ao menu lateral
    width: `calc(100% - ${drawerWidth}px)`,
    paddingRight: theme.spacing(2), // Espaço à direita para o card não encostar na borda da tela
    paddingTop: theme.spacing(2), // Espaço para separar do AppBar
  },
}));

// StyledAppBar ajustado para alinhar perfeitamente com o título Poll App
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'hsl(220, 30%, 15%)',
  boxShadow: 'none',
  borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
  height: '64px',
  [theme.breakpoints.up('sm')]: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
  },
}));

// LogoBox consistente com a altura do AppBar
const LogoBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  paddingLeft: theme.spacing(3),
  height: '64px',
}));

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Estado para gerenciar UI e dados
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userPolls, setUserPolls] = useState([]);
  const [allPolls, setAllPolls] = useState([]);
  const [showResultsMap, setShowResultsMap] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detalheAberto, setDetalheAberto] = useState(null);
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
      // 1. Envia o voto para o backend
      await api.post(`/api/polls/${pollId}/vote?optionId=${optionId}`);

      // 2. Busca o poll atualizado
      const { data: updatedPoll } = await api.get(`/api/polls/${pollId}`);

      // 3. Atualiza apenas o poll votado no estado
      setUserPolls(prevPolls =>
        prevPolls.map(poll =>
          poll.id === pollId ? updatedPoll : poll
        )
      );

      // 4. Mostra os resultados imediatamente
      handleToggleResults(pollId, true);

      // 5. Feedback visual
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: 'white' }}>
      {/* Logo e nome do app */}
      <Box>
        <LogoBox>
          <Box sx={{
            width: 35,
            height: 35,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2
          }}>
            <BarChartIcon fontSize="large" sx={{ color: '#8A2BE2' }} />
          </Box>
          <Typography variant="h6" noWrap component="div" sx={{
            fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
            fontWeight: 400,
            letterSpacing: '0.1px',
            color: 'blueviolet',
            mb: 0,
            ml: 0,
            fontSize: '1.3rem'
          }}>
            PollHub
          </Typography>
        </LogoBox>
        <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', mt: 0, mb: 0 }} />

        {/* Menu principal */}
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setDialogOpen(true)} sx={{ py: 1.5 }}>
              <ListItemIcon sx={{ minWidth: '40px', color: 'white' }}>
                <AddCircleIcon />
              </ListItemIcon>
              <ListItemText
                primary="Nova Enquete"
                primaryTypographyProps={{ sx: { color: 'white' } }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/dashboard" sx={{ py: 1.5 }}>
              <ListItemIcon sx={{ minWidth: '40px', color: 'white' }}>
                <PollIcon />
              </ListItemIcon>
              <ListItemText
                primary="Minhas Enquetes"
                primaryTypographyProps={{ sx: { color: 'white' } }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton component={Link} to="/my-votes" sx={{ py: 1.5 }}>
              <ListItemIcon sx={{ minWidth: '40px', color: 'white' }}>
                <HowToVoteIcon />
              </ListItemIcon>
              <ListItemText
                primary="Meus Votos"
                primaryTypographyProps={{ sx: { color: 'white' } }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton component={Link} to="/polls" sx={{ py: 1.5 }}>
              <ListItemIcon sx={{ minWidth: '40px', color: 'white' }}>
                <PollIcon />
              </ListItemIcon>
              <ListItemText
                primary="Todas Enquetes"
                primaryTypographyProps={{ sx: { color: 'white' } }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

    <Box>
      {/* Perfil do usuario */}
      <Box sx={{ py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton sx={{ py: 1.5 }}>
            <ListItemIcon sx={{ minWidth: '40px', color: 'white' }}>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText
              primary={user ? (user.name || user.username || user.email || 'Usuário') : 'Usuário'}
              primaryTypographyProps={{ sx: { color: 'white' } }}
            />
          </ListItemButton>
        </ListItem>
      </Box>

      {/* Divider e botão de sair */}
      <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ py: 1.5 }}>
            <ListItemIcon sx={{ minWidth: '40px', color: 'white' }}>
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

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* AppBar fixo no topo - altura ajustada para alinhar com cabeçalho do menu lateral */}
      <StyledAppBar position="fixed">
        <Toolbar sx={{
          backgroundColor: 'hsl(220, 30%, 15%)',
          height: '64px',
          minHeight: '64px',
          pr: 0,
          pl: 0,
        }}>
          <IconButton
            color="inherit"
            aria-label="abrir menu"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 1, ml: 1, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{
            fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
            fontWeight: 400,
            letterSpacing: '0.5px',
            color: 'blueviolet',
            mb: 0,
            ml: 1,
            fontSize: '1.3rem'
          }}>
            Dashboard
          </Typography>
        </Toolbar>
      </StyledAppBar>

      {/* Menu lateral */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="menu de navegação"
      >
        {/* Drawer para dispositivos móveis */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: 'hsl(220, 30%, 10%)',
              borderRight: '1px solid rgba(255, 255, 255, 0.12)'
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
              backgroundColor: 'hsl(220, 30%, 10%)',
              borderRight: '1px solid rgba(255, 255, 255, 0.12)'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Conteúdo principal */}
      <ContentWrapper component="main">
        {/* Container principal responsivo */}
        <Container
          maxWidth={false}
          sx={{
            width: '100%',
            px: { xs: 2, sm: 3, md: 8 },  // Padding lateral responsivo
            py: 4,
          }}
        >
          <Paper
            sx={{
              width: '100%',
              maxWidth: { xs: '100%', md: 1600 },  // Limite máximo em telas grandes
              mx: 'auto',  // Centraliza o conteúdo
              p: { xs: 2, sm: 3 },  // Padding interno responsivo
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.12)',
              minHeight: '80vh',
              boxShadow: 6,  // Usa a escala de sombra do Material UI
              backgroundColor: 'background.paper'
            }}
          >
            <Typography
              component="h1"
              variant="h4"
              sx={{
                fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
                fontWeight: 300,
                letterSpacing: '0.5px',
                color: 'whitesmoke',
                mb: 4,
                ml: 3,
                fontSize: '1.5rem',
                textAlign: 'left',
              }}
            >
              Minhas Enquetes
            </Typography>

            {userPolls.length > 0 ? (
              <Grid
                container
                spacing={3}
                sx={{
                  mb: 3,
                  width: '100%',
                  display: 'grid', // Troca flexbox por CSS Grid
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)'
                  }
                }}
              >
                {userPolls.map((poll) => (
                  <Grid
                    item
                    key={poll.id}
                    xs={12}
                    sm={6}
                    md={4}
                    sx={{
                      minWidth: 0, // Corrige overflow
                      display: 'flex', // Força o card a preencher o espaço
                      height: 'auto'
                    }}
                  >
                    <PollCard
                      poll={poll}
                      onVote={handleVote}
                      onVerDetalhes={() => setDetalheAberto(poll)}
                      showResults={showResultsMap[poll.id] || false}
                      isOwner={true}
                      onToggleResults={handleToggleResults}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '50vh'
              }}>
                <Typography variant="h6" color="textSecondary">
                  Nenhuma enquete encontrada
                </Typography>
              </Box>
            )}
          </Paper>
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
      </ContentWrapper>

      <Dialog
  open={!!detalheAberto}
  onClose={() => setDetalheAberto(null)}
  fullWidth
  maxWidth="sm"
  PaperProps={{
    sx: {
      minHeight: '30vh',
      maxHeight: '80vh',
      borderRadius: 3,
      overflowX: 'hidden',
      overflowY: 'auto',
      backgroundColor: 'hsl(220, 30%, 18%)', // igual ao dashboard, se quiser
    }
  }}
>
  {/* Título */}
  <DialogTitle
  sx={{
    wordBreak: 'break-all',
    overflowWrap: 'break-word',
    p: 0,
    background: 'transparent'
  }}
>
  <Typography
    variant="h6"
    sx={{
      fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
      fontWeight: 400,         
      fontSize: '1.25rem',       
      color: 'whitesmoke',       
      lineHeight: 1.3,
      px: 3,
      pt: 2,
      pb: 1,
      wordBreak: 'break-all'
    }}
  >
    {detalheAberto?.title}
  </Typography>
</DialogTitle>

<Divider sx={{ mx: 2, my: 0 }} />

<DialogContent
  sx={{
    p: 3,
    pt: 2,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    color: 'white',
  }}
>
  <Typography
    variant="subtitle2"
    sx={{
      fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
      fontWeight: 500,
      fontSize: '1.08rem',
      mb: 1,
      color: 'rgba(255,255,255,0.85)'
    }}
  >
    Descrição
  </Typography>
  <Typography
    sx={{
      fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
      whiteSpace: 'pre-line',
      wordBreak: 'break-word',
      fontSize: '1rem',
      color: 'rgba(255,255,255,0.96)',
      flex: 1,
    }}
  >
    {detalheAberto?.description}
  </Typography>
</DialogContent>

</Dialog>
    </Box>
  );
}
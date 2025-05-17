import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  CssBaseline,
  Typography,
  Container,
  Grid,
  Paper,
  Button,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import PollIcon from '@mui/icons-material/Poll';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import BarChartIcon from '@mui/icons-material/BarChart';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';

// Drawer width constant
const DRAWER_WIDTH = 240;

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'hsl(220, 30%, 15%)',
  borderRadius: 0,
  boxShadow: 'none',
  width: '100%',
}));

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
    marginLeft: 0,
    width: `calc(100% - ${DRAWER_WIDTH}px)`,
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(2),
  },
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'hsl(220, 30%, 15%)',
  boxShadow: 'none',
  borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
  height: '64px',
  [theme.breakpoints.up('sm')]: {
    width: `calc(100% - ${DRAWER_WIDTH}px)`,
    marginLeft: DRAWER_WIDTH,
  },
}));

const LogoBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  paddingLeft: theme.spacing(3),
  height: '64px',
}));

const VoteCard = styled(Paper)(({ theme }) => ({
  backgroundColor: 'hsl(220, 30%, 18%)',
  borderRadius: theme.spacing(3),
  border: '1px solid rgba(255, 255, 255, 0.12)',
  boxShadow: theme.shadows[6],
  padding: theme.spacing(3),
  transition: 'transform 0.2s ease-in-out',
  width: '100%',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

// Typography style constants
const TYPOGRAPHY_STYLES = {
  appTitle: {
    fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
    fontWeight: 400,
    letterSpacing: '0.1px',
    color: 'blueviolet',
    margin: 0,
    fontSize: '1.3rem'
  },
  pageTitle: {
    fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
    fontWeight: 300,
    letterSpacing: '0.5px',
    color: 'whitesmoke',
    marginBottom: 4,
    marginLeft: 3,
    fontSize: '1.5rem',
    textAlign: 'left',
  },
  cardTitle: {
    fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
    fontWeight: 500,
    color: 'whitesmoke',
    marginBottom: 1,
    fontSize: '1.1rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  cardBody: {
    fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 1,
    fontSize: '1rem'
  },
  cardMeta: {
    fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.875rem'
  },
  emptyState: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
    fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
  }
};

// Button style constants
const BUTTON_STYLES = {
  primary: {
    backgroundColor: '#8A2BE2',
    color: 'white',
    borderRadius: 2,
    px: 3,
    py: 1,
    textTransform: 'none',
    fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
    '&:hover': {
      backgroundColor: '#7B1FA2',
    }
  },
  secondary: {
    fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
    color: '#8A2BE2',
    textTransform: 'none',
    '&:hover': {
      backgroundColor: 'rgba(138, 43, 226, 0.1)',
    }
  }
};

const DrawerContent = ({ user, onLogout }) => (
  <Box sx={{ 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'space-between', 
    color: 'white' 
  }}>
    {/* App logo and name */}
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
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={TYPOGRAPHY_STYLES.appTitle}
        >
          PollHub
        </Typography>
      </LogoBox>
      <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', mt: 0, mb: 0 }} />

      {/* Main menu */}
      <List>
        <NavItem to="/dashboard" icon={<AddCircleIcon />} text="Nova Enquete" />
        <NavItem to="/dashboard" icon={<PollIcon />} text="Minhas Enquetes" />
        <NavItem 
          to="/my-votes" 
          icon={<HowToVoteIcon />} 
          text="Meus Votos" 
          active={true} 
        />
        <NavItem to="/polls" icon={<PollIcon />} text="Todas Enquetes" />
      </List>
    </Box>

    <Box>
      {/* User profile */}
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

      {/* Divider and logout button */}
      <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={onLogout} sx={{ py: 1.5 }}>
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

const NavItem = ({ to, icon, text, active = false }) => (
  <ListItem disablePadding>
    <ListItemButton component={Link} to={to} sx={{ py: 1.5 }}>
      <ListItemIcon sx={{ minWidth: '40px', color: 'white' }}>
        {icon}
      </ListItemIcon>
      <ListItemText
        primary={text}
        primaryTypographyProps={{
          sx: {
            color: 'white',
            fontWeight: active ? 600 : 400,
          }
        }}
      />
    </ListItemButton>
  </ListItem>
);

const UserVoteCard = ({ vote }) => (
  <VoteCard>
    <Typography
      variant="h6"
      sx={TYPOGRAPHY_STYLES.cardTitle}
    >
      {vote.pollTitle}
    </Typography>
    <Typography
      variant="body1"
      sx={TYPOGRAPHY_STYLES.cardBody}
    >
      Opção escolhida: <span style={{ color: '#8A2BE2', fontWeight: 500 }}>{vote.optionText}</span>
    </Typography>
    <Typography
      variant="body2"
      sx={TYPOGRAPHY_STYLES.cardMeta}
    >
      Votado em: {new Date(vote.votedAt).toLocaleString()}
    </Typography>
    
  </VoteCard>
);

const EmptyState = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '50vh',
      flexDirection: 'column'
    }}
  >
    <Typography
      variant="h6"
      sx={TYPOGRAPHY_STYLES.emptyState}
    >
      Você ainda não votou em nenhuma enquete.
    </Typography>
    <Button
      variant="contained"
      component={Link}
      to="/polls"
      sx={BUTTON_STYLES.primary}
    >
      Ver Enquetes Disponíveis
    </Button>
  </Box>
);

export default function UserVotes() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const response = await api.get('/api/users/me/votes');
        setVotes(response.data);
      } catch (error) {
        console.error('Erro ao buscar votos:', error);
        // Redirect to login if unauthorized
        if (error.response?.status === 401) {
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchVotes();
  }, [navigate, logout]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress sx={{ color: '#8A2BE2' }} />
        </Box>
      );
    }
    
    if (votes.length === 0) {
      return <EmptyState />;
    }
    
    return (
      <Grid
        container
        spacing={3}
        sx={{
          mb: 3,
          width: '100%',
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)'
          }
        }}
      >
        {votes.map((vote, idx) => (
          <Box
            key={idx}
            sx={{
              minWidth: 0,
              display: 'flex',
              height: '100%'
            }}
          >
            <UserVoteCard vote={vote} />
          </Box>
        ))}
      </Grid>
    );
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* App bar */}
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
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{
              ...TYPOGRAPHY_STYLES.appTitle,
              ml: 1, // ou ml: 3 para mais espaço
            }}
          >
            Votes
          </Typography>
        </Toolbar>
      </StyledAppBar>

      {/* Navigation drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
        aria-label="menu de navegação"
      >
        {/* Mobile drawer */}
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
              width: DRAWER_WIDTH,
              backgroundColor: 'hsl(220, 30%, 10%)',
              borderRight: '1px solid rgba(255, 255, 255, 0.12)'
            },
          }}
        >
          <DrawerContent user={user} onLogout={handleLogout} />
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              backgroundColor: 'hsl(220, 30%, 10%)',
              borderRight: '1px solid rgba(255, 255, 255, 0.12)'
            },
          }}
          open
        >
          <DrawerContent user={user} onLogout={handleLogout} />
        </Drawer>
      </Box>

      {/* Main content */}
      <ContentWrapper component="main">
        <Container
          maxWidth={false}
          sx={{
            width: '100%',
            px: { xs: 2, sm: 3, md: 8 },
            py: 4,
          }}
        >
          <Paper
            sx={{
              width: '100%',
              maxWidth: { xs: '100%', md: 1600 },
              mx: 'auto',
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.12)',
              minHeight: '80vh',
              boxShadow: 6,
              backgroundColor: 'background.paper'
            }}
          >
            <Typography
              component="h1"
              variant="h4"
              sx={TYPOGRAPHY_STYLES.pageTitle}
            >
              Meus Votos
            </Typography>

            {renderContent()}
          </Paper>
        </Container>
      </ContentWrapper>
    </Box>
  );
}
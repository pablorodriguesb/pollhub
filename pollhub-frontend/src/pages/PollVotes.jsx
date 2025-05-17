import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  CssBaseline,
  Typography,
  Container,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  AppBar,
  Toolbar,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';

// StyledAppBar consistente com o Dashboard
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'hsl(220, 30%, 15%)',
  boxShadow: 'none',
  borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
  height: '64px',
  width: '100%'
}));

// ContentWrapper ajustado para ocupar toda a largura sem menu lateral
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
  flexDirection: 'column'
}));

// Estilização para a tabela de votos
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  '& .MuiTable-root': {
    borderCollapse: 'separate',
    borderSpacing: 0,
  },
  '& .MuiTableHead-root': {
    backgroundColor: 'hsl(220, 30%, 20%)',
  },
  '& .MuiTableHead-root .MuiTableCell-root': {
    color: 'rgba(255, 255, 255, 0.87)',
    fontWeight: 500,
    borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
    padding: theme.spacing(2),
  },
  '& .MuiTableBody-root .MuiTableCell-root': {
    borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
    color: 'rgba(255, 255, 255, 0.8)',
    padding: theme.spacing(2),
  },
  '& .MuiTableRow-root:last-child .MuiTableCell-root': {
    borderBottom: 'none',
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
}));

export default function PollVotes() {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // Estado para gerenciar UI e dados
  const [isLoading, setIsLoading] = useState(true);
  const [votes, setVotes] = useState([]);
  const [pollTitle, setPollTitle] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Carregar dados quando o componente montar
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Buscar os votos da enquete usando o endpoint apropriado
      const votesResponse = await api.get(`/api/votes/poll/${pollId}`);
      setVotes(votesResponse.data);
      
      // Opcionalmente, buscar informações da enquete para exibir o título
      try {
        const pollResponse = await api.get(`/api/polls/${pollId}`);
        setPollTitle(pollResponse.data.title);
      } catch (error) {
        console.error('Erro ao buscar detalhes da enquete:', error);
      }
      
    } catch (error) {
      console.error('Erro ao buscar votos:', error);
      
      // Se receber erro 401 (não autorizado), redirecionar para login
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      }
      
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Erro ao carregar dados',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* AppBar fixo no topo */}
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
            aria-label="voltar"
            edge="start"
            onClick={handleBack}
            sx={{ mr: 1, ml: 1 }}
          >
            <ArrowBackIcon />
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
            Votos Registrados
          </Typography>
        </Toolbar>
      </StyledAppBar>

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
          {isLoading ? (
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '80vh'
            }}>
              <CircularProgress sx={{ color: 'blueviolet' }} />
            </Box>
          ) : (
            <Paper
              sx={{
                width: '100%',
                maxWidth: { xs: '100%', md: 1200 },  // Limite máximo em telas grandes
                mx: 'auto',  // Centraliza o conteúdo
                p: { xs: 2, sm: 3 },  // Padding interno responsivo
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.12)',
                minHeight: '60vh',
                boxShadow: 6,
                backgroundColor: 'background.paper'
              }}
            >
              {/* Cabeçalho com título */}
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
                  fontWeight: 300,
                  letterSpacing: '0.5px',
                  color: 'whitesmoke',
                  mb: 3,
                  ml: 1,
                  fontSize: '1.5rem',
                  textAlign: 'left',
                }}
              >
                {pollTitle ? `Votos: ${pollTitle}` : 'Votos Registrados'}
              </Typography>

              {/* Tabela de votos */}
              {votes.length > 0 ? (
                <Box sx={{ px: { xs: 0, sm: 1 }, pb: 3 }}>
                  <StyledTableContainer component={Paper} sx={{ 
                    overflow: 'auto',
                    backgroundColor: 'hsl(220, 30%, 15%)', 
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 2,
                    boxShadow: 'none'
                  }}>
                    <Table sx={{ minWidth: 650 }} aria-label="tabela de votos">
                      <TableHead>
                        <TableRow>
                          <TableCell>Usuário</TableCell>
                          <TableCell>Opção</TableCell>
                          <TableCell>Data/Hora</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {votes.map((vote, index) => (
                          <TableRow key={index}>
                            <TableCell>{vote.username}</TableCell>
                            <TableCell>{vote.optionText}</TableCell>
                            <TableCell>{new Date(vote.votedAt).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </StyledTableContainer>
                </Box>
              ) : (
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '50vh'
                }}>
                  <Typography variant="h6" color="textSecondary">
                    Nenhum voto encontrado para esta enquete
                  </Typography>
                </Box>
              )}
            </Paper>
          )}
        </Container>

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
    </Box>
  );
}
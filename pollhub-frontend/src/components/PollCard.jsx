import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  LinearProgress,
  Box,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import BarChartIcon from '@mui/icons-material/BarChart';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import api from '../api/client';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import UndoIcon from '@mui/icons-material/Undo';
import InfoIcon from '@mui/icons-material/Info';

export default function PollCard({ poll, onDelete, onVote, onVerDetalhes, showResults, isOwner, onToggleResults }) {
  const [selectedOption, setSelectedOption] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const { user } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isAdmin = user?.role === "ROLE_ADMIN";
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const menuOpen = Boolean(anchorEl);
  const navigate = useNavigate();

  const isOwnerOrAdmin = user && (user.username === poll.createdBy || user.role === 'ROLE_ADMIN');

  // Calcular total de votos
  const totalVotes = poll.options.reduce((sum, option) => sum + (option.voteCount || 0), 0);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleVote = async () => {
    if (!selectedOption || !onVote) return;

    try {
      await onVote(poll.id, selectedOption);
      setSelectedOption('');
    } catch (error) {
      console.error('Erro ao votar:', error);
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setConfirmDelete(true);
  };

  // Função de deleção do admin
  const handleAdminDelete = async () => {
    if (window.confirm("Tem certeza que deseja deletar esta enquete como ADMIN?")) {
      try {
        await api.delete(`/admin/polls/${poll.id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (onDelete) onDelete(poll.id);
      } catch (err) {
        alert("Erro ao deletar enquete como admin!");
      }
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/api/polls/${poll.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setConfirmDelete(false);
      window.location.reload();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao excluir enquete',
        severity: 'error'
      });
    }
  };

  const handleShareClick = () => {
    handleMenuClose();
    // Criar um URL para compartilhar
    const shareUrl = `${window.location.origin}/poll/${poll.id}`;

    // Tentar usar a API de compartilhamento se disponível
    if (navigator.share) {
      navigator.share({
        title: poll.question,
        text: `Participe da enquete: ${poll.question}`,
        url: shareUrl,
      });
    } else {
      // Fallback: copiar para a área de transferência
      navigator.clipboard.writeText(shareUrl)
        .then(() => alert('Link copiado para a área de transferência'))
        .catch(err => console.error('Erro ao copiar:', err));
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: "hsl(220, 30%, 18%)",
          color: "white",
          borderRadius: 2,
          boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.3)',
          },
          width: '100%',
        }}
      >
        <CardContent sx={{ flexGrow: 1, pb: 1, pt: 2, px: 2, minHeight: 0, height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, minWidth: 0 }}>
            {/* Título */}
            <Tooltip title={poll.title} placement="top" arrow>
              <Typography
                variant="h6"
                component="div"
                gutterBottom
                sx={{
                  fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
                  fontWeight: 500,
                  fontSize: '1rem',
                  letterSpacing: '0.1px',
                  color: 'white',
                  mb: 0.5,
                  maxWidth: isOwner ? 'calc(100% - 32px)' : '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'flex',
                  flexDirection: 'column',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  hyphens: 'auto',
                  lineHeight: '1.2rem',
                  maxHeight: '2.4rem',
                  flexGrow: 0,
                  minHeight: '2.4em'
                }}
              >
                {poll.title}
              </Typography>
            </Tooltip>

            {isOwner && (
              <IconButton
                aria-label="configurações"
                size="small"
                onClick={handleMenuClick}
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  p: 0.5,
                  flexShrink: 0
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            )}
          </Box>

          {/* Descrição */}
          {poll.description && (
            <Typography
              variant="body2"
              sx={{
                fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
                color: 'whitesmoke',
                fontSize: '1rem',
                mb: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'flex',
                flexDirection: 'column',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                lineHeight: '1.1rem',
                flexGrow: 0,
                maxHeight: '2.4rem',
                minHeight: '2.4em'
              }}
            >
              {poll.description}
            </Typography>
          )}



          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography
              variant="body2"
              sx={{
                mr: 1,
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.75rem'
              }}
            >
              Por{' '}
              {poll.createdBy ? (
                <Link
                  to={`/users/${poll.createdBy}`}
                  style={{
                    color: '#8A2BE2',
                    textDecoration: 'none',
                  }}
                >
                  {poll.createdBy}
                </Link>
              ) : (
                'Anônimo'
              )}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.7rem'
              }}
            >
              • {formatDate(poll.createdAt || new Date())}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1.2,
            }}
          >
            {/* Chip de votos */}
            <Chip
              label={`${totalVotes} ${totalVotes === 1 ? 'voto' : 'votos'}`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                px: 1.2,
                borderRadius: 1,
                fontWeight: 500,
                borderColor: 'rgba(138, 43, 226, 0.25)',
                color: 'rgba(255, 255, 255, 0.8)',
                backgroundColor: 'rgba(138, 43, 226, 0.08)',
              }}
            />

            {/* Chip de status*/}
            <Chip
              label={poll.isPublic ? 'PUBLICA' : 'PRIVADA'}
              size="small"
              sx={{
                backgroundColor: poll.isPublic
                  ? 'rgba(25, 118, 210, 0.12)'
                  : 'rgba(211, 47, 47, 0.12)',
                color: poll.isPublic ? '#1976d2' : '#d32f2f',
                fontWeight: 500,
                display: { xs: 'none', sm: 'inline-flex' },
                height: 20,
                fontSize: '0.7rem',
                px: 1.2,
                borderRadius: 1,
                boxShadow: 'none',
                textTransform: 'uppercase',
                letterSpacing: 0.3,
              }}
            />
          </Box>




          <Divider sx={{ my: 1, backgroundColor: 'rgba(255, 255, 255, 0.12)' }} />

          {!showResults ? (
            <RadioGroup
              name={`poll-${poll.id}`}
              value={selectedOption}
              onChange={handleOptionChange}
            >
              {poll.options.map((option) => (

                <FormControlLabel
                  key={option.id}
                  value={option.id}
                  control={
                    <Radio
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-checked': {
                          color: '#8A2BE2',
                        },
                        padding: '4px',
                      }}
                      size="small"
                    />
                  }
                  label={
                    <Box
                      sx={{
                        maxWidth: { xs: 120, sm: 180, md: 240 },
                        width: '100%',
                        display: 'block'
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: { xs: '0.8rem', sm: '0.85rem' },
                          color: 'white',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          width: '100%',
                          display: 'block'
                        }}
                        title={option.text}
                      >
                        {option.text}
                      </Typography>
                    </Box>
                  }
                  sx={{ mb: 0.25, ml: -0.5 }}
                />
              ))}
            </RadioGroup>
          ) : (
            <>
              {poll.options.map((option) => {
                const votePercentage = totalVotes > 0
                  ? Math.round((option.voteCount / totalVotes) * 100)
                  : 0;

                return (
                  <Box key={option.id} sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.85rem',
                          color: 'white',
                          maxWidth: '85%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {option.text}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        sx={{
                          fontSize: '0.85rem',
                          color: 'white',
                          ml: 1
                        }}
                      >
                        {votePercentage}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={votePercentage}
                      sx={{
                        height: 6,
                        borderRadius: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#8A2BE2'
                        }
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.7rem',
                        color: 'rgba(255, 255, 255, 0.6)'
                      }}
                    >
                      {option.voteCount || 0} {option.voteCount === 1 ? 'voto' : 'votos'}
                    </Typography>
                  </Box>
                );
              })}
            </>
          )}
        </CardContent>

        <CardActions sx={{ p: 1.5, pt: 0, flexDirection: 'column' }}>
          {!showResults ? (
            <Button
              startIcon={<HowToVoteIcon sx={{ fontSize: '1rem' }} />}
              variant="contained"
              fullWidth
              disabled={!selectedOption}
              onClick={handleVote}
              sx={{
                backgroundColor: '#8A2BE2',
                '&:hover': {
                  backgroundColor: '#7B1FA2',
                },
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(138, 43, 226, 0.3)',
                },
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.85rem',
                borderRadius: 1.5,
                padding: '6px 12px',
                mb: 1,
                height: '32px'
              }}
            >
              Votar
            </Button>
          ) : (
            <Button
              startIcon={<UndoIcon sx={{ fontSize: '1rem' }} />}
              variant="outlined"
              fullWidth
              onClick={() => onToggleResults && onToggleResults(poll.id, false)}
              sx={{
                borderColor: 'rgba(138, 43, 226, 0.5)',
                color: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  borderColor: '#8A2BE2',
                  backgroundColor: 'rgba(138, 43, 226, 0.1)',
                },
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.85rem',
                borderRadius: 1.5,
                padding: '6px 12px',
                mb: 1,
                height: '32px'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  overflow: 'hidden'
                }}
              >
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '100%',
                    display: 'block',
                    textAlign: 'center'
                  }}
                  title="Voltar para votação"
                >
                  Voltar para votação
                </span>
              </Box>
            </Button>

          )}

          <Button
            startIcon={<InfoIcon sx={{ fontSize: '1rem' }} />}
            variant="outlined"
            fullWidth
            size="small"
            onClick={onVerDetalhes}
            sx={{
              borderColor: '#1976d2',
              color: '#1976d2',
              '&:hover': {
                borderColor: '#8A2BE2',
                backgroundColor: 'rgba(138, 43, 226, 0.1)',
              },
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.85rem',
              borderRadius: 1.5,
              padding: '6px 12px',
              height: '32px',
              mt: 1
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                overflow: 'hidden'
              }}
            >
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  width: '100%',
                  display: 'block',
                  textAlign: 'center'
                }}
                title="Ver Enquete Completa"
              >
                Ver Enquete Completa
              </span>
            </Box>
          </Button>

          <Box sx={{ width: '100%', mt: 0.5 }}>
            <Button
              startIcon={<BarChartIcon sx={{ fontSize: '1rem' }} />}
              variant="outlined"
              fullWidth
              onClick={() => navigate(`/polls/${poll.id}/results`)}
              sx={{
                borderColor: 'rgba(138, 43, 226, 0.5)',
                color: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  borderColor: '#8A2BE2',
                  backgroundColor: 'rgba(138, 43, 226, 0.1)',
                },
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.85rem',
                borderRadius: 1.5,
                padding: '6px 12px',
                mb: 0.75,
                height: '32px'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  overflow: 'hidden'
                }}
              >
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '100%',
                    display: 'block',
                    textAlign: 'center'
                  }}
                  title="Detalhes dos Resultados"
                >
                  Detalhes dos Resultados
                </span>
              </Box>
            </Button>

            {user && (
              <Button
                startIcon={<HowToVoteIcon sx={{ fontSize: '1rem' }} />}
                variant="outlined"
                fullWidth
                onClick={() => navigate(`/votes/poll/${poll.id}`)}
                sx={{
                  borderColor: 'rgba(138, 43, 226, 0.5)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    borderColor: '#8A2BE2',
                    backgroundColor: 'rgba(138, 43, 226, 0.1)',
                  },
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.85rem',
                  borderRadius: 1.5,
                  padding: '6px 12px',
                  height: '32px'
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    overflow: 'hidden'
                  }}
                >
                  <span
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      width: '100%',
                      display: 'block',
                      textAlign: 'center'
                    }}
                    title="Detalhes dos Votos"
                  >
                    Detalhes dos Votos
                  </span>
                </Box>
              </Button>
            )}
          </Box>
          {/* Botão de deletar para o admin */}
          {isAdmin && (
            <Button
              startIcon={<DeleteIcon sx={{ fontSize: '1rem' }} />}
              variant="outlined"
              fullWidth
              onClick={handleAdminDelete}
              sx={{
                mt: 1,
                borderColor: '#f44336',
                color: '#f44336',
                '&:hover': {
                  borderColor: '#f44336',
                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                },
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.85rem',
                borderRadius: 1.5,
                padding: '6px 12px',
                height: '32px'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  overflow: 'hidden'
                }}
              >
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '100%',
                    display: 'block',
                    textAlign: 'center'
                  }}
                  title="Remover Enquete (Admin)"
                >
                  Remover (Admin)
                </span>
              </Box>
            </Button>
          )}
        </CardActions>
      </Card>

      {/* Menu de opções */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: 'hsl(220, 30%, 15%)',
            color: 'white',
            boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }
        }}
      >
        <MenuItem
          onClick={handleShareClick}
          sx={{
            fontSize: '0.85rem',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <ShareIcon fontSize="small" sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />
          Compartilhar
        </MenuItem>
        <MenuItem
          onClick={handleDeleteClick}
          sx={{
            color: '#f44336',
            fontSize: '0.85rem',
            '&:hover': {
              backgroundColor: 'rgba(244, 67, 54, 0.1)'
            }
          }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Excluir
        </MenuItem>
      </Menu>

      {/* Dialog de confirmação de exclusão */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        PaperProps={{
          sx: {
            backgroundColor: 'hsl(220, 30%, 15%)',
            color: 'white',
            boxShadow: '0px 3px 15px rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{
          fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
          fontWeight: 500,
          fontSize: '1.2rem',
          color: 'white'
        }}>
          Confirmar exclusão
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Tem certeza que deseja excluir esta enquete? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDelete(false)}
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              },
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.85rem'
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            startIcon={<DeleteIcon />}
            sx={{
              color: '#f44336',
              '&:hover': {
                backgroundColor: 'rgba(244, 67, 54, 0.1)'
              },
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.85rem'
            }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
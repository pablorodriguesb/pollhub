import * as React from 'react';
import { useState } from 'react';
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
  DialogActions
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import BarChartIcon from '@mui/icons-material/BarChart';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import api from '../api/client';
import { Link } from 'react-router-dom';


export default function PollCard({ poll, onVote, showResults, isOwner, onToggleResults }) {
  const [selectedOption, setSelectedOption] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pollsWithResults, setPollsWithResults] = useState([]);
  const menuOpen = Boolean(anchorEl);

  // Calcular total de votos
  const totalVotes = poll.options.reduce((sum, option) => sum + (option.voteCount || 0), 0);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleVote = async () => {
    if (!selectedOption || !onVote) return;

    try {
      await onVote(poll.id, selectedOption);
      setSelectedOption(''); // ✅ Reset para string vazia
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

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/api/polls/${poll.id}`);
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

  // Função para alternar a exibição dos resultados
  const handleToggleResults = (pollId, show) => {
    if (show) {
      setPollsWithResults(prev => [...prev, pollId]);
    } else {
      setPollsWithResults(prev => prev.filter(id => id !== pollId));
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
          background: "#23273a",
          color: "white",
          borderRadius: 3,
          boxShadow: 3,
          border: "none",
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6,
          },
        }}
      >

        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 600 }}>
              {poll.title}
            </Typography>
            {isOwner && (
              <IconButton
                aria-label="configurações"
                size="small"
                onClick={handleMenuClick}
              >
                <MoreVertIcon />
              </IconButton>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Por{' '}
              {poll.createdBy ? (
                <Link to={`/usuario/${poll.createdBy}`}>
                  {poll.createdBy}
                </Link>
              ) : (
                'Anônimo'
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              • {formatDate(poll.createdAt || new Date())}
            </Typography>
          </Box>

          <Chip
            label={`${totalVotes} ${totalVotes === 1 ? 'voto' : 'votos'}`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ mb: 2 }}
          />

          <Divider sx={{ my: 1 }} />

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
                  control={<Radio />}
                  label={option.text}
                  sx={{ mb: 0.5 }}
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
                  <Box key={option.id} sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{option.text}</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {votePercentage}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={votePercentage}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {option.voteCount || 0} {option.voteCount === 1 ? 'voto' : 'votos'}
                    </Typography>
                  </Box>
                );
              })}
            </>
          )}
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0 }}>
          {!showResults ? (
            <Button
              startIcon={<HowToVoteIcon />}
              variant="contained"
              fullWidth
              disabled={!selectedOption}
              onClick={handleVote}
            >
              Votar
            </Button>
          ) : (
            <Button
              startIcon={<BarChartIcon />}
              variant="outlined"
              fullWidth
              onClick={() => onToggleResults && onToggleResults(poll.id, false)}
            >
              Voltar para votação
            </Button>
          )}
        </CardActions>
      </Card>

      {/* Menu de opções */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleShareClick}>
          <ShareIcon fontSize="small" sx={{ mr: 1 }} />
          Compartilhar
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Excluir
        </MenuItem>
      </Menu>

      {/* Dialog de confirmação de exclusão */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir esta enquete? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" startIcon={<DeleteIcon />}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
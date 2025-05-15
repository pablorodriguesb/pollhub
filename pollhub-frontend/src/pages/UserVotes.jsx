import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Paper, Typography, CircularProgress, Grid, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function UserVotes() {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const data = await api.getUserVotes();
        setVotes(data);
      } catch (error) {
        console.error('Erro ao buscar votos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVotes();
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Button variant="contained" onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        Voltar
      </Button>
      <Typography variant="h4" gutterBottom color="white">
        Meus Votos
      </Typography>
      {votes.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          Você ainda não votou em nenhuma enquete.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {votes.map((vote, idx) => (
            <Grid item xs={12} key={idx}>
              <Paper sx={{ p: 3, background: '#23273a', borderRadius: 2, color: 'white' }}>
                <Typography variant="h6">{vote.pollTitle}</Typography>
                <Typography variant="body1">
                  Opção escolhida: {vote.optionText}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Votado em: {new Date(vote.votedAt).toLocaleString()}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

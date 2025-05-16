import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import api from '../api/client';

export default function PollVotes() {
  const { pollId } = useParams();
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const data = await api.getPollVotes(pollId);
        setVotes(data);
      } catch (error) {
        console.error('Erro ao buscar votos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVotes();
  }, [pollId]);

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Button variant="contained" onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Voltar
      </Button>
      
      <Typography variant="h4" gutterBottom>
        Votos Registrados
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
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
      </TableContainer>
    </Box>
  );
}

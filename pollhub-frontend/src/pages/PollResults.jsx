import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, LinearProgress, Button, Paper } from '@mui/material';
import api from '../api/client';

export default function PollResults() {
    const { id } = useParams();
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const totalVotes = results?.results?.reduce((sum, o) => sum + (o.votes || 0), 0) || 0;

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const data = await api.getPollResults(id);
                setResults(data);
            } catch (error) {
                console.error('Erro ao buscar resultados:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [id]);

    if (loading) return <CircularProgress />;

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Button variant="contained" onClick={() => navigate(-1)} sx={{ mb: 2 }}>
                Voltar
            </Button>

            <Typography variant="h4" gutterBottom>
                {results?.title || 'Resultados da Enquete'}
            </Typography>

            {results?.results?.map((option, index) => {
  const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
  return (
    <Paper key={index} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6">{option.text}</Typography>
      <LinearProgress 
        variant="determinate" 
        value={percentage}
        sx={{ height: 10, my: 1 }}
      />
      <Typography>
        {option.votes ?? 0} votos ({percentage}%)
      </Typography>
    </Paper>
  );
})}
        </Box>
    );
}

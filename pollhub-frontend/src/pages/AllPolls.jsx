import React, { useEffect, useState } from 'react';
import api from '../api/client';
import PollCard from '../components/PollCard';
import { Snackbar, Alert, Typography, Grid, CircularProgress, Paper, Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button } from '@mui/material';

export default function AllPolls() {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'info'
    });
    const [pollsWithResults, setPollsWithResults] = useState([]);

    const fetchData = async () => {
        try {
            const response = await api.get('/api/polls');
            setPolls(response.data);
        } catch (error) {
            console.error('Erro ao buscar enquetes:', error);
        } finally {
            setLoading(false);
        }
    };

    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleToggleResults = (pollId, show) => {
        setPollsWithResults(prev =>
            show ? [...prev, pollId] : prev.filter(id => id !== pollId)
        );
    };

    const handleVote = async (pollId, optionId) => {
        try {
            await api.post(`/api/polls/${pollId}/vote`, null, {
                params: { optionId }
            });
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

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <CircularProgress />;

    return (
        <Box sx={{ minHeight: "100vh", background: "#181c2f", py: 4 }}>
            <Box sx={{ maxWidth: "900px", mx: "auto", width: "100%", px: 2 }}>
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
                <Button
                    startIcon={<ArrowBackIcon />}
                    variant="text"
                    color="inherit"
                    sx={{ mb: 2 }}
                    onClick={() => navigate(-1)} // Volta para a página anterior
                >
                    Voltar
                </Button>
                <Paper sx={{ p: 3, background: "#23273a", borderRadius: 3, minHeight: "70vh", boxShadow: "none" }}>
                    <Typography variant="h5" gutterBottom color="white" sx={{ textAlign: 'center' }}>
                        Todas Enquetes
                    </Typography>
                    <Grid container spacing={2}>
                        {polls.length > 0 ? (
                            polls.map((poll) => (
                                <Grid item xs={12} sm={6} md={4} key={poll.id}>
                                    <PollCard
                                        poll={poll}
                                        onVote={handleVote}
                                        showResults={pollsWithResults.includes(poll.id)}
                                        onToggleResults={handleToggleResults}
                                    />
                                </Grid>
                            ))
                        ) : (
                            <Grid item xs={12}>
                                <Typography variant="body1" color="text.secondary" align="center">
                                    Nenhuma enquete disponível.
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </Paper>
            </Box>
        </Box>
    );
}
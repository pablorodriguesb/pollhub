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
    Divider,
    LinearProgress,
    AppBar,
    Toolbar,
    IconButton,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoIcon from '@mui/icons-material/Info';
import api from '../api/client';

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

// Componente para a barra de progresso estilizada
const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    '& .MuiLinearProgress-bar': {
        backgroundColor: 'blueviolet',
    }
}));

// Componente para o card de opção da enquete
const resultCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: theme.spacing(1),
    backgroundColor: 'hsl(220, 30%, 18%)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
    }
}));

export default function PollResults() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [poll, setPoll] = useState({ results: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);


    // Calcular total de votos
    const totalVotes = poll?.results?.reduce((sum, result) => sum + (result.votes || 0), 0) || 0;

    useEffect(() => {
        const fetchPollResults = async () => {
            setIsLoading(true);
            try {
                // Fazendo chamada para o endpoint de resultados específico
                const response = await api.get(`/api/polls/${id}/results`);
                setPoll({
                    ...response.data,
                    results: Array.isArray(response.data.results) ? response.data.results : []
                });
            } catch (error) {
                console.error('Erro ao buscar resultados da enquete:', error);
                setError(error.response?.data?.message || 'Erro ao carregar resultados');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPollResults();
    }, [id]);

    const handleBack = () => {
        navigate(-1);
    };

    const handleOpenDetails = () => {
        setDetailsOpen(true);
    };

    const handleCloseDetails = () => {
        setDetailsOpen(false);
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
                        Resultados Registrados
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
                    ) : error ? (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    ) : (
                        <Paper
                            sx={{
                                width: '100%',
                                maxWidth: { xs: '100%', md: 800 },  // Limite máximo em telas grandes
                                mx: 'auto',  // Centraliza o conteúdo
                                p: { xs: 2, sm: 3 },  // Padding interno responsivo
                                borderRadius: 3,
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                minHeight: '60vh',
                                boxShadow: 6,
                                backgroundColor: 'background.paper'
                            }}
                        >
                            {/* Cabeçalho com título e botão de detalhes */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography
                                    component="h1"
                                    variant="h4"
                                    sx={{
                                        fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
                                        fontWeight: 300,
                                        letterSpacing: '0.5px',
                                        color: 'whitesmoke',
                                        mb: 1,
                                        ml: 1,
                                        fontSize: '1.5rem',
                                        textOverflow: 'ellipsis',
                                        textAlign: 'left',
                                        display: '-webkit-box',
                                        WebkitBoxOrient: 'vertical',
                                        WebkitLineClamp: 2,
                                        overflow: 'hidden',
                                        maxHeight: '2.4em',
                                    }}
                                >
                                    {poll?.title || 'Resultados da Enquete'}
                                </Typography>

                                <IconButton
                                    onClick={handleOpenDetails}
                                    sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                                >
                                    <InfoIcon />
                                </IconButton>
                            </Box>

                            {/* Resumo curto da descrição (primeiras 80 caracteres) */}
                            {poll?.description && (
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        mb: 3,
                                        ml: 1,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                    }}
                                >
                                    {poll.description.length > 80
                                        ? `${poll.description.substring(0, 80)}...`
                                        : poll.description}
                                </Typography>
                            )}

                            <Divider sx={{ my: 2, backgroundColor: 'rgba(255, 255, 255, 0.12)' }} />

                            {/* Gráfico de barras verticais - apenas este bloco! */}
                            <Box
                                sx={{
                                    height: '200px',
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    justifyContent: 'space-between',
                                    mt: 2,
                                    columnGap: 1,
                                }}
                            >
                                {poll?.results?.map((result, index) => {
                                    const percentage = totalVotes > 0 ? (result.votes / totalVotes) * 100 : 0;
                                    return (
                                        <Box
                                            key={result.id || index}
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column-reverse',
                                                alignItems: 'center',
                                                width: `${100 / (poll.results.length || 1)}%`,
                                                height: '100%',
                                            }}
                                        >
                                           {/* Porcentagem acima da barra */}
<Typography
  variant="body2"
  sx={{
    color: 'white',
    fontWeight: 'bold',
    mb: 0.5, // margin bottom para afastar da barra
    textAlign: 'center',
  }}
>
  {Math.round(percentage)}%
</Typography>
<Box
  sx={{
    height: `${Math.max(10, percentage)}%`,
    width: '100%',
    bgcolor: 'blueviolet',
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px',
    minHeight: '10px',
    transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  }}
/>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: 'rgba(255, 255, 255, 0.7)',
                                                    mt: 1,
                                                    textAlign: 'center',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    width: '100%',
                                                }}
                                            >
                                                {result.text.length > 15 ? result.text.substring(0, 15) + '...' : result.text}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Box>

                            {/* Total de votos */}
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    mb: 2,
                                    ml: 1,
                                }}
                            >
                                Total de votos: {totalVotes}
                            </Typography>

                            {/* Lista de opções com barras de progresso */}
                            {poll?.results?.length > 0 ? (
                                poll.results.map((result, index) => {
                                    const percentage = totalVotes > 0 ? Math.round((result.votes / totalVotes) * 100) : 0;

                                    return (
                                        <div key={result.id || index}>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
                                                    fontWeight: 400,
                                                    color: 'whitesmoke',
                                                    mb: 1,
                                                    wordBreak: 'break-word'
                                                }}
                                            >
                                                {result.text}
                                            </Typography>

                                            <StyledLinearProgress
                                                variant="determinate"
                                                value={percentage}
                                                sx={{ my: 1 }}
                                            />

                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                mt: 1
                                            }}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
                                                        color: 'rgba(255, 255, 255, 0.7)',
                                                    }}
                                                >
                                                    {result.votes || 0} voto{result.votes !== 1 ? 's' : ''}
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
                                                        fontWeight: 'bold',
                                                        color: 'blueviolet',
                                                    }}
                                                >
                                                    {percentage}%
                                                </Typography>
                                            </Box>
                                        </div>
                                    );
                                })
                            ) : (
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '30vh',
                                    flexDirection: 'column'
                                }}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            mb: 2
                                        }}
                                    >
                                        Nenhum voto registrado ainda
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    )}
                </Container>
            </ContentWrapper>

            {/* Dialog para mostrar detalhes completos da enquete */}
            <Dialog
                open={detailsOpen}
                onClose={handleCloseDetails}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        minHeight: '30vh',
                        maxHeight: '80vh',
                        borderRadius: 3,
                        overflowX: 'hidden',
                        overflowY: 'auto',
                        backgroundColor: 'hsl(220, 30%, 18%)', // Consistente com o dashboard
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
                            wordBreak: 'break-all',
                        }}
                    >
                        {poll?.title}
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
                        {poll?.description || 'Sem descrição disponível'}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

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
                        Estatísticas
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
                            fontSize: '1rem',
                            color: 'rgba(255,255,255,0.96)',
                            mb: 1,
                        }}
                    >
                        Total de votos: {totalVotes}
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
                            fontSize: '1rem',
                            color: 'rgba(255,255,255,0.96)',
                            mb: 1,
                        }}
                    >
                        Opções disponíveis: {poll?.results?.length || 0}
                    </Typography>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
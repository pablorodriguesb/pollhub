import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import { Typography, Grid, CircularProgress, Paper } from '@mui/material';
import PollCard from '../components/PollCard';

export default function UserProfile() {
  const { username } = useParams();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPolls = async () => {
      try {
        const res = await api.get(`/api/users/${username}/polls`);
        setPolls(res.data);
      } catch (err) {
        setPolls([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUserPolls();
  }, [username]);

  if (loading) return <CircularProgress />;
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Enquetes de {username}
      </Typography>
      <Grid container spacing={2}>
        {polls.length > 0 ? (
          polls.map((poll) => (
            <Grid item xs={12} sm={6} md={4} key={poll.id}>
              <PollCard poll={poll} />
            </Grid>
          ))
        ) : (
          <Typography variant="body1">Nenhuma enquete encontrada.</Typography>
        )}
      </Grid>
    </Paper>
  );
}

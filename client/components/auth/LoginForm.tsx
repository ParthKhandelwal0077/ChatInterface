'use client'
import { useState } from 'react';
import { Button, TextField, Box, Typography, Paper } from '@mui/material';
import { loginAction } from '@/app/actions/auth';

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await loginAction(formData);
      
      if (result?.error) {
        setError(result.error);
      }
      // If successful, the server action will redirect
    } catch (err: unknown) {
      console.error('Login form error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Login
      </Typography>
      
      <form action={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            name="email"
            label="Email"
            type="email"
            required
          />
          
          <TextField
            name="password"
            label="Password"
            type="password"
            required
          />

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
} 
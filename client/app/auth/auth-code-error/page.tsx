import { Paper, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';

export default function AuthCodeError() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 2 }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}>
        <Typography variant="h5" component="h1" gutterBottom color="error">
          Authentication Error
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          Sorry, we couldn&apos;t verify your email. This could happen if:
        </Typography>
        
        <Typography variant="body2" component="ul" sx={{ textAlign: 'left', mb: 3 }}>
          <li>The confirmation link has expired</li>
          <li>The link has already been used</li>
          <li>There was a technical issue</li>
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          Please try signing up again or contact support if the problem persists.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="contained" component={Link} href="/signup">
            Try Again
          </Button>
          <Button variant="outlined" component={Link} href="/login">
            Sign In Instead
          </Button>
        </Box>
      </Paper>
    </Box>
  );
} 
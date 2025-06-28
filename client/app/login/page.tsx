import LoginForm from '@/components/auth/LoginForm';
import { Container, Typography, Box } from '@mui/material';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome Back
        </Typography>
        <LoginForm />
        <Box sx={{ mt: 2 }}>
          <Typography>
            Don't have an account?{' '}
            <Link href="/signup" style={{ textDecoration: 'none' }}>
              Sign up here
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
} 
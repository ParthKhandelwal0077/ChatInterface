import SignUpForm from '@/components/auth/SignUpForm';
import { Container, Typography, Box } from '@mui/material';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create an Account
        </Typography>
        <SignUpForm />
        <Box sx={{ mt: 2 }}>
          <Typography>
            Already have an account?{' '}
            <Link href="/login" style={{ textDecoration: 'none' }}>
              Login here
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
} 
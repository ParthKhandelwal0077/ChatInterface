'use client'
import { useState } from 'react';
import { Button, TextField, Box, Typography, IconButton, Paper } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { signupAction } from '@/app/actions/auth';

interface PhoneNumberInput {
  number: string;
  isPrimary: boolean;
}

export default function SignUpForm() {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumberInput[]>([
    { number: '', isPrimary: true }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const addPhoneNumber = () => {
    setPhoneNumbers([...phoneNumbers, { number: '', isPrimary: false }]);
  };

  const removePhoneNumber = (index: number) => {
    const newPhoneNumbers = phoneNumbers.filter((_, i) => i !== index);
    if (newPhoneNumbers.length > 0) {
      newPhoneNumbers[0].isPrimary = true;
    }
    setPhoneNumbers(newPhoneNumbers);
  };

  const setPrimaryPhone = (index: number) => {
    setPhoneNumbers(phoneNumbers.map((phone, i) => ({
      ...phone,
      isPrimary: i === index
    })));
  };

  const updatePhoneNumber = (index: number, value: string) => {
    const newPhoneNumbers = [...phoneNumbers];
    newPhoneNumbers[index].number = value;
    setPhoneNumbers(newPhoneNumbers);
  };

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Add phone numbers to form data
    formData.append('phoneNumbers', JSON.stringify(phoneNumbers));

    try {
      const result = await signupAction(formData);
      
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.message || 'Sign up successful! Please check your email for a confirmation link.');
      }
    } catch (err: unknown) {
      console.error('Signup form error:', err);
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
        Sign Up
      </Typography>
      
      <form action={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            name="name"
            label="Name"
            required
          />
          
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

          <Typography variant="h6" sx={{ mt: 2 }}>
            Phone Numbers
          </Typography>

          {phoneNumbers.map((phone, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                label="Phone Number"
                value={phone.number}
                onChange={(e) => updatePhoneNumber(index, e.target.value)}
                required
                fullWidth
              />
              
              <Button
                variant={phone.isPrimary ? "contained" : "outlined"}
                onClick={() => setPrimaryPhone(index)}
                disabled={phone.isPrimary}
                type="button"
              >
                Primary
              </Button>
              
              {phoneNumbers.length > 1 && (
                <IconButton 
                  onClick={() => removePhoneNumber(index)} 
                  color="error"
                  type="button"
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={addPhoneNumber}
            variant="outlined"
            type="button"
          >
            Add Phone Number
          </Button>

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          {success && (
            <Typography color="success.main" sx={{ mt: 2 }}>
              {success}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
} 
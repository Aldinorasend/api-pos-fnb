import React from 'react';
import { Button, TextField, Typography, Alert, Container, Box } from '@mui/material';
import { Head, useForm } from '@inertiajs/inertia-react';
import Swal from 'sweetalert2';

export default function ForgotPassword(props) {
    const { data, setData, processing, errors, setError } = useForm({
        email: '',
    });

    const onHandleChange = (event) => {
        setData(event.target.name, event.target.value);
    };

    const submit = async (e) => {
        e.preventDefault();
        try {
          const response = await fetch(`${props.api}api/user/send-reset-link`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify({
              "email": data.email,
            }),
          });
      
          const json = await response.json();
      
          if (response.status === 422) {
            // Handle validation errors
            setError(json.errors);
            return;
          }
      
          if (response.ok) {
            // Handle success
            setData('email', ''); // Clear the email field
            Swal.fire({
              title: 'Success',
              text: json.message || 'Password reset link sent. Please check your email.',
              icon: 'success',
              confirmButtonText: 'OK'
            });
          } else {
            // Handle other errors, e.g., 400, 401, etc.
            Swal.fire({
              title: 'Error',
              text: json.message || 'An error occurred. Please try again.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        } catch (error) {
          Swal.fire({
            title: 'Connection Error',
            text: 'We were unable to connect to the server. Please check your internet connection or try again later.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Head title="Forgot Password" />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
                <Typography variant="h5">Forgot your password?</Typography>
                
                <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
                    No problem. Just let us know your email address and we will email you a password reset link that will
                    allow you to choose a new one.
                </Typography>

                {/* Tampilkan alert error hanya jika ada kesalahan */}
                {errors && Object.keys(errors).length > 0 && (
                    <Alert severity="error" sx={{ mt: 3, width: '100%' }}>
                        {Object.values(errors).map((error, idx) => (
                            <div key={idx}>{error}</div>
                        ))}
                    </Alert>
                )}
            </Box>
            <form onSubmit={submit} noValidate sx={{ mt: 3, width: '100%' }}>
                    <TextField
                        label="Email Address"
                        name="email"
                        value={data.email}
                        onChange={onHandleChange}
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        required
                        autoFocus
                        error={errors.email}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            disabled={processing}
                        >
                            {processing ? 'Sending...' : 'Email Password Reset Link'}
                        </Button>
                    </Box>
                </form>
        </Container>
    );
}

import React, { useEffect } from 'react';
import { TextField, Button, Container, Alert } from '@mui/material';
import { Head, useForm } from '@inertiajs/inertia-react';
import Swal from 'sweetalert2';

export default function ResetPassword(props) {
    const { data, setData, post, processing, errors, reset, setError } = useForm({
        token: props.token,
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const onHandleChange = (event) => {
        setData(event.target.name, event.target.value);
    };

    const submit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${props.api}api/user/reset-password/${data.token}`, {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
                },
                body: JSON.stringify({
                    "password": data.password,
                    "password_confirmation": data.password_confirmation
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
                setData({
                    password: '',
                    password_confirmation: ''
                });

                Swal.fire({
                    title: 'Success',
                    text: json.message || 'Password reset successfully.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    // Redirect to login page after the alert is closed
                    window.location.href = '/login';
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
            <Head title="Reset Password" />

            {/* Tampilkan alert error hanya jika ada kesalahan */}
            {errors && Object.keys(errors).length > 0 && (
                <Alert severity="error" sx={{ mt: 3, width: '100%' }}>
                    {Object.values(errors).map((error, idx) => (
                        <div key={idx}>{error}</div>
                    ))}
                </Alert>
            )}

            <form onSubmit={submit} noValidate>
                {/* Password Field */}
                <TextField
                    label="Password"
                    type="password"
                    name="password"
                    value={data.password}
                    onChange={onHandleChange}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    autoComplete="new-password"
                    required
                    error={!!errors.password}
                />

                {/* Confirm Password Field */}
                <TextField
                    label="Confirm Password"
                    type="password"
                    name="password_confirmation"
                    value={data.password_confirmation}
                    onChange={onHandleChange}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    autoComplete="new-password"
                    required
                    error={!!errors.password_confirmation}
                />

                {/* Reset Button */}
                <div className="flex items-center justify-end mt-4">
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={processing}
                    >
                        Reset Password
                    </Button>
                </div>
            </form>
        </Container>
    );
}

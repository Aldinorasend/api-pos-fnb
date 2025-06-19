import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Link, useForm } from '@inertiajs/inertia-react';
import { styled } from '@mui/system';
import Swal from 'sweetalert2';
import { IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const CustomTextField = styled(({ errors, ...props }) => (
  <TextField
    {...props}
    error={Boolean(errors && errors[props.name])}
    helperText={errors && errors[props.name] ? errors[props.name] : ''}
  />
))(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderWidth: '4px',
      borderColor: 'black',
    },
    '&:hover fieldset': {
      borderWidth: '4px',
    },
    '&.Mui-focused fieldset': {
      borderWidth: '4px',
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 'bold',
  },
}));

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link as='a' href='https://lakeside.matradipti.org/' style={{ color: 'rgba(0, 0, 0, 0.6)' }}>
        LAKESIDE
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
      Made With Luv❤️
    </Typography>
  );
}

const defaultTheme = createTheme();

export default function SignInSide(props) {

  const { data, setData, post, processing, errors, setError, reset } = useForm({
    email: '',
    password: '',
    remember: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    return () => {
      reset('password');
    };
  }, []);

  const handleChange = (event) => {
    setData(event.target.name, event.target.type === 'checkbox' ? event.target.checked : event.target.value);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${props.api}api/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          "email": data.email,
          "password": data.password,
          "_token": props.csrf
        }),
      });
  
      const json = await response.json();
  
      if (response.status === 403) {
        // Handle inactive account
        Swal.fire({
          title: 'Account Inactive',
          text: json.message || 'Your account is inactive. Please contact support for more information.',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }
  
      if (response.status === 422) {
        // Handle validation errors
        setError(json.errors); 
        return;
      }
  
      if (response.ok) {
        window.localStorage.setItem("token", json.token);
        post(route('login'));
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
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid 
          item 
          xs={12} 
          sm={8} 
          md={12} 
          component={Paper} 
          elevation={6} 
          square
          sx={{ 
            backgroundImage: "url(assets/images/lakesidefnb.png)",
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'contain',
            backgroundPosition: 'center calc(100% - 10px)',
          }}
        >
          <Box
            width={500}
            sx={{
              mt: '200px',
              mx: { xs: '16px', sm: 'auto' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: { xs: 'auto', sm: 500 },
            }}
          >
            <Typography component="h1" variant="h3" style={{ color: "black" }}>
              Hello, welcome!
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <CustomTextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                autoFocus
                onChange={handleChange}
                errors={errors}
              />
              <CustomTextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                onChange={handleChange}
                errors={errors}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={toggleShowPassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ width: '100%', textAlign: 'right' }}>
                <Link 
                  href={route('password.request')} 
                  variant="body2" 
                  style={{ color: "black" }}
                >
                  Forgot password?
                </Link>
              </Box>

              {/* <FormControlLabel
                control={<Checkbox value="remember" onChange={handleChange} name='remember' color="primary" />}
                label="Remember me"
                name='remember'
              /> */}
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="error"
                sx={{ mt: 3, mb: 2, fontSize:'20px', backgroundColor: "black", color: "white", textTransform: 'none'}}
              >
                Sign In
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
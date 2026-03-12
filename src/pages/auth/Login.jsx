import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';

// project imports
import AuthWrapper from 'sections/auth/AuthWrapper';

// ================================|| JWT - LOGIN ||================================ //

export default function Login() {
  const navigate = useNavigate();
  
  // State for form fields
  const [formData, setFormData] = useState({
    userName: '',
    password: ''
  });
  
  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  
  // State for loading and errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    userName: false,
    password: false
  });

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    setError('');
    // Clear field error
    setFieldErrors({
      ...fieldErrors,
      [e.target.name]: false
    });
  };

  // Toggle password visibility
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Validate form
  const validateForm = () => {
    const errors = {
      userName: !formData.userName.trim(),
      password: !formData.password.trim()
    };
    setFieldErrors(errors);
    return !errors.userName && !errors.password;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('https://voice.vocalbox.in/api/Master/Login', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userName: formData.userName,
          password: formData.password
        })
      });

      const data = await response.json();

      // Check for invalid credentials response
      if (data.isSuccess === false && data.statusCode === 401) {
        throw new Error(data.message || 'Invalid Username and Password');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please try again.');
      }

      // Handle successful login
      setSuccess('Login successful! Redirecting...');
      
      // Store user data or token in localStorage/sessionStorage
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('isAuthenticated', 'true');
      
      // You might want to store token if available in response
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/sample-page');
      }, 2000);

    } catch (err) {
      // Handle login error - specifically for invalid credentials
      setError(err.message || 'Login failed. Please check your credentials and try again.');
      
      // Highlight password field for invalid credentials
      if (err.message.includes('Invalid Username and Password')) {
        setFieldErrors({
          userName: true,
          password: true
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Demo login function for testing
  const handleDemoLogin = () => {
    setFormData({
      userName: 'MIM2600846',
      password: 'lm@846Little'
    });
  };

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Login</Typography>
           
          </Stack>
        </Grid>
        
        <Grid item xs={12}>
          <form onSubmit={handleSubmit} noValidate>
            {/* Error Alert */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 2 }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}
            
            {/* Success Alert */}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            {/* Username Field */}
            <TextField
              fullWidth
              label="Username"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              margin="normal"
              required
              disabled={loading}
              autoComplete="username"
              placeholder="Enter your username"
              variant="outlined"
              error={fieldErrors.userName}
              helperText={fieldErrors.userName && "Username is required"}
              InputProps={{
                sx: {
                  '&.Mui-error fieldset': {
                    borderColor: 'error.main',
                  }
                }
              }}
            />

            {/* Password Field */}
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              disabled={loading}
              autoComplete="current-password"
              placeholder="Enter your password"
              variant="outlined"
              error={fieldErrors.password}
              helperText={fieldErrors.password && "Password is required"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      disabled={loading}
                      size="small"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  '&.Mui-error fieldset': {
                    borderColor: 'error.main',
                  }
                }
              }}
            />

            {/* Forgot Password Link */}
            {/* <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <Button 
                variant="text" 
                size="small" 
                onClick={handleDemoLogin}
                disabled={loading}
                sx={{ textTransform: 'none' }}
              >
                Use Demo Credentials
              </Button>
              <Typography 
                component={Link} 
                to="/forgot-password" 
                variant="body2" 
                color="primary"
                sx={{ textDecoration: 'none' }}
              >
                Forgot Password?
              </Typography>
            </Stack> */}

            {/* Submit Button */}
            <Box sx={{ mt: 3 }}>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading}
                size="large"
                sx={{
                  py: 1.5,
                  position: 'relative',
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress
                      size={24}
                      sx={{
                        position: 'absolute',
                        left: '50%',
                        marginLeft: '-12px',
                        color: 'white'
                      }}
                    />
                    <span style={{ opacity: 0 }}>Sign In</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </Box>

            {/* Additional Help Text */}
            {error && error.includes('Invalid Username and Password') && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Demo Credentials:</strong><br />
                  Username: MIM2600846<br />
                  Password: lm@846Little
                </Typography>
              </Alert>
            )}
          </form>
        </Grid>

        {/* Footer Links */}
        {/* <Grid item xs={12}>
          <Stack direction="row" spacing={1} justifyContent="center">
            <Typography variant="body2" color="textSecondary">
              Having trouble logging in?
            </Typography>
            <Typography 
              component={Link} 
              to="/contact-support" 
              variant="body2" 
              color="primary"
              sx={{ textDecoration: 'none' }}
            >
              Contact Support
            </Typography>
          </Stack>
        </Grid> */}
      </Grid>
    </AuthWrapper>
  );
}
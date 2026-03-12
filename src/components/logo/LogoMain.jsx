// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import logo from '../../assets/images/users/logo.png';

// ==============================|| LOGO IMAGE ||============================== //

export default function LogoMain() {
  const theme = useTheme();

  return (
    <Box
      component="img"
      src={logo}
      alt="Logo"
      sx={{
        width: '100%',          // takes full width of container
        maxWidth: '118px',      // original width, prevents stretching on large screens
        height: 'auto',         // maintains aspect ratio
        display: 'block'        // removes extra space below image
      }}
    />
  );
}
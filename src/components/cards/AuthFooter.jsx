// material-ui
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

// project imports
import ContainerWrapper from 'components/ContainerWrapper';

// ==============================|| FOOTER - AUTHENTICATION ||============================== //

export default function AuthFooter() {
  return (
    <ContainerWrapper>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          gap: 2,
          justifyContent: { xs: 'center', sm: 'space-between' },
          textAlign: { xs: 'center', sm: 'inherit' },
          py: 2
        }}
      >
        {/* Left Section */}
        <Typography variant="subtitle2" color="secondary">
          © {new Date().getFullYear()} Developed by Team{' '}
          <Link
            href="https://myinboxmedia.com"
            target="_blank"
            underline="hover"
            sx={{ fontWeight: 600 }}
          >
            MyInboxMedia
          </Link>
        </Typography>

        {/* Right Section */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{
            gap: { xs: 1, sm: 3 },
            textAlign: { xs: 'center', sm: 'inherit' }
          }}
        >
        
        </Stack>
      </Stack>
    </ContainerWrapper>
  );
}
// material-ui
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

export default function Footer() {
  return (
    <Box sx={{ mt: 'auto', px: 2, pb: 2 }}>
      <Divider sx={{ mb: 2 }} />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
      >
        {/* Left Section */}
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} All rights reserved by{' '}
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
          direction="row"
          spacing={2}
          alignItems="center"
        >
          {/* <Link
            href="https://myinboxmedia.com"
            target="_blank"
            variant="caption"
            color="text.primary"
            underline="hover"
          >
            Website
          </Link> */}

          {/* <Link
            href="https://myinboxmedia.com/contact"
            target="_blank"
            variant="caption"
            color="text.primary"
            underline="hover"
          >
            Contact
          </Link> */}

          {/* <Link
            href="https://myinboxmedia.com/privacy-policy"
            target="_blank"
            variant="caption"
            color="text.primary"
            underline="hover"
          >
            Privacy Policy
          </Link> */}

          {/* <Link
            href="https://myinboxmedia.com/terms"
            target="_blank"
            variant="caption"
            color="text.primary"
            underline="hover"
          >
            Terms
          </Link> */}
        </Stack>
      </Stack>
    </Box>
  );
}
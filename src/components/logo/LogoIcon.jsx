// material-ui
import { useTheme } from '@mui/material/styles';

// ==============================|| LOGO ICON SVG ||============================== //

export default function LogoIcon() {
  const theme = useTheme();

  return (
  <img src="/assets/mim-logo-BHEQFM7X.webp" alt="My Inbox Media" width="110" height="44" fetchpriority="high" decoding="async" class="h-11 w-[110px] object-contain"></img>
  );
}

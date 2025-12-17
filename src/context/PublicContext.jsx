import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Link,
  Stack,
  Divider,
  IconButton,
  Grid,
  useTheme,
  alpha,
} from '@mui/material';

import {
  Menu as MenuIcon,
  Close as CloseIcon,
  ArrowRight,
} from '@mui/icons-material';

export default function PublicLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();

  let tenant =
    localStorage.getItem('current_tenant') ||
    window.localStorage.getItem('current_tenant');

  if (!tenant) {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    // Ensures tenant.wutet.com
    if (parts.length === 3 && parts[1] === 'wutet' && parts[2] === 'com') {
      tenant = parts[0];
    }
  }

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
  ];

  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      bgcolor="background.paper"
    >
      {/* HEADER */}
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <Toolbar sx={{ py: 2 }}>
          <Container maxWidth="xl">
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              {/* Logo */}
              <Typography
                variant="h5"
                fontWeight={900}
                sx={{
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                OKRMaster
              </Typography>

              {/* Desktop Nav */}
              <Stack
                direction="row"
                spacing={5}
                sx={{
                  display: {
                    xs: 'none',
                    lg: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-evenly',
                  },
                }}
              >
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    underline="none"
                    sx={{
                      fontWeight: 600,
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 4,
                  }}
                >
                  {tenant && (
                    <Button variant="outlined" href="/login">
                      Sign In
                    </Button>
                  )}

                  <Button
                    variant="contained"
                    href="/register"
                    endIcon={<ArrowRight />}
                  >
                    Register
                  </Button>
                </Box>
              </Stack>

              {/* Mobile */}
              <IconButton
                onClick={() => setMobileOpen(!mobileOpen)}
                sx={{ display: { lg: 'none' } }}
              >
                {mobileOpen ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
            </Stack>
          </Container>
        </Toolbar>

        {/* Mobile Menu */}
        {mobileOpen && (
          <Box
            sx={{
              display: { xs: 'block', lg: 'none' },
              bgcolor: 'background.paper',
              pb: 3,
            }}
          >
            <Container>
              <Stack spacing={3} mt={3}>
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    underline="none"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                {tenant && (
                  <Button variant="outlined" href="/login">
                    Sign In
                  </Button>
                )}

                <Button fullWidth variant="contained" href="/register">
                  Start Free Trial
                </Button>
              </Stack>
            </Container>
          </Box>
        )}
      </AppBar>

      {/* MAIN */}
      <Box flexGrow={1}>{children}</Box>

      {/* FOOTER */}
      <Box bgcolor="#0f0f1a" color="white" py={6}>
        <Container maxWidth="xl">
          <Grid container spacing={6}>
            <Grid item xs={12} md={4}>
              <Typography variant="h5" fontWeight={900} color="#fff">
                OKRMaster
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }} color="#fff">
                The #1 OKR platform used by 8,000+ teams.
              </Typography>
            </Grid>

            {/* Column links */}
            <Grid item xs={6} sm={3} md={2}>
              <Typography fontWeight={700}>Product</Typography>
              <Stack spacing={1}>
                <Link href="#features" color="grey.400">
                  Features
                </Link>
                <Link href="#pricing" color="grey.400">
                  Pricing
                </Link>
              </Stack>
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <Typography fontWeight={700}>Company</Typography>
              <Stack spacing={1}>
                <Link href="#about" color="grey.400">
                  About
                </Link>
                <Link href="#blog" color="grey.400">
                  Blog
                </Link>
              </Stack>
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <Typography fontWeight={700}>Legal</Typography>
              <Stack spacing={1}>
                <Link href="#privacy" color="grey.400">
                  Privacy
                </Link>
                <Link href="#terms" color="grey.400">
                  Terms
                </Link>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ my: 6, borderColor: 'rgba(255,255,255,0.1)' }} />

          <Typography
            variant="body2"
            align="center"
            sx={{ opacity: 0.6 }}
            color="#fff"
          >
            © {new Date().getFullYear()} OKRMaster. All Rights Reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

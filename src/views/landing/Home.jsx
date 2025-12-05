import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  alpha,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import {
  AutoAwesome,
  Speed,
  Groups,
  Lock,
  CheckCircle,
  Star,
  ArrowForward,
  Timeline,
  BarChart,
  Feedback,
  Insights,
  PlayCircleFilled,
} from '@mui/icons-material';
import PublicContext from 'context/PublicContext';
import { fetchPricingPlans } from './publicApi';

// Import your local videos
import roadmapsVideo from '../../assets/video/roadmaps-d94123daa471cb966e4682b6a71f3f40.mp4';
import portfolioVideo from '../../assets/video/insights-8aab08bef01cb80350a7ce4582349463.mp4';
import feedbackVideo from '../../assets/video/okr-hero-51b47e9ee540df835c984e5cef3474cd.mp4';
import prioritizationVideo from '../../assets/video/prioritization-8cc37da250f955bc019b0ef38f558a82.mp4';
import okrsVideo from '../../assets/video/okr-hero-51b47e9ee540df835c984e5cef3474cd.mp4';
import capacityVideo from '../../assets/video/cp-hero-d96285dd5e0ac66aea40c9616c45fbad.mp4';

const features = [
  {
    id: 'roadmaps',
    title: 'Roadmaps',
    description: 'Build beautiful, customizable roadmaps that everyone loves to use.',
    video: roadmapsVideo,
  },
  {
    id: 'portfolio',
    title: 'Portfolio Management',
    description: 'See all your products and initiatives in one powerful view.',
    video: portfolioVideo,
  },
  {
    id: 'feedback',
    title: 'Feedback & Insights',
    description: 'Collect, organize, and act on customer feedback from every channel.',
    video: feedbackVideo,
  },
  
  {
    id: 'prioritization',
    title: 'Prioritization',
    description: 'Score and rank features with data-driven frameworks.',
    video: prioritizationVideo,
  },
  {
    id: 'okrs',
    title: 'Objectives & OKRs',
    description: 'Align the entire company with cascading goals and real-time progress.',
    video: okrsVideo,
  },
  {
    id: 'capacity',
    title: 'Capacity Planning',
    description: 'Plan team capacity and allocate resources with confidence.',
    video: capacityVideo,
  },
];

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [plans, setPlans] = useState([]);
  const [activeFeature, setActiveFeature] = useState(features[0]);

  // Load pricing plans
  useEffect(() => {
    async function loadPlans() {
      const data = await fetchPricingPlans();
      setPlans(data || []);
    }
    loadPlans();
  }, []);

  // Auto-play new video when feature changes
  useEffect(() => {
    const video = document.getElementById('feature-video');
    if (video) {
      video.load();
      video.play().catch(() => {});
    }
  }, [activeFeature]);

  const formatFeatureKey = (key) =>
    key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const renderFeatureValue = (value) => {
    if (value === true) return null;
    if (value === 'unlimited') return <strong>Unlimited</strong>;
    if (typeof value === 'number') return <strong>{value.toLocaleString()}</strong>;
    return <strong>{value}</strong>;
  };

  return (
    <PublicContext>
      {/* ================= HERO ================= */}
      <Box
        sx={{
          pt: { xs: 14, md: 20 },
          pb: { xs: 10, md: 16 },
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'url(https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80) center/cover',
            opacity: 0.15,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', textAlign: 'center' }}>
          <Typography
            variant={isMobile ? 'h3' : 'h1'}
            fontWeight={900}
            sx={{
              mb: 4,
              background: 'linear-gradient(90deg, #fff, #e0e7ff)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            OKRs That Actually Get Done
          </Typography>

          <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ opacity: 0.9, mb: 6, maxWidth: 800, mx: 'auto', color:'white'}}>
            The #1 OKR platform trusted by 8,000+ high-growth teams. Align everyone, track progress in real-time, and hit every ambitious goal.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              href="/register"
              endIcon={<ArrowForward />}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                fontWeight: 700,
                fontSize: '1.2rem',
                px: 6,
                py: 2,
                borderRadius: 4,
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',

                '&:hover': { transform: 'translateY(-4px)',
                  bgcolor: 'white',
                 },
              }}
            >
              Start Free Trial
            </Button>
            <Button variant="outlined" size="large" href="#demo" sx={{ borderColor: 'white', color: 'white' }}>
              Watch Demo
            </Button>
          </Stack>

          <Typography variant="body2" sx={{ mt: 5, opacity: 0.8 , color:'white'}}>
            No credit card • 7-day free trial • Setup in 2 minutes
          </Typography>
        </Container>
      </Box>

      {/* ================= INTERACTIVE FEATURES SECTION ================= */}
      <Container maxWidth="lg" sx={{ py: { xs: 10, md: 16 } }}>
        <Typography variant="h3" fontWeight={900} textAlign="center" mb={10}>
          Built for Modern Product Teams
        </Typography>

        <Grid container spacing={8} alignItems="flex-start">
          {/* Left: Feature List */}
          <Grid item xs={12} md={5}>
            <Stack spacing={3}>
              {features.map((feature) => (
                <Card
                  key={feature.id}
                  onClick={() => setActiveFeature(feature)}
                  sx={{
                    // p: 4,
                    borderRadius: 4,
                    cursor: 'pointer',
                    border: `2px solid ${
                      activeFeature.id === feature.id ? theme.palette.primary.main : 'transparent'
                    }`,
                    bgcolor: activeFeature.id === feature.id ? alpha(theme.palette.primary.main, 0.08) : 'background.paper',
                    transition: 'all 0.4s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 20px 40px ${alpha('#000', 0.12)}`,
                    },
                  }}
                >
                  <Stack direction="row" spacing={3}>
                    <Box
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        p: 2,
                        borderRadius: 3,
                        flexShrink: 0,
                      }}
                    >
                      {feature.id === 'roadmaps' && <Timeline sx={{ fontSize: 36 }} />}
                      {feature.id === 'portfolio' && <BarChart sx={{ fontSize: 36 }} />}
                      {feature.id === 'feedback' && <Feedback sx={{ fontSize: 36 }} />}
                      {feature.id === 'prioritization' && <Insights sx={{ fontSize: 36 }} />}
                      {feature.id === 'okrs' && <AutoAwesome sx={{ fontSize: 36 }} />}
                      {feature.id === 'capacity' && <Groups sx={{ fontSize: 36 }} />}
                    </Box>
                    <Box>
                      <Typography variant="h5" fontWeight={700} gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Grid>

          {/* Right: Video Player */}
          <Grid item xs={12} md={7}>
            <Box
              sx={{
                position: 'sticky',
                top: 100,
                borderRadius: 5,
                overflow: 'hidden',
                boxShadow: `0 32px 80px ${alpha('#000', 0.2)}`,
                bgcolor: '#000',
                aspectRatio: '16 / 9',
              }}
            >
              <video
                id="feature-video"
                autoPlay
                muted
                loop
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              >
                <source src={activeFeature.video} type="video/mp4" />
              </video>

              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: 'rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s',
                  '&:hover': { opacity: 1 },
                  cursor: 'pointer',
                }}
                onClick={() => document.getElementById('feature-video')?.play()}
              >
                <PlayCircleFilled sx={{ fontSize: 100, color: 'white' }} />
              </Box>

              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  p: 4,
                  bgcolor: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  color: 'white',
                }}
              >
                <Typography variant="h4" fontWeight={800}>
                  {activeFeature.title}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* ================= PRICING ================= */}
      <Box id="pricing" sx={{ bgcolor: '#f8fafc', py: { xs: 10, md: 16 } }}>
        <Container maxWidth="lg">
          <Typography variant="h3" fontWeight={900} textAlign="center" mb={3}>
            Simple, Transparent Pricing
          </Typography>
          <Typography variant="h6" color="text.secondary" textAlign="center" mb={10} maxWidth={700} mx="auto">
            Choose the plan that fits your team. All plans include a <strong>7-day free trial</strong> — no credit card required.
          </Typography>
{plans.length >0?(
          <Grid container spacing={5} justifyContent="center">
            {plans.map((plan) => {
              const isPopular = plan.is_popular === true;
              const isEnterprise = plan.slug === 'enterprise';
              const price = parseFloat(plan.price);
              const currency = plan.currency || 'ETB';

              return (
                <Grid item xs={12} md={4} key={plan.id}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 5,
                      p: { xs: 3, md: 4 },
                      textAlign: 'center',
                      border: isPopular ? `3px solid ${theme.palette.primary.main}` : '1px solid #e2e8f0',
                      bgcolor: 'white',
                      position: 'relative',
                      transition: 'all 0.4s ease',
                      '&:hover': { transform: 'translateY(-16px)', boxShadow: '0 24px 48px rgba(0,0,0,0.12)' },
                      overflow: 'visible',
                    }}
                  >
                    {isPopular && (
                      <Chip
                        label="MOST POPULAR"
                        color="primary"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: -14,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontWeight: 800,
                          px: 2,
                        }}
                      />
                    )}

                    <CardContent sx={{ pt: isPopular ? 5 : 4 }}>
                      <Typography variant="h5" fontWeight={900} mb={1}>{plan.name}</Typography>

                      <Box sx={{ my: 4 }}>
                        {isEnterprise ? (
                          <Typography variant="h3" fontWeight={900}>Custom Pricing</Typography>
                        ) : (
                          <>
                            <Typography variant="h1" fontWeight={900} component="span">
                              {plan.currency} {price.toLocaleString()}
                            </Typography>
                            <Typography component="span" variant="h5" color="text.secondary"> /month</Typography>
                          </>
                        )}
                      </Box>

                      <Chip label="7-day free trial" color="primary" variant="outlined" size="small" sx={{ mb: 4 }} />

                      <Button
                        fullWidth
                        variant={isPopular ? 'contained' : 'outlined'}
                        size="large"
                        href="/register"
                        sx={{ mb: 5, py: 2, fontWeight: 700 }}
                      >
                        {isEnterprise ? 'Contact Sales' : 'Start Free Trial'}
                      </Button>

                      <Stack spacing={2.5} alignItems="flex-start">
                        {Object.entries(plan.features || {}).map(([key, value]) => {
                          if (value === false) return null;
                          return (
                            <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <CheckCircle color="success" fontSize="small" />
                              <Typography variant="body1" fontWeight={500}>
                                {formatFeatureKey(key)}
                                {value !== true && <> : {renderFeatureValue(value)}</>}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

):(
  <Box sx={{display:'flex', alignItems:'center', justifyContent:'center'}}>
    <CircularProgress/>
  </Box>
)}

          <Box textAlign="center" mt={10}>
            <Typography variant="body1" color="text.secondary">
              <strong>8,000+ teams</strong> trust us • Cancel anytime • No credit card required
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* ================= FINAL CTA ================= */}
      <Box
        id="demo"
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: { xs: 10, md: 14 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight={800} mb={3} color="white">
            Ready to Crush Your Goals?
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 5, color:"white"}}>
            Join 8,000+ teams already using our platform
          </Typography>

          <Button
            variant="contained"
            size="large"
            href="/register"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              fontWeight: 700,
              px: 8,
              py: 3,
              fontSize: '1.3rem',
              borderRadius: 4,
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              '&:hover': { transform: 'translateY(-4px)', bgcolor: 'white', },
            }}
          >
            Start Your Free Trial
          </Button>

          <Stack direction="row" justifyContent="center" spacing={1} mt={4}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} sx={{ color: '#ffd700' }} />
            ))}
          </Stack>

          <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 , color:'white'}}>
            "Best OKR tool we’ve ever used" — 500+ five-star reviews
          </Typography>
        </Container>
      </Box>
    </PublicContext>
  );
}
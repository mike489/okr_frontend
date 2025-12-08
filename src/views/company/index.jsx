import React from "react";
import {
  Box,
  Typography,
  Button,
  Avatar,
  Badge,
  Tabs,
  Tab,
  Paper,
  Stack,
  Chip,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  // Trophy,
  Notifications,
  Search,
  HelpOutline,
  Upgrade,
  EmojiEvents,
  TrendingUp,
  Flag,
  Lightbulb,
} from "@mui/icons-material";
import PageContainer from "ui-component/MainPage";

const GoalsDashboard = () => {
  const [tabValue, setTabValue] = React.useState(0);

  return (
    <PageContainer title="Company">
      {/* Company Header */}
      <Box sx={{ px: 4, py: 3, bgcolor: "background.default" }}>
        <Box display="flex" alignItems="center" gap={3}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "#7c4dff",
              fontSize: "2rem",
              fontWeight: "bold",
            }}
          >
            W
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Atlas Labs
              <EmojiEvents sx={{ ml: 1, color: "#ffb400", fontSize: "1.2em" }} />
            </Typography>
          </Box>

          {/* Progress Dots */}
          <Box sx={{ ml: "auto", display: "flex", gap: 1, alignItems: "center" }}>
            {/* <Trophy sx={{ color: "#4caf50" }} /> */}
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, bgcolor: "#4caf50", borderRadius: "50%" }} />
              <Box sx={{ width: 12, height: 12, bgcolor: "#8bc34a", borderRadius: "50%" }} />
              <Box sx={{ width: 12, height: 12, bgcolor: "#ffeb3b", borderRadius: "50%" }} />
              <Box sx={{ width: 12, height: 12, bgcolor: "#f44336", borderRadius: "50%" }} />
            </Box>
            <Typography variant="body2" sx={{ ml: 1 }}>
              0 0 0 1
            </Typography>
            <TrendingUp sx={{ ml: 1, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              0%
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", px: 4 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Goals" sx={{ textTransform: "none", fontWeight: 600 }} />
          <Tab label="Teams (1)" sx={{ textTransform: "none" }} />
          <Tab label="Members (3)" sx={{ textTransform: "none" }} />
          <Tab label="Progress reports" sx={{ textTransform: "none" }} />
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                Performance
                <EmojiEvents sx={{ color: "#ffb400" }} />
                <Lightbulb sx={{ color: "#ff9800" }} />
              </Box>
            }
            sx={{ textTransform: "none" }}
          />
        </Tabs>
      </Box>

      <Box sx={{ p: 4 }}>
        {/* KPIs Section */}
        <Box sx={{ mb: 6 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" fontWeight={600}>
              <Flag sx={{ mr: 1, verticalAlign: "middle" }} />
              KPIs
            </Typography>
            <Box>
              <Button variant="text" size="small">
                Show archived
              </Button>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{ ml: 1 }}
              >
                Add KPI
              </Button>
            </Box>
          </Box>

          <Paper
            sx={{
              p: 8,
              textAlign: "center",
              bgcolor: "#fafafa",
              border: "2px dashed #e0e0e0",
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Atlas Labs has no KPIs yet.
            </Typography>
            <Button variant="text" color="primary">
              Add KPI
            </Button>
          </Paper>
        </Box>

        {/* OKRs Section */}
        <Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" fontWeight={600}>
              OKRs
            </Typography>
            <Button variant="outlined" startIcon={<AddIcon />}>
              Add OKR
            </Button>
          </Box>

          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <Button variant="text" size="small" sx={{ color: "primary" }}>
              Active
            </Button>
            <Button variant="text" size="small">
              Draft
            </Button>
            <Button variant="text" size="small">
              Closed
            </Button>
            <Button variant="text" size="small" sx={{ fontWeight: 600 }}>
              All
            </Button>
          </Box>

          <Paper
            sx={{
              p: 8,
              textAlign: "center",
              bgcolor: "#fafafa",
              minHeight: 200,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              There are no Initiatives in the current view.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default GoalsDashboard;
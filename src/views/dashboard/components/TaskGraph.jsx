import React, { useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

const TaskGraph = ({ tasksData }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Process tasksData to get subtask counts per day
  const graphData = useMemo(() => {
    const validTasksData = Array.isArray(tasksData)
      ? tasksData.filter((task) => task && typeof task === 'object')
      : [];

    return days.map((day, index) => {
      const dayKey = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ][index];
      return validTasksData.reduce((count, task) => {
        const subtasksForDay =
          task.sub_tasks && typeof task.sub_tasks === 'object' && task.sub_tasks[dayKey]
            ? task.sub_tasks[dayKey]
            : [];
        return count + subtasksForDay.length;
      }, 0);
    });
  }, [tasksData]);

  // Calculate max value for scaling (max sub_task_count across tasks)
  const maxValue = useMemo(() => {
    const validTasksData = Array.isArray(tasksData)
      ? tasksData.filter((task) => task && typeof task === 'object')
      : [];
    return validTasksData.length
      ? Math.max(...validTasksData.map((task) => task.sub_task_count+1 || 0), 1)
      : 1; // Avoid division by zero
  }, [tasksData]);

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 250;
  const padding = 40;
  const graphWidth = svgWidth - 2 * padding;
  const graphHeight = svgHeight - 2 * padding;

  // Generate points for the graph
  const points = graphData.map((value, index) => {
    const x = padding + (index / (days.length - 1)) * graphWidth;
    const y = svgHeight - padding - (value / maxValue) * graphHeight;
    return { x, y, value, day: days[index] };
  });

  // Create smooth line path using quadratic Bezier curves
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpX = (p0.x + p1.x) / 2;
    const cpY = p0.y;
    pathD += ` Q ${cpX} ${cpY} ${p1.x} ${p1.y}`;
  }

  // Area under the curve
  const areaPathD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - padding} L ${points[0].x} ${svgHeight - padding} Z`;

  // Y-axis ticks
  const yAxisTicks = [0, Math.round(maxValue / 2), maxValue];
  const yAxisLabels = yAxisTicks.map((tick) => ({
    value: tick,
    y: svgHeight - padding - (tick / maxValue) * graphHeight,
  }));

  return (
    <Card
      sx={{
        borderRadius: 2,
        border: '1px solid rgba(0,0,0,0.1)',
        bgcolor: 'white',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ flex: 1, p: { xs: 2, sm: 3 } }}>
        <Typography
          variant="h6"
          fontWeight={600}
          color="#111827"
          gutterBottom
          sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } , alignSelf: 'center'}}
          align='center'
        >
          Weekly Task Report
        </Typography>
        <Box sx={{ position: 'relative', height: { xs: 200, sm: 250, md: 300 } }}>
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Gradient for area fill */}
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4caf50" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#4caf50" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Area under the curve */}
            <path d={areaPathD} fill="url(#areaGradient)" stroke="none" />

            {/* Y-axis */}
            <line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={svgHeight - padding}
              stroke="#e0e0e0"
              strokeWidth="1"
            />

            {/* X-axis */}
            <line
              x1={padding}
              y1={svgHeight - padding}
              x2={svgWidth - padding}
              y2={svgHeight - padding}
              stroke="#e0e0e0"
              strokeWidth="1"
            />

            {/* Y-axis grid lines and labels */}
            {yAxisLabels.map((tick, index) => (
              <g key={index}>
                <line
                  x1={padding}
                  y1={tick.y}
                  x2={svgWidth - padding}
                  y2={tick.y}
                  stroke="#f5f5f5"
                  strokeWidth="1"
                />
                <text
                  x={padding - 10}
                  y={tick.y + 4}
                  fontSize="12"
                  fill="#666"
                  textAnchor="end"
                >
                  {tick.value}
                </text>
              </g>
            ))}

            {/* Smooth line path */}
            <path
              d={pathD}
              fill="none"
              stroke="#4caf50"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Data points */}
            {points.map((point, index) => (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="10"
                  fill="transparent"
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  style={{ cursor: 'pointer' }}
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={hoveredPoint === point ? 6 : 4}
                  fill={hoveredPoint === point ? '#2e7d32' : '#4caf50'}
                  stroke="#fff"
                  strokeWidth={hoveredPoint === point ? 2 : 1}
                  style={{ transition: 'all 0.2s ease' }}
                />
              </g>
            ))}

            {/* X-axis labels */}
            {points.map((point, index) => (
              <text
                key={index}
                x={point.x}
                y={svgHeight - padding + 20}
                fontSize="12"
                fill={hoveredPoint?.day === point.day ? '#2e7d32' : '#666'}
                textAnchor="middle"
                fontWeight={hoveredPoint?.day === point.day ? 600 : 400}
              >
                {point.day}
              </text>
            ))}

            {/* Hover guidelines */}
            {hoveredPoint && (
              <g>
                <line
                  x1={hoveredPoint.x}
                  y1={padding}
                  x2={hoveredPoint.x}
                  y2={svgHeight - padding}
                  stroke="#2e7d32"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                  opacity="0.5"
                />
                <line
                  x1={padding}
                  y1={hoveredPoint.y}
                  x2={svgWidth - padding}
                  y2={hoveredPoint.y}
                  stroke="#2e7d32"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                  opacity="0.5"
                />
              </g>
            )}
          </svg>

          {/* Tooltip */}
          {hoveredPoint && (
            <Box
              sx={{
                position: 'absolute',
                top: hoveredPoint.y - 60,
                left: hoveredPoint.x - 50,
                bgcolor: '#2e7d32',
                color: 'white',
                borderRadius: 1,
                p: 1,
                minWidth: 100,
                textAlign: 'center',
                boxShadow: 2,
                transform: 'translateX(-50%)',
                pointerEvents: 'none',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -6,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: '6px solid #2e7d32',
                },
              }}
            >
              <Typography variant="caption" fontWeight={600} color={'#fff'}>
                {hoveredPoint.day}
              </Typography>
              <Typography variant="body2" fontWeight={500} color={'#fff'}>
                {hoveredPoint.value} tasks
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskGraph;
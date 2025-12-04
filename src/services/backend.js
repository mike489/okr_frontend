// ================================
// Base URLs from .env
// ================================
const PMS_API = import.meta.env.VITE_PMS_URL;   // Example: https://backend.wutet.com
const AUTH_API = import.meta.env.VITE_AUTH_URL; // Example: https://backend.wutet.com/auth


// ================================
// Read tenant from localStorage
// ================================
const getTenant = () => {
  return localStorage.getItem('current_tenant') || '';
};


// ================================
// Build Tenant-Based PMS API URL
// Example → https://backend.wutet.com/acme/api/objectives
// ================================
const pmsUrl = (path) => {
  const tenant = getTenant();
  return `${PMS_API}/${tenant}/api/${path}`;
};


// ================================
// Build AUTH API URL (no tenant)
// Example → https://backend.wutet.com/auth/login
// ================================
const authUrl = (path) => {
  return `${AUTH_API}/${path}`;
};


// ================================
// BACKEND ROUTES
// ================================
const Backend = {
  /** Base */
  api: PMS_API,
  auth: AUTH_API,

  /** Auth */
  login: 'login',
  logout: 'logout',
  refreshToken: 'refresh',
  resetPassword: 'reset-password',
  setPassword: 'create-password',
  verifyOtp: 'verify-otp',
  changePassword: 'change-password',

  /** Users */
  users: 'users',
  myProfile: 'my-profile',
  updateProfileImage: 'update-profile-image',
  removeProfileImage: 'remove-profile-image',
  changeuserPassword: 'change-user-password',

  /** Units & Roles */
  roles: 'roles',
  units: 'units',
  allUnits: 'units',
  myUnit: 'my-unit',
  unitsImanage: 'units-i-manage',
  unitByTypes: 'unit-by-type/',
  getManagers: 'get-managers',
  types: 'unit-types',

  /** Objectives, KPIs, Key Results */
  objectives: 'objectives',
  keyResults: 'key-results',
  initiatives: 'initiatives',
  planInitiative: 'update-initiative/',

  /** Tasks & Monitoring */
  tasks: 'tasks',
  createTask: 'create-task',
  approveTask: 'approve-task',
  getPendingTasks: 'pending-tasks',
  monitoring: 'monitorings',
  childMonitoring: 'child-monitorings',
  myDay: 'my-day',

  /** Employees */
  employees: 'employees',
  employeeDashboard: 'get-employee-home-dashboard',
  employeeTasks: 'employee-tasks',
  employeeTaskStatus: 'update-employee-task-status/',
  employeePerformance: 'employee-performance/',

  /** Uploads */
  employeeExcel: 'employees/upload',
  unitexcel: 'units/upload',
  mainactivityexcel: 'import-activities',
  kpiExcell: 'kpis/upload',
  UnitExcell: 'units/upload',
  JobExcell: 'job-positions/upload',

  /** Plans */
  getMyPlans: 'my-plans',
  myPlans: 'my-plans',
  plans: 'plans',
  planStatus: 'change-plan-status',
  orgPlan: 'main-kpi-tracking',
  unitsPlan: 'unit-kpi-tracking',
  orgPlanUpdate: 'update-plan/',
  showPlan: 'show-plan',
  deletePlan: 'delete-plan',

  /** Performance & Reporting */
  performance: 'performance',
  myPerformance: 'my-performance',
  KPIPerformance: 'kpi-performance/employee/',
  managerKPIS: 'my-unit-kpis',
  unitPerformance: 'unit-performance/',
  perKPIPerformance: 'my-performance-per-kpi',

  /** Notifications */
  myNotification: 'my-notifications',
  readNotification: 'read-notification/',
  readAllNotification: 'read-all-notifications',

  /** File Exports */
  exportPlans: 'export-planning',
  exportMonitoring: 'export-monitoring',
  exportPerformance: 'export-performance',
  exportMyPlans: 'export-my-planning',
  exportMyMonitoring: 'export-my-monitoring',
  exportMyPerformance: 'export-my-performance',

  /** EOD */
  eodfetch: 'end-of-day-activities',

  /** Evaluation & Workflows */
  evaluationWorkflowAction: 'change-evaluation-workflow-status',
  evaluationTaskApproval: 'manager-evaluation-workflow-action/',

  /** Helper Functions */
  pmsUrl,
  authUrl,
};

export default Backend;

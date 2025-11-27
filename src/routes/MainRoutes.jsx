import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import Protected from 'Protected';

// dashboard routing
const Home = Loadable(lazy(() => import('views/dashboard')));
const Units = Loadable(lazy(() => import('views/units')));
const MyUnits = Loadable(lazy(() => import('views/units/my_units')));
const MyChildUnit = Loadable(lazy(() => import('views/my-child-unit')));

const PendingTasks = Loadable(lazy(() => import('views/todo/pending-tasks')));
const UnitPlan = Loadable(lazy(() => import('views/my-child-unit/UnitPlan')));
const ViewUnit = Loadable(lazy(() => import('views/units/view')));
const Planning = Loadable(lazy(() => import('views/plan')));
const PlanDetail = Loadable(lazy(() => import('views/plan/planDetail')));
const FeedBacks = Loadable(lazy(() => import('views/feedbacks')));
const Objectives = Loadable(lazy(() => import('views/objective')));
const Initiative = Loadable(lazy(() => import('views/initiatives')));
const DiskReport = Loadable(lazy(() => import('views/disk-reporting')));
const ActivityType = Loadable(lazy(() => import('views/activity-type')));
const PlanningStatus = Loadable(
  lazy(() => import('views/plan/plan-status')),
);
const MyTeamPlanReport = Loadable(lazy(() => import('views/my-teams-report/index')));

const TaskStatus = Loadable(lazy(() => import('views/my-teams/task-status')));
const Employees = Loadable(lazy(() => import('views/employees')));

const EmployeesPlanRemove = Loadable(
  lazy(() => import('views/employees/components/EmployeesPlanRemove')),
);
const EmployeesRemovedPlanLog = Loadable(
  lazy(() => import('views/employees/components/EmployeesRemovedPlanLog')),
);
const MyEmployees = Loadable(
  lazy(() => import('views/employees/my_employees')),
);
const ViewEmployee = Loadable(lazy(() => import('views/employees/view')));
const ViewEmployeeFeedBack = Loadable(
  lazy(() => import('views/feedbacks/feedBack')),
);
const ViewMyFeedBack = Loadable(
  lazy(() => import('views/feedbacks/myFeedBack')),
);
const PerformanceRating = Loadable(
  lazy(() => import('views/settings/performance-ratings')),
);
const Perspectives = Loadable(
  lazy(() => import('views/settings/perspectives')),
);
const MeasuringUnits = Loadable(
  lazy(() => import('views/settings/measuring-units')),
);
const MainActivities = Loadable(
  lazy(() => import('views/settings/main-activities')),
);
const Periods = Loadable(lazy(() => import('views/settings/periods')));
const Frequencies = Loadable(lazy(() => import('views/settings/frequencies')));
const NotFound = Loadable(lazy(() => import('views/not-found')));
const ViewTask = Loadable(lazy(() => import('views/approvals/view')));

const Ranking = Loadable(lazy(() => import('views/ranking')));
const Performance = Loadable(lazy(() => import('views/performance')));
const PerKPIPerformanceReport = Loadable(
  lazy(() => import('views/Report/components/per-kpi-performance')),
);
const Tasks = Loadable(lazy(() => import('views/approvals')));
const Approvals = Loadable(lazy(() => import('views/approvals')));
const ViewApprovalTask = Loadable(lazy(() => import('views/approvals/view')));
const Evaluations = Loadable(lazy(() => import('views/evaluation')));
const EvaluationApproval = Loadable(
  lazy(() => import('views/approvals/evaluation-approval')),
);
const MyEvaluations = Loadable(
  lazy(() => import('views/evaluation/my-evaluations')),
);
const Monitoring = Loadable(lazy(() => import('views/monitoring')));
const MonitoringReport = Loadable(lazy(() => import('views/monitoringReport')));
const ViewPlan = Loadable(lazy(() => import('views/plan/View')));
const Account = Loadable(lazy(() => import('views/account')));
const KPIManagement = Loadable(lazy(() => import('views/kpi')));
const Users = Loadable(lazy(() => import('views/users')));
const Workflows = Loadable(lazy(() => import('views/workflows')));
const Report = Loadable(lazy(() => import('views/Report')));
const Viewoverallcompany = Loadable(
  lazy(() => import('views/Report/admin_side/UnitDetailView')),
);
const ViewKpiDetail = Loadable(
  lazy(() => import('views/Report/admin_side/KpiDetailView')),
);
const Job = Loadable(lazy(() => import('views/job-positions/index')));
const Todo = Loadable(lazy(() => import('views/todo/index')));
const MyTeam = Loadable(lazy(() => import('views/my-teams')));
const ViewTeamTasks = Loadable(lazy(() => import('views/my-teams/view')));

// utilities routing
const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));
const BasicConfigPage = Loadable(
  lazy(() => import('views/settings/view/basic-config')),
);
const EodActivityPage = Loadable(lazy(() => import('views/Eod/EodActivity')));
const RolePermission = Loadable(
  lazy(() => import('views/roles_permission/Page')),
);
const Unauthorized = Loadable(lazy(() => import('utils/unautorized')));

// sample page routingkpiMange-view
const Testpage = Loadable(lazy(() => import('views/sample-page/test')));
const Fortest = Loadable(lazy(() => import('views/dashboard/index')));

const LoginPage = Loadable(lazy(() => import('views/authentication/Login')));
// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: (
        <Protected>
          <Home />
        </Protected>
      ),
    },
    {
      path: 'home',
      element: (
        <Protected>
          <Home />
        </Protected>
      ),
    },

    {
      path: 'account',
      element: (
        <Protected>
          <Account />
        </Protected>
      ),
    },
 {
      path: 'account',
      element: (
        <Protected>
          <Account />
        </Protected>
      ),
    },
    {
      path: 'activity-type',
      element: (
        <Protected>
          <ActivityType />
        </Protected>
      ),
    },
    {
      path: 'employees_plan_remove',
      element: (
        <Protected>
          <EmployeesPlanRemove />
        </Protected>
      ),
    },

    {
      path: 'childemployees',
      element: (
        <Protected>
          <MyEmployees />
        </Protected>
      ),
    },
 {
      path: 'desk-report',
      element: (
        <Protected>
          <DiskReport />
        </Protected>
      ),
    },

    {
      path: 'employees/view',
      element: (
        <Protected>
          <ViewEmployee />
        </Protected>
      ),
    },
    {
      path: 'employeesFeedBack/view',
      element: (
        <Protected>
          <ViewEmployeeFeedBack />
        </Protected>
      ),
    },
    {
      path: 'myFeedBacks',
      element: (
        <Protected>
          <ViewMyFeedBack />
        </Protected>
      ),
    },
    {
      path: 'units',
      element: (
        <Protected>
          <Units />
        </Protected>
      ),
    },
    {
      path: 'my_units',
      element: (
        <Protected>
          <MyUnits />
        </Protected>
      ),
    },

    {
      path: 'units/view',
      element: (
        <Protected>
          <ViewUnit />
        </Protected>
      ),
    },

    {
      path: 'main-activity',
      element: (
        <Protected>
          <Planning />
        </Protected>
      ),
    },

    {
      path: 'plan/view',
      element: (
        <Protected>
          <ViewPlan />
        </Protected>
      ),
    },

    {
      path: 'plan/details',
      element: (
        <Protected>
          <PlanDetail />
        </Protected>
      ),
    },
    {
      path: 'my-child-unit',
      element: (
        <Protected>
          <MyChildUnit/>
        </Protected>
      ),
    },
       {
      path: 'my-child-main-activities',
      element: (
        <Protected>
          <MyChildUnit/>
        </Protected>
      ),
    },
    {
      path: 'pending-tasks',
      element: (
        <Protected>
          <PendingTasks/>
        </Protected>
      ),
    },
    {
      path: 'unit-plan/:id',
      element: (
        <Protected>
          <UnitPlan />
        </Protected>
      ),
    },
    
    {
      path: 'feedbacks',
      element: (
        <Protected>
          <FeedBacks />
        </Protected>
      ),
    },
    {
      path: 'objective',
      element: (
        <Protected>
          <Objectives />
        </Protected>
      ),
    },
    {
      path: 'initiatives',
      element: (
        <Protected>
          <Initiative />
        </Protected>
      ),
    },
    {
      path: 'plan/status',
      element: (
        <Protected>
          <PlanningStatus />
        </Protected>
      ),
    },
    {
      path: 'task/status',
      element: (
        <Protected>
          <TaskStatus />
        </Protected>
      ),
    },
    {
      path: 'monitoring',
      element: (
        <Protected>
          <Monitoring />
        </Protected>
      ),
    },
    {
      path: 'monitoringReport',
      element: (
        <Protected>
          <MonitoringReport />
        </Protected>
      ),
    },
    {
      path: 'evaluations',
      element: (
        <Protected>
          <Evaluations />
        </Protected>
      ),
    },

    {
      path: 'evaluation-approval',
      element: (
        <Protected>
          <EvaluationApproval />
        </Protected>
      ),
    },

    {
      path: 'my-evaluations',
      element: (
        <Protected>
          <MyEvaluations />
        </Protected>
      ),
    },

    {
      path: 'tasks',
      element: (
        <Protected>
          <Tasks />
        </Protected>
      ),
    },

    {
      path: 'task/detail',
      element: (
        <Protected>
          <ViewTask />
        </Protected>
      ),
    },

    {
      path: 'approvals',
      element: (
        <Protected>
          <Approvals />
        </Protected>
      ),
    },
    {
      path: 'approval/view',
      element: (
        <Protected>
          <ViewApprovalTask />
        </Protected>
      ),
    },

    {
      path: 'workflows',
      element: (
        <Protected>
          <Workflows />
        </Protected>
      ),
    },

    {
      path: 'performance',
      element: (
        <Protected>
          <Performance />
        </Protected>
      ),
    },
    {
      path: 'per-kpi-performance',
      element: (
        <Protected>
          <PerKPIPerformanceReport />
        </Protected>
      ),
    },
    {
      path: 'ranking',
      element: (
        <Protected>
          <Ranking />
        </Protected>
      ),
    },
    {
      path: 'ranking',
      element: (
        <Protected>
          <Ranking />
        </Protected>
      ),
    },
    {
      path: 'todo',
      element: (
        <Protected>
          <Todo />
        </Protected>
      ),
    },
    {
      path: 'my-teams',
      element: (
        <Protected>
          <MyTeam />
        </Protected>
      ),
    },
    {
      path: 'my-team/member/tasks',
      element: (
        <Protected>
          <ViewTeamTasks />
        </Protected>
      ),
    },

    {
      path: 'utils',
      children: [
        {
          path: 'util-color',
          element: (
            <Protected>
              <UtilsColor />
            </Protected>
          ),
        },
      ],
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-shadow',
          element: (
            <Protected>
              <UtilsShadow />
            </Protected>
          ),
        },
      ],
    },

    {
      path: 'basic-config',
      children: [
        {
          path: 'basic-config-creation',
          element: (
            <Protected>
              <BasicConfigPage />
            </Protected>
          ),
        },
      ],
    },
    {
      path: 'frequencies',
      element: (
        <Protected>
          <Frequencies />
        </Protected>
      ),
    },
    {
      path: 'periods',
      element: (
        <Protected>
          <Periods />
        </Protected>
      ),
    },
    {
      path: 'measuring-units',
      element: (
        <Protected>
          <MeasuringUnits />
        </Protected>
      ),
    },
    { path: 'main-activities',
    element: (
      <Protected>
        <MainActivities />
      </Protected>
    ),
  },
    {
      path: 'perspectives',
      element: (
        <Protected>
          <Perspectives />
        </Protected>
      ),
    },

    {
      path: 'performance-rating',
      element: (
        <Protected>
          <PerformanceRating />
        </Protected>
      ),
    },
    {
      path: 'kpi',
      children: [
        {
          path: 'kpi-managment',
          element: (
            <Protected>
              <KPIManagement />
            </Protected>
          ),
        },
      ],
    },

    {
      path: 'Eod',
      element: (
        <Protected>
          <EodActivityPage />
        </Protected>
      ),
    },
    {
      path: 'users',
      element: (
        <Protected>
          <Users />
        </Protected>
      ),
    },

    {
      path: 'role-permission',
      element: (
        <Protected>
          <RolePermission />
        </Protected>
      ),
    },

    {
      path: 'report',
      element: (
        <Protected>
          <Report />
        </Protected>
      ),
    },
    {
      path: '/my-teams-report',
      element: (
        <Protected>
          <MyTeamPlanReport />
        </Protected>
      ),
    },

    {
      path: '/report/overall_company',
      element: (
        <Protected>
          <Viewoverallcompany />
        </Protected>
      ),
    },

    {
      path: '/report/KpiDetailView',
      element: (
        <Protected>
          <ViewKpiDetail />
        </Protected>
      ),
    },

    {
      path: 'unauthorized',
      element: <Unauthorized />,
    },
    {
      path: 'test',
      element: (
        <Protected>
          <Testpage />
        </Protected>
      ),
    },
    {
      path: 'fortest',
      element: (
        <Protected>
          <Fortest />
        </Protected>
      ),
    },

    {
      path: 'job',
      element: (
        <Protected>
          <Job />
        </Protected>
      ),
    },
    {
      path: '/*',
      element: <NotFound />,
    },
  ],
};

export default MainRoutes;

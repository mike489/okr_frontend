import {
  IconHome,
  IconGauge,
  IconLayoutCards,
  IconTrophy,
  IconZoomScan,
  IconCircleCheck,
  IconHazeMoon,
  IconList,
  IconChartInfographic,
  IconKey,
  IconAnalyze,
  IconSteam,
  IconCircle,
  IconFocus2,
  IconCreditCardRefund,
  IconAlbum,
  IconDeviceCctv,
  IconTargetArrow,
  IconCalendarCog,
  IconListCheck,
  IconGitBranch,
  IconTrendingUp,
  IconRulerMeasure,
  IconBrandTeams,
  IconUserCircle,
  IconGraphFilled,
  IconDisc,
} from '@tabler/icons-react';

const icons = {
  IconHome,
  IconGauge,
  IconLayoutCards,
  IconTrophy,
  IconZoomScan,
  IconCircleCheck,
  IconHazeMoon,
  IconList,
  IconChartInfographic,
  IconKey,
  IconAnalyze,
  IconSteam,
  IconCircle,
  IconFocus2,
  IconCreditCardRefund,
  IconAlbum,
  IconDeviceCctv,
  IconTargetArrow,
  IconCalendarCog,
  IconListCheck,
  IconGitBranch,
  IconTrendingUp,
  IconRulerMeasure,
  IconBrandTeams,
  IconUserCircle,
  IconGraphFilled,
  IconDisc,
};
import getRolesAndPermissionsFromToken from 'utils/auth/getRolesAndPermissionsFromToken';

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const auth = getRolesAndPermissionsFromToken();
export const dashboard = () => {
  const childrenTemp = [];
  const addedPermissions = new Set();

  const userPermissions = [
    'read:kpi',
    'read:plan',
    'read:childunit',
    'read:employeetask',
    'read:endofdayactivity',
    'read:kpitracker',
    'read:plan_status',
    'read:task_status',
    'read:task',
    'read:myteams',
    'read_key_result',
    // 'read:pendingtask',
    // 'read:monitoring',
    'read:evaluation',
    'read:feedback',
    'read:measuringunit',
    // 'read_key_result',
    'read:myfeedbacks',
    'read:performance',
    'read:planreport',
    'read:monitoringReport',
    'read:deletelog',
    // 'read:childunit',
    'read_objective',
    // 'read:initiative',
    // 'read:employee',
    'read:monitoring',
    'read:myteamplanreport',
    'read:reporting',
    'read:activitytype',

  ];

  const permissionMap = {
    'read:kpi': {
      id: 'kpi-management',
      title: 'KPI Management',
      url: '/kpi/kpi-managment',
      icon: icons.IconKey,
    },

    'read_objective': {
      id: 'objective',
      title: 'Objective',
      url: '/objective',
      icon: icons.IconTargetArrow,
    },

    'read:initiative': {
      id: 'initiative',
      title: 'Initiatives',
      url: '/initiatives',
      icon: icons.IconCircle,
    },

    'read:measuringunit': {
      id: 'measuring-units',
      title: 'Measuring Units',
      url: '/measuring-units',
      icon: icons.IconRulerMeasure,
    },
    'read_key_result': {
      id: 'key-result',
      title: 'Key Result',
      url: '/key-result',
      icon: icons.IconList,
    },
    'read:task-status': {
      id: 'task-status',
      title: 'Init',
      url: '/inti',
      icon: icons.IconCircle,
    },
    'read:plan': {
      id: 'plan',
      title: 'My Main Activities',
      url: '/main-activity',
      icon: icons.IconList,
    },
    'read:childunit': {
      id: 'childunit',
      title: 'My Child Main Activities',
      url: '/my-child-main-activities',
      icon: icons.IconGitBranch,
    },
    // 'read:childunit': {
    //   id: 'childunit',
    //   title: 'My Child Unit',
    //   url: '/my-child-unit',
    //   icon: icons.IconGitBranch,
    // },
    'read:task': {
      id: 'task',
      title: 'Task',
      url: '/todo',
      icon: icons.IconListCheck,
    },
    'read:myteams': {
      id: 'myteams',
      title: 'My Teams Task',
      url: '/my-teams',
      icon: icons.IconBrandTeams,
    },
    'read:pendingtask': {
      id: 'approvals',
      title: 'Approval Requests',
      url: '/pending-tasks',
      icon: icons.IconCircleCheck,
    },

    'read:monitoring': {
      id: 'monitoring',
      title: 'Monitoring',
      url: '/monitoring',
      icon: icons.IconAnalyze,
    },

    'read:feedback': {
      id: 'Feed Backs',
      title: 'Feed Backs',
      url: '/feedbacks',
      icon: icons.IconCreditCardRefund,
    },
    'read:myfeedbacks': {
      id: 'My Feed Backs',
      title: 'My Feed Backs',
      url: '/myfeedbacks',
      icon: icons.IconAlbum,
    },

    'read:evaluation': {
      id: 'evaluations',
      title: 'Evaluation',
      url: '/evaluations',
      icon: icons.IconListCheck,
    },
    'read:performance': {
      id: 'performance',
      title: 'Performance',
      url: '/performance',
      icon: icons.IconTrophy,
    },
   
    'read:activitytype': {
      id: 'activity-type',
      title: 'Activity Type',
      url: '/activity-type',
      icon: icons.IconZoomScan,
    },
   
  };

  if (auth) {
    userPermissions.forEach((permissionName) => {
      auth.forEach((role) => {
        const setting =
          permissionMap[permissionName] ||
          permissionMap[`${permissionName}-approvals`];

        if (setting && !addedPermissions.has(setting.id)) {
          const hasPermission = role.permissions.find(
            (per) => per.name === permissionName,
          );

          if (hasPermission) {
            childrenTemp.push({
              ...setting,
              type: 'item',
            });
            addedPermissions.add(setting.id);
          }
        }
      });
    });
  }

  return {
    id: 'trackers',
    title: 'Trackers',
    icon: icons.IconGauge,
    type: 'group',
    children: childrenTemp,
  };
};

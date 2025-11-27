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
export const reports = () => {
  const childrenTemp = [];
  const addedPermissions = new Set();

  const userPermissions = [
    'read:planreport',
    'read:monitoringReport',
    'read:myteamplanreport',
    'read:reporting',
    'read:activitytype',
  ];

  const permissionMap = {
    'read:monitoringReport': {
      id: 'monitoringReports',
      title: 'Monitoring Reports',
      url: '/monitoringReport',
      icon: icons.IconDeviceCctv,
    },
    'read:reporting': {
      id: 'disk-report',
      title: 'Desk Report',
      url: '/desk-report',
      icon: icons.IconDisc,
    },
    'read:planreport': {
      id: 'report',
      title: 'Report',
      url: '/report',
      icon: icons.IconChartInfographic,
    },
    'read:myteamplanreport': {
      id: 'myteamreport',
      title: 'My Team Report',
      url: '/my-teams-report',
      icon: icons.IconGraphFilled,
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
    id: 'reports',
    title: 'Reports',
    icon: icons.IconGauge,
    type: 'group',
    children: childrenTemp,
  };
};

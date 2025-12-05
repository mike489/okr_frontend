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
export const company = () => {
  const childrenTemp = [];
  const addedPermissions = new Set();

  const userPermissions = [
    'read_key_result',
    // 'read:monitoringReport',
    // 'read:myteamplanreport',
    // 'read:reporting',
    // 'read:activitytype',
  ];

  const permissionMap = {
    'read_key_result': {
      id: 'company',
      title: 'Company',
      url: '/company',
      icon: icons.IconChartInfographic,
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
    id: 'company',
    title: 'Company',
    icon: icons.IconGauge,
    type: 'item',
    children: childrenTemp,
  };
};

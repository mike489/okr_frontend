// assets
import {
  IconDashboard,
  IconReport,
  IconShadow,
  IconActivity,
  IconSettingsStar,
  IconFileReport,
  IconBrandCampaignmonitor,
  IconRoute,
  IconWaveSawTool,
  IconCalendarWeek,
  IconRulerMeasure,
  IconPerspective,
  IconFolderStar,
  IconBriefcase,
  IconList,
  
} from '@tabler/icons-react';
import getRolesAndPermissionsFromToken from 'utils/auth/getRolesAndPermissionsFromToken';

// constant
const icons = {
  IconDashboard,
  IconReport,
  IconShadow,
  IconActivity,
  IconSettingsStar,
  IconFileReport,
  IconBrandCampaignmonitor,
  IconRoute,
  IconWaveSawTool,
  IconCalendarWeek,
  IconRulerMeasure,
  IconPerspective,
  IconFolderStar,
  IconBriefcase,
  IconList,
};

// ==============================|| Kpi_basic_config  MENU ITEMS ||============================== //

const auth = getRolesAndPermissionsFromToken();

export const settings = () => {
  const childrenTemp = [];
  const addedPermissions = new Set();

  const orderedPermissions = [
    'read:frequency',
    'read:period',
    'read:measuringunit',
    'read:mainactivity',
    'read:perspectivetype',
    'read:performanceratingscale',
    'approval:manage'
  ];

  const permissionMap = {
    'read:perspectivetype': {
      id: 'perspective',
      title: 'Perspectives',
      url: '/perspectives',
      icon: icons.IconPerspective
    },
    'read:period': {
      id: 'periods',
      title: 'Fiscal Years',
      url: '/periods',
      icon: icons.IconCalendarWeek
    },
    'read:frequency': {
      id: 'frequencies',
      title: 'Frequencies',
      url: '/frequencies',
      icon: icons.IconWaveSawTool
    },
    'read:measuringunit': {
      id: 'measuring-units',
      title: 'Measuring Units',
      url: '/measuring-units',
      icon: icons.IconRulerMeasure
    },
    'read:mainactivity': {
      id: 'mainactivities',
      title: 'Main Activity',
      url: '/main-activities',
      icon: icons.IconList
    },

    'read:performanceratingscale': {
      id: 'performance-rating',
      title: 'Performance Rating',
      url: '/performance-rating',
      icon: icons.IconFolderStar
    },

    'approval:manage': {
      id: 'workflows',
      title: 'Approval Workflows',
      url: '/workflows',
      icon: icons.IconRoute
    }
  };

  if (auth) {
    orderedPermissions.forEach((permissionName) => {
      auth.forEach((role) => {
        const setting = permissionMap[permissionName];

        if (setting && !addedPermissions.has(permissionName)) {
          const hasPermission = role.permissions.find((per) => per.name === permissionName);

          if (hasPermission) {
            childrenTemp.push({
              ...setting,
              type: 'item'
            });
            addedPermissions.add(permissionName);
          }
        }
      });
    });
  }

  return {
    id: 'settings',
    title: 'Settings',
    type: 'group',
    icon: icons.IconSettingsStar,
    children: childrenTemp
  };
};

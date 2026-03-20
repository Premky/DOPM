// src/utils/iconMap.js
import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import FolderIcon from '@mui/icons-material/Folder';

const ICONS = {
  Dashboard: DashboardIcon,
  People: PeopleIcon,
  Assessment: AssessmentIcon,
  Settings: SettingsIcon,
  Default: FolderIcon,
};

/**
 * Returns a MUI icon component for a given name.
 * If the name is invalid or not in ICONS, returns Default icon.
 */
export function getIcon(name) {
  // Ensure name is a string
  if (!name || typeof name !== 'string') {
    console.warn(`Icon name is not a valid string: ${name}`);
    const DefaultIcon = ICONS.Default;
    return <DefaultIcon fontSize="small" />;
  }

  const IconComponent = ICONS[name] || ICONS.Default;

  // Ensure the component is a valid React component
  if (!React.isValidElement(<IconComponent />)) {
    console.warn(`Icon "${name}" is not a valid component. Using Default.`);
    const DefaultIcon = ICONS.Default;
    return <DefaultIcon fontSize="small" />;
  }

  return <IconComponent fontSize="small" />;
}

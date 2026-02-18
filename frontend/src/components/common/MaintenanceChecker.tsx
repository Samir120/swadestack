import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import useAuthViewModel from '@/viewmodels/authViewModel';
import MaintenanceMode from '@/pages/MaintenanceMode';

interface MaintenanceCheckerProps {
  children: React.ReactNode;
}

const MaintenanceChecker: React.FC<MaintenanceCheckerProps> = ({ children }) => {
  const { settings } = useAppSelector((state) => state.siteSettings);
  const { isAuthenticated, isAdmin } = useAuthViewModel();
  const [showMaintenance, setShowMaintenance] = useState(false);

  useEffect(() => {
    // Check if maintenance mode is enabled
    const maintenanceEnabled = settings?.maintenanceMode || false;

    // If maintenance is on and user is NOT an admin, show maintenance page
    if (maintenanceEnabled && !(isAuthenticated && isAdmin())) {
      setShowMaintenance(true);
    } else {
      setShowMaintenance(false);
    }
  }, [settings, isAuthenticated, isAdmin]);

  // Show maintenance page or normal content
  if (showMaintenance) {
    return <MaintenanceMode />;
  }

  return <>{children}</>;
};

export default MaintenanceChecker;

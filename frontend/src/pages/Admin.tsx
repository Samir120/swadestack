import React from 'react';
import { useAuthViewModel } from '../viewmodels/authViewModel';

const Admin: React.FC = () => {
  const { isAdmin, requireAdmin } = useAuthViewModel();

  React.useEffect(() => {
    requireAdmin();
  }, []);

  if (!isAdmin()) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      <p className="text-neutral-400">Admin dashboard coming soon...</p>
    </div>
  );
};

export default Admin;

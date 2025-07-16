import React from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/features/authSlice';
import Button from '../../components/ui/button/Button';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">Welcome to your dashboard!</p>
      <Button onClick={handleLogout} variant="outline">
        Logout
      </Button>
    </div>
  );
};

export default Dashboard; 
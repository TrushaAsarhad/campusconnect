import React from 'react';
import { useSelector } from 'react-redux';

const Dashboard = () => {
  const auth = useSelector((state) => state.auth);

  return (
    <div>
      <h1>Dashboard</h1>
      {auth.isAuthenticated ? <p>Welcome, {auth.user.name}</p> : <p>Please log in</p>}
    </div>
  );
};

export default Dashboard;

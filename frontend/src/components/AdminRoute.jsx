import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  return (
    <div>
      {useSelector(
        (state) => state.auth.userInfo && state.auth.userInfo.isAdmin,
      ) ? (
        <Outlet />
      ) : (
        <Navigate to="/login" />
      )}
    </div>
  );
  // if userInfo exists and is an admin, render the child routes (Outlet), otherwise redirect to login page
};

export default AdminRoute;

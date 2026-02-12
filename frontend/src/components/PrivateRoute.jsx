import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  return (
    <div>
      {useSelector((state) => state.auth.userInfo) ? (
        <Outlet />
      ) : (
        <Navigate to="/login" />
      )}
    </div>
  );
  // if userInfo exists, render the child routes (Outlet), otherwise redirect to login page
};

export default PrivateRoute;

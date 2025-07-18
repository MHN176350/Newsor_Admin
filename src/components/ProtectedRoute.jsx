import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Result, Button } from 'antd';
import { useAuth } from '../store/AuthContext';
import { hasPageAccess } from '../utils/permissions';
import { useTranslation } from 'react-i18next';

/**
 * Protected Route component that checks user permissions
 */
const ProtectedRoute = ({ children, requiredPermission = null }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  // Show loading while checking authentication
  if (loading) {
    return null; // The main Layout already handles loading state
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no specific permission required, just check authentication
  if (!requiredPermission) {
    return children;
  }

  // Check if user has permission to access this route
  const userRole = user?.profile?.role;
  const hasAccess = hasPageAccess(userRole, requiredPermission);

  if (!hasAccess) {
    return (
      <Result
        status="403"
        title="403"
        subTitle={t('admin.noPermission')}
        extra={
          <div style={{ textAlign: 'center' }}>
            <p>
              <strong>{t('admin.currentRole')}:</strong> {userRole ? t(`users.roles.${userRole.toLowerCase()}`) : t('users.roles.unknown')}
            </p>
            <p>
              <strong>{t('admin.requiredRole')}:</strong> {t('users.roles.admin')}
            </p>
            <Button 
              type="primary" 
              onClick={() => window.history.back()}
            >
              {t('common.goBack')}
            </Button>
          </div>
        }
      />
    );
  }

  return children;
};

export default ProtectedRoute;

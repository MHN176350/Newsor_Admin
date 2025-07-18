/**
 * Permission utilities for role-based access control
 */

// Define permissions for each role
export const ROLE_PERMISSIONS = {
  admin: {
    pages: ['/dashboard', '/articles', '/categories', '/tags', '/users', '/contact', '/settings'],
    actions: ['create', 'read', 'update', 'delete'],
  },
  manager: {
    pages: ['/dashboard', '/articles', '/categories', '/tags'],
    actions: ['create', 'read', 'update', 'delete'],
  },
  writer: {
    pages: ['/dashboard', '/articles'],
    actions: ['create', 'read', 'update'],
  },
  reader: {
    pages: ['/dashboard'],
    actions: ['read'],
  },
};

/**
 * Check if user has permission to access a specific page
 * @param {string} userRole - The user's role
 * @param {string} page - The page path to check
 * @returns {boolean} - Whether user has access
 */
export const hasPageAccess = (userRole, page) => {
  if (!userRole || !page) return false;
  
  const role = userRole.toLowerCase();
  const permissions = ROLE_PERMISSIONS[role];
  
  if (!permissions) return false;
  
  return permissions.pages.includes(page);
};

/**
 * Check if user has permission to perform a specific action
 * @param {string} userRole - The user's role
 * @param {string} action - The action to check (create, read, update, delete)
 * @returns {boolean} - Whether user can perform the action
 */
export const hasActionPermission = (userRole, action) => {
  if (!userRole || !action) return false;
  
  const role = userRole.toLowerCase();
  const permissions = ROLE_PERMISSIONS[role];
  
  if (!permissions) return false;
  
  return permissions.actions.includes(action);
};

/**
 * Get all accessible pages for a user role
 * @param {string} userRole - The user's role
 * @returns {string[]} - Array of accessible page paths
 */
export const getAccessiblePages = (userRole) => {
  if (!userRole) return [];
  
  const role = userRole.toLowerCase();
  const permissions = ROLE_PERMISSIONS[role];
  
  return permissions ? permissions.pages : [];
};

/**
 * Check if user is admin
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether user is admin
 */
export const isAdmin = (userRole) => {
  return userRole?.toLowerCase() === 'admin';
};

/**
 * Check if user is manager or higher
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether user is manager or admin
 */
export const isManagerOrHigher = (userRole) => {
  const role = userRole?.toLowerCase();
  return ['admin', 'manager'].includes(role);
};

/**
 * Check if user can manage users (admin only)
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether user can manage users
 */
export const canManageUsers = (userRole) => {
  return isAdmin(userRole);
};

/**
 * Check if user can manage content (admin or manager)
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether user can manage content
 */
export const canManageContent = (userRole) => {
  return isManagerOrHigher(userRole);
};

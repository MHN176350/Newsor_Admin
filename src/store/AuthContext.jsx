import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CURRENT_USER, LOGIN_USER } from '../graphql/queries';
import { UPDATE_USER_PROFILE } from '../graphql/mutations'; // Đảm bảo đã có mutation này
import { message as antdMessage } from 'antd';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Storage keys
const TOKEN_KEY = 'token';
const REMEMBER_ME_KEY = 'rememberMe';
const USER_DATA_KEY = 'userData';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Use antd message hook
  const [messageApi, contextHolder] = antdMessage.useMessage();

  // Initialize authentication state from storage
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const storedRememberMe = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
    const storedUserData = localStorage.getItem(USER_DATA_KEY);

    setRememberMe(storedRememberMe);

    if (!token) {
      setLoading(false);
      setIsAuthenticated(false);
      // If user didn't choose to remember, clear any stored data
      if (!storedRememberMe) {
        clearStoredData();
      }
    } else if (storedRememberMe && storedUserData) {
      // If remember me is enabled and we have cached user data, use it temporarily
      try {
        const userData = JSON.parse(storedUserData);
        setUser(userData);
        setIsAuthenticated(true);
        // GraphQL query will validate and update if needed
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        clearStoredData();
      }
    }
  }, []);

  // Helper function to clear stored data
  const clearStoredData = () => {
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
  };
  // Check for existing token and validate user
const { data: userData, loading: userLoading, error: userError, refetch: refetchUser } = useQuery(GET_CURRENT_USER, {
    skip: !localStorage.getItem(TOKEN_KEY),
    onCompleted: (data) => {
      if (data.me) {
        setUser(data.me);
        setIsAuthenticated(true);

        // Store user data if remember me is enabled
        if (rememberMe) {
          localStorage.setItem(USER_DATA_KEY, JSON.stringify(data.me));
        }

        // Check if user has admin/manager role
        const userRole = data.me.profile?.role?.toLowerCase();
        if (!['admin', 'manager'].includes(userRole)) {
          messageApi.error('Access denied. Admin or Manager role required.');
          logout();
        }
      }
      setLoading(false);
    },
    onError: (error) => {
      console.error('Auth error:', error);
      logout();
      setLoading(false);
    }
  });

  const [loginMutation] = useMutation(LOGIN_USER, {
    onCompleted: (data) => {
      if (data.tokenAuth.token) {
        const { token, user } = data.tokenAuth;
        localStorage.setItem(TOKEN_KEY, token);
        setUser(user);
        setIsAuthenticated(true);

        // Store user data and remember preference if remember me is enabled
        if (rememberMe) {
          localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
          localStorage.setItem(REMEMBER_ME_KEY, 'true');
        } else {
          // If not remembering, clear any stored data
          clearStoredData();
        }

        // Check if user has admin/manager role
        const userRole = user.profile?.role?.toLowerCase();
        if (!['admin', 'manager'].includes(userRole)) {
      messageApi.error('Access denied. Admin or Manager role required.');
          logout();
          return;
        }

        messageApi.success('Login successful!');
      }
    },
    onError: (error) => {
      console.error('Login error:', error);
      messageApi.error(error.message || 'Login failed. Please check your credentials.');
    }
  });

  const [updateProfileMutation] = useMutation(UPDATE_USER_PROFILE);

  const login = async (username, password, remember = false) => {
    try {
      setRememberMe(remember);
      await loginMutation({
        variables: { username, password }
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.clear();
    // Only clear user data and remember preference if user didn't want to be remembered
    if (!rememberMe) {
      clearStoredData();
    }
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
  };


  // Refetch user and update context state
  const refetchAndUpdateUser = async () => {
    const { data } = await refetchUser();
    if (data?.me) setUser(data.me);
  };

  const updateProfile = async (profileInput) => {
    try {
      const { data } = await updateProfileMutation({
        variables: { ...profileInput }
      });
      return data.updateUserProfile;
    } catch (error) {
      return { success: false, errors: [error.message] };
    }
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    loading: loading || userLoading,
    userRole: user?.profile?.role,
    rememberMe,
    setRememberMe,
    updateProfile,
    refetchUser: refetchAndUpdateUser,
  };

  return (
    <>
      {contextHolder}
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    </>
  );
};

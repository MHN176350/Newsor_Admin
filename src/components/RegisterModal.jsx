import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { Modal, Typography, Spin, Alert, Button } from 'antd';
import { useAuth } from '../store/AuthContext';
import RegisterForm from './RegisterForm';
import { CREATE_USER } from '../graphql/mutations';
import { useTranslation } from 'react-i18next';

export default function RegisterModal() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Modal always open for create user
  const [showModal, setShowModal] = useState(true);
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // GraphQL mutation
  const [createUser] = useMutation(CREATE_USER, {
    onCompleted: (data) => {
      if (data?.createUser?.success) {
        // Navigate back to users with success message
        navigate('/users', { 
          state: { 
            message: t('users.messages.createSuccess') 
          }
        });
      }
    }
  });

  // Check authentication and permissions
  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <Typography.Title level={3} style={{ marginBottom: 16 }}>
          {t('createArticle.authRequired')}
        </Typography.Title>
        <Typography.Text style={{ display: 'block', marginBottom: 24, color: '#666' }}>
          {t('createArticle.signInMessage', { action: t('users.register.createUser') })}
        </Typography.Text>
        <Button type="primary" onClick={() => navigate('/login')}>
          {t('auth.login.signIn')}
        </Button>
      </div>
    );
  }

  const userRole = user?.profile?.role?.toLowerCase();
  const canCreateUsers = ['manager', 'admin'].includes(userRole);

  if (!canCreateUsers) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <Typography.Title level={3} style={{ marginBottom: 16, color: '#ff4d4f' }}>
          {t('createArticle.permissionDenied')}
        </Typography.Title>
        <Typography.Text style={{ display: 'block', marginBottom: 16, color: '#666' }}>
          {t('createArticle.writerPrivileges', { action: t('users.register.createUser') })}
        </Typography.Text>
        <Typography.Text style={{ display: 'block', marginBottom: 24, color: '#666' }}>
          {t('createArticle.currentRole')}: {user?.profile?.role || t('common.reader')}
        </Typography.Text>
        <Button onClick={() => navigate(-1)}>
          {t('common.back')}
        </Button>
      </div>
    );
  }

  // Handle form submit from RegisterForm
  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    setErrors([]);
    try {
      console.log('Form values received:', values);
      
      if (values.password !== values.confirmPassword) {
        setErrors([t('users.register.passwordMismatch')]);
        setIsSubmitting(false);
        return;
      }

      const variables = {
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
        firstName: values.firstName?.trim() || '',
        lastName: values.lastName?.trim() || '',
      };
      
      console.log('GraphQL variables:', variables);
      
      const result = await createUser({ variables });
      const data = result.data;
      
      console.log('GraphQL response:', data);
      
      if (!data?.createUser?.success) {
        console.error('GraphQL errors:', data?.createUser?.errors);
        setErrors(data?.createUser?.errors || [t('users.register.failed')]);
      } else {
        setShowModal(false);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors([error.message || t('users.register.failed')]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={showModal}
      onCancel={() => {
        setShowModal(false);
        navigate(-1); // Go back on close
      }}
      footer={null}
      title={t('users.newUser')}
      width={600}
      destroyOnHidden
    >
      <RegisterForm
        isSubmitting={isSubmitting}
        errors={errors}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowModal(false);
          navigate(-1);
        }}
        t={t}
      />
    </Modal>
  );
}

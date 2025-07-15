import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Alert, Typography, Space, Row, Col } from 'antd';
import { LockOutlined, UserOutlined, EyeInvisibleOutlined, EyeTwoTone, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { RESET_PASSWORD } from '../graphql/mutations/auth';
import '../styles/admin-theme.css';

const { Title, Text } = Typography;

const ResetPassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [resetPassword] = useMutation(RESET_PASSWORD);

  useEffect(() => {
    // If no uid or token, redirect to forgot password
    if (!uid || !token) {
      navigate('/forgot-password');
    }
  }, [uid, token, navigate]);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Debug logging
    console.log('=== ResetPassword Debug ===');
    console.log('Raw URL params:', { uid, token });
    console.log('Raw uid type:', typeof uid, 'length:', uid?.length);
    console.log('Raw token type:', typeof token, 'length:', token?.length);
    console.log('Form values:', values);

    // Check for potential stringification
    const cleanUid = uid?.startsWith('"') && uid?.endsWith('"') ? uid.slice(1, -1) : uid;
    const cleanToken = token?.startsWith('"') && token?.endsWith('"') ? token.slice(1, -1) : token;

    console.log('Cleaned values:', { cleanUid, cleanToken });

    const variables = {
      uid: cleanUid,
      token: cleanToken,
      username: values.username,
      newPassword: values.newPassword,
    };

    console.log('Final GraphQL variables:', variables);

    try {
      const { data } = await resetPassword({
        variables,
      });

      if (data.resetPassword.success) {
        setSuccess(true);
        form.resetFields();
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.resetPassword.errors?.[0] || data.resetPassword.message || 'An error occurred');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while resetting your password');
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Password is required!'));
    }
    if (value.length < 8) {
      return Promise.reject(new Error('Password must be at least 8 characters long!'));
    }
    return Promise.resolve();
  };

  const validateConfirmPassword = (_, value) => {
    const password = form.getFieldValue('newPassword');
    if (!value) {
      return Promise.reject(new Error('Please confirm your password!'));
    }
    if (value !== password) {
      return Promise.reject(new Error('Passwords do not match!'));
    }
    return Promise.resolve();
  };

  return (
    <div className="login-container">
      <div className="login-background-overlay"></div>
      
      {/* Animated background elements */}
      <div className="login-background-elements">
        <div className="bg-element bg-element-1"></div>
        <div className="bg-element bg-element-2"></div>
        <div className="bg-element bg-element-3"></div>
      </div>

      <div className="login-content">
        <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
          <Col xs={22} sm={20} md={18} lg={14} xl={12} xxl={10}>
            <Card className="login-card">
              <div className="login-header">
                <div className="login-logo">
                  <div className="logo-icon">
                    <LockOutlined />
                  </div>
                  <Title level={1} className="login-title">
                    Reset Password
                  </Title>
                </div>
                <Text className="login-subtitle">
                  Enter your username and new password to reset your account.
                </Text>
              </div>

              {error && (
                <Alert
                  message={error}
                  type="error"
                  showIcon
                  closable
                  style={{ marginBottom: '24px' }}
                  onClose={() => setError(null)}
                />
              )}

              {success && (
                <Alert
                  message="Password Reset Successful!"
                  description="Your password has been reset successfully. You will be redirected to login page in 3 seconds."
                  type="success"
                  showIcon
                  style={{ marginBottom: '24px' }}
                />
              )}

              <Form
                form={form}
                name="resetPassword"
                layout="vertical"
                onFinish={handleSubmit}
                size="large"
                autoComplete="off"
              >
                <Form.Item
                  name="username"
                  rules={[
                    { required: true, message: 'Username is required!' },
                    { min: 3, message: 'Username must be at least 3 characters!' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className="input-icon" />}
                    placeholder="Enter your username"
                    className="login-input"
                  />
                </Form.Item>

                <Form.Item
                  name="newPassword"
                  rules={[{ validator: validatePassword }]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="input-icon" />}
                    placeholder="Enter new password"
                    className="login-input"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  rules={[{ validator: validateConfirmPassword }]}
                  dependencies={['newPassword']}
                >
                  <Input.Password
                    prefix={<LockOutlined className="input-icon" />}
                    placeholder="Confirm new password"
                    className="login-input"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>

                <Form.Item>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      className="login-button"
                      block
                      disabled={success}
                    >
                      {loading ? 'Resetting...' : 'Reset Password'}
                    </Button>
                    
                    <Link to="/login">
                      <Button 
                        type="text" 
                        icon={<ArrowLeftOutlined />}
                        className="back-to-login"
                        block
                      >
                        Back to Login
                      </Button>
                    </Link>
                  </Space>
                </Form.Item>
              </Form>

              <div className="login-footer">
                <Text type="secondary">
                  Remember your password? <Link to="/login" className="signup-link">Sign In</Link>
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ResetPassword;

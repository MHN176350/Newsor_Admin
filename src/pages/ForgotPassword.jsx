import React, { useState } from 'react';
import { Form, Input, Button, Card, Alert, Typography, Space, Row, Col } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { REQUEST_PASSWORD_RESET } from '../graphql/mutations/auth';
import '../styles/admin-theme.css';

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  const [requestPasswordReset] = useMutation(REQUEST_PASSWORD_RESET);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { data } = await requestPasswordReset({
        variables: {
          email: values.email,
        },
      });

      if (data.requestPasswordReset.success) {
        setSuccess(true);
        form.resetFields();
      } else {
        setError(data.requestPasswordReset.errors?.[0] || 'An error occurred');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while processing your request');
    } finally {
      setLoading(false);
    }
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
                    <MailOutlined />
                  </div>
                  <Title level={1} className="login-title">
                    Forgot Password
                  </Title>
                </div>
                <Text className="login-subtitle">
                  Enter your email address and we'll send you a link to reset your password.
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
                  message="Reset link sent!"
                  description="If an account with this email exists, you will receive a password reset email within 15 minutes."
                  type="success"
                  showIcon
                  style={{ marginBottom: '24px' }}
                />
              )}

              <Form
                form={form}
                name="forgotPassword"
                layout="vertical"
                onFinish={handleSubmit}
                size="large"
                autoComplete="off"
              >
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Email is required!' },
                    { type: 'email', message: 'Please enter a valid email address!' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="input-icon" />}
                    placeholder="Enter your email address"
                    className="login-input"
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
                    >
                      {loading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword;

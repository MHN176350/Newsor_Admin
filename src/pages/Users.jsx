import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Select,
  message,
  Space,
  Alert,
  Spin
} from 'antd';
import { EditOutlined, UserOutlined } from '@ant-design/icons';
import { useQuery, useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { GET_USERS, CHANGE_USER_ROLE } from '../graphql/queries';
import { getRoleColor, formatDate, USER_ROLES } from '../utils/helpers';
import { useNavigate, useLocation } from 'react-router-dom';

const Users = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Show success message if coming from register
  useEffect(() => {
    if (location.state?.message) {
      message.success(location.state.message);
      // Clear the state so the message doesn't show again on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  // Fetch users
  const { data, loading, error, refetch } = useQuery(GET_USERS);

  // Change user role mutation
  const [changeUserRole, { loading: changing }] = useMutation(CHANGE_USER_ROLE, {
    onCompleted: (data) => {
      if (data.changeUserRole.success) {
        message.success(t('users.messages.roleUpdateSuccess'));
        setIsModalVisible(false);
        setSelectedUser(null);
        form.resetFields();
        refetch();
      } else {
        message.error(data.changeUserRole.errors?.join(', ') || t('users.messages.roleUpdateFailed'));
      }
    },
    onError: (error) => {
      message.error(t('users.messages.roleUpdateError') + ': ' + error.message);
    }
  });

  const users = data?.users || [];

  // Filter out admin users from the role change table for security
  const nonAdminUsers = users.filter(user =>
    user.profile?.role?.toLowerCase() !== USER_ROLES.ADMIN.toLowerCase()
  );

  const handleRoleChange = (user) => {
    setSelectedUser(user);
    form.setFieldsValue({
      newRole: user.profile?.role || USER_ROLES.READER
    });
    setIsModalVisible(true);
  };

  const handleSubmit = (values) => {
    if (selectedUser) {
      changeUserRole({
        variables: {
          userId: parseInt(selectedUser.id, 10),
          newRole: values.newRole
        }
      });
    }
  };

  const columns = [
    {
      title: t('users.table.user'),
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {record.firstName || record.lastName
              ? `${record.firstName} ${record.lastName}`.trim()
              : record.username
            }
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            @{record.username}
          </div>
        </div>
      )
    },
    {
      title: t('users.table.email'),
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: t('users.table.role'),
      dataIndex: 'profile',
      key: 'role',
      render: (profile) => (
        <Tag color={getRoleColor(profile?.role || USER_ROLES.READER)}>
          {(profile?.role || USER_ROLES.READER).toUpperCase()}
        </Tag>
      )
    },
    {
      title: t('users.table.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? t('users.table.active') : t('users.table.inactive')}
        </Tag>
      )
    },
    {
      title: t('users.table.joinDate'),
      dataIndex: 'dateJoined',
      key: 'dateJoined',
      render: (date) => formatDate(date)
    },
    {
      title: t('users.table.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleRoleChange(record)}
          >
            {t('users.actions.changeRole')}
          </Button>
        </Space>
      )
    }
  ];

  const roleOptions = [
    { value: USER_ROLES.READER, label: t('users.roles.reader') },
    { value: USER_ROLES.WRITER, label: t('users.roles.writer') },
    { value: USER_ROLES.MANAGER, label: t('users.roles.manager') }
    // Admin role is excluded for security reasons
  ];

  if (error) {
    return (
      <Alert
        message={t('users.messages.loadingError')}
        description={error.message}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>{t('users.title')}</h1>
          <p>{t('users.subtitle')}</p>
        </div>
        <Button
          type="primary"
          style={{ borderRadius: '8px', fontWeight: 600, minWidth: 160 }}
          onClick={() => navigate('/register')}
        >
          + {t('users.newUser')}
        </Button>
      </div>
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Space>
            <UserOutlined />
            <span>{t('users.info.totalUsers')}: {users.length}</span>
            <span>|</span>
            <span>{t('users.info.manageableUsers')}: {nonAdminUsers.length}</span>
          </Space>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            {t('users.info.adminSecurityNote')}
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={nonAdminUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              t('users.pagination.showTotal', {
                start: range[0],
                end: range[1],
                total
              })
          }}
        />
      </Card>

      {/* Role Change Modal */}
      <Modal
        title={`${t('users.modal.changeRoleTitle')} ${selectedUser?.firstName || selectedUser?.username}`}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedUser(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <div style={{ marginBottom: '16px' }}>
            <p><strong>{t('users.modal.currentRole')}:</strong> {selectedUser?.profile?.role || USER_ROLES.READER}</p>
            <p><strong>{t('users.email')}:</strong> {selectedUser?.email}</p>
          </div>

          <Form.Item
            label={t('users.modal.newRole')}
            name="newRole"
            rules={[{ required: true, message: t('users.messages.selectRole') }]}
          >
            <Select placeholder={t('users.messages.selectRole')}>
              {roleOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  <Tag color={getRoleColor(option.value)}>
                    {option.label}
                  </Tag>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={changing}>
                {t('users.actions.updateRole')}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                {t('users.actions.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;

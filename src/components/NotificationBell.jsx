import React, { useState, useCallback, useMemo } from 'react';
import {
  Button, Badge, Dropdown, Menu, Typography, Divider, Space, List, Avatar,
  Spin, Empty
} from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  RocketOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { GET_UNREAD_NOTIFICATIONS, NOTIFICATION_SUBSCRIPTION } from '../graphql/queries';
import { MARK_NOTIFICATION_AS_READ, MARK_ALL_NOTIFICATIONS_AS_READ } from '../graphql/mutations';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

const { Text, Title } = Typography;

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Fetch unread notifications
  const { data: notificationsData, loading, refetch } = useQuery(GET_UNREAD_NOTIFICATIONS, {
    fetchPolicy: 'cache-and-network',
    skip: !isAuthenticated,
    // pollInterval: 5000, // Poll every 5 seconds

  });

  useSubscription(NOTIFICATION_SUBSCRIPTION, {
    skip: !isAuthenticated,
    onData: useCallback(({ data }) => {
      if (data?.data?.notificationAdded) {
        refetch();
      }
    }, [refetch]),
  });


  const [markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ, {
    refetchQueries: [{ query: GET_UNREAD_NOTIFICATIONS }],
    awaitRefetchQueries: true,
  });

  const [markAllAsRead] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ, {
    refetchQueries: [{ query: GET_UNREAD_NOTIFICATIONS }],
    awaitRefetchQueries: true,
  });

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Invalid date in formatDateTime:', dateString, error);
      return '';
    }
  };

  const notifications = notificationsData?.unreadNotifications || [];
  const notificationCount = notifications.length;

  const handleOpenChange = (flag) => {
    setOpen(flag);
  };

  const handleNotificationClick = (notification) => {
    // Optimistically navigate and close while mutation runs in the background
    navigate(`/review/article/${notification.article.slug}`);
    setOpen(false);
    try {
      markAsRead({
        variables: {
          notificationId: parseInt(notification.id)
        },
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setOpen(false);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'article_submitted':
        return <FileTextOutlined style={{ color: '#1890ff' }} />;
      case 'article_approved':
        return <CheckOutlined style={{ color: '#52c41a' }} />;
      case 'article_rejected':
        return <CloseOutlined style={{ color: '#ff4d4f' }} />;
      case 'article_published':
        return <RocketOutlined style={{ color: '#722ed1' }} />;
      default:
        return <BellOutlined style={{ color: '#faad14' }} />;
    }
  };

  const menuItems = useMemo(() => [
    {
      key: 'header',
      type: 'group',
      label: (
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Title level={5} style={{ margin: 0 }}>Notifications</Title>
          {notifications.length > 0 && (
            <Button
              type="text"
              size="small"
              icon={<CheckOutlined />}
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
      )
    },
    ...(loading && !notifications.length ? [{
      key: 'loading',
      label: (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <Spin />
          <Text style={{ marginLeft: 8 }}>Loading...</Text>
        </div>
      ),
      disabled: true
    }] : []),
    ...(!loading && notifications.length === 0 ? [{
      key: 'empty',
      label: (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No unread notifications"
          style={{ padding: '20px' }}
        />
      ),
      disabled: true
    }] : []),
    ...notifications.map((notification) => ({
      key: notification.id,
      label: (
        <div style={{
          cursor: 'pointer',
          padding: '12px 16px',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Space>
            <Avatar icon={getNotificationIcon(notification.notificationType)} />
            <div>
              <Text style={{ fontSize: '14px', lineHeight: '1.4' }}>
                {notification.message}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {formatDateTime(notification.createdAt)}
              </Text>
            </div>
          </Space>
        </div>
      ),
      onClick: () => handleNotificationClick(notification)
    }))
  ], [notifications, loading, handleMarkAllAsRead, handleNotificationClick]);

  return (
    <Dropdown
      menu={{ items: menuItems, style: { width: 350, maxHeight: 400, overflow: 'auto' } }}
      trigger={['click']}
      open={open}
      onOpenChange={handleOpenChange}
      placement="bottomRight"
    >
      <Button
        type="text"
        icon={
          <Badge count={notificationCount} size="small">
            <BellOutlined style={{ fontSize: '18px' }} />
          </Badge>
        }
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '40px',
          width: '40px'
        }}
      />
    </Dropdown>
  );
}

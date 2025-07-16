import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Alert,
  Tag,
  Typography,
  Select,
  Row,
  Col,
  Divider,
  Spin,
  Dropdown,
  Menu,
  Descriptions,
  Collapse,
  Statistic,
  Switch,
  Badge,
  List,
  Avatar,
  Empty,
  App
} from 'antd';
import {
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  MessageOutlined,
  EditOutlined,
  SaveOutlined,
  SendOutlined,
  EyeOutlined,
  DownOutlined,
  PlusOutlined,
  DeleteOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  LinkOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  BellOutlined,
  UserAddOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ContactsOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_CONTACTS,
  GET_EMAIL_TEMPLATE,
  GET_EMAIL_TEMPLATES
} from '../graphql/queries';
import {
  UPDATE_CONTACT_STATUS,
  UPDATE_EMAIL_TEMPLATE,
  CREATE_EMAIL_TEMPLATE,
  DELETE_EMAIL_TEMPLATE,
  SEND_THANK_YOU_EMAIL
} from '../graphql/mutations';
import { formatDate } from '../utils/helpers';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

// Enhanced HTML Editor Component
const HTMLEditor = ({ value, onChange, placeholder, rows = 12 }) => {
  const { t } = useTranslation(); // Add translation hook here
  const [currentValue, setCurrentValue] = useState(value || '');
  const [showPreview, setShowPreview] = useState(false);

  const insertHtmlTag = (openTag, closeTag = '') => {
    const textarea = document.getElementById('html-editor-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentValue.substring(start, end);

    let newText;
    let cursorPosition;

    if (selectedText) {
      newText = currentValue.substring(0, start) + openTag + selectedText + (closeTag || openTag) + currentValue.substring(end);
      cursorPosition = start + openTag.length + selectedText.length + (closeTag || openTag).length;
    } else {
      newText = currentValue.substring(0, start) + openTag + (closeTag || '') + currentValue.substring(end);
      cursorPosition = start + openTag.length;
    }

    setCurrentValue(newText);
    onChange && onChange(newText);

    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  };

  const insertVariable = (variable) => {
    insertHtmlTag(`{{ ${variable} }}`, '');
  };

  const insertEmailStructure = () => {
    const template = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
    <div style="background: linear-gradient(135deg, #3A9285 0%, #308fb3 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">EvoluSoft</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for reaching out!</p>
    </div>
    
    <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear {{ name }},</p>
        
        <p style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for contacting <strong>{{ company_name }}</strong>! We have received your inquiry about <strong>{{ request_service }}</strong> services.
        </p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #333;"><strong>Your message:</strong></p>
            <p style="margin: 10px 0 0 0; color: #666; font-style: italic;">{{ request_content }}</p>
        </div>
        
        <p style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 20px;">
            Our team will review your requirements and get back to you within 24-48 hours.
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #3A9285; font-weight: bold;">Best regards,</p>
            <p style="margin: 5px 0 0 0; color: #666;">The EvoluSoft Team</p>
        </div>
    </div>
</div>`;
    setCurrentValue(template);
    onChange && onChange(template);
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setCurrentValue(newValue);
    onChange && onChange(newValue);
  };

  // Update value when prop changes
  React.useEffect(() => {
    setCurrentValue(value || '');
  }, [value]);

  // Trigger onChange when currentValue changes programmatically
  React.useEffect(() => {
    if (onChange && currentValue !== value) {
      onChange(currentValue);
    }
  }, [currentValue, onChange, value]);

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px' }}>
      {/* Toolbar */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid #d9d9d9',
        backgroundColor: '#fafafa',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Space wrap>
          {/* Text Formatting */}
          <Button
            size="small"
            icon={<BoldOutlined />}
            onClick={() => insertHtmlTag('<strong>', '</strong>')}
            title="Bold"
          />
          <Button
            size="small"
            icon={<ItalicOutlined />}
            onClick={() => insertHtmlTag('<em>', '</em>')}
            title="Italic"
          />
          <Button
            size="small"
            icon={<UnderlineOutlined />}
            onClick={() => insertHtmlTag('<u>', '</u>')}
            title="Underline"
          />

          <Divider type="vertical" />

          {/* Structure Elements */}
          <Button
            size="small"
            onClick={() => insertHtmlTag('<h1>', '</h1>')}
            title="Heading 1"
          >
            H1
          </Button>
          <Button
            size="small"
            onClick={() => insertHtmlTag('<h2>', '</h2>')}
            title="Heading 2"
          >
            H2
          </Button>
          <Button
            size="small"
            onClick={() => insertHtmlTag('<p>', '</p>')}
            title="Paragraph"
          >
            P
          </Button>
          <Button
            size="small"
            onClick={() => insertHtmlTag('<br/>', '')}
            title="Line Break"
          >
            BR
          </Button>
          <Button
            size="small"
            onClick={() => insertHtmlTag('<div>', '</div>')}
            title="Div Container"
          >
            DIV
          </Button>

          <Divider type="vertical" />

          {/* Template Variables */}
          <Dropdown
            menu={
              <Menu onClick={({ key }) => insertVariable(key)}>
                <Menu.Item key="name">{'{{ name }}'}</Menu.Item>
                <Menu.Item key="email">{'{{ email }}'}</Menu.Item>
                <Menu.Item key="phone">{'{{ phone }}'}</Menu.Item>
                <Menu.Item key="request_service">{'{{ request_service }}'}</Menu.Item>
                <Menu.Item key="request_content">{'{{ request_content }}'}</Menu.Item>
                <Menu.Item key="company_name">{'{{ company_name }}'}</Menu.Item>
              </Menu>
            }
          >
            <Button size="small" title="Insert Template Variables">
              Variables <DownOutlined />
            </Button>
          </Dropdown>

          {/* Quick Template */}
          <Button
            size="small"
            type="dashed"
            onClick={insertEmailStructure}
            title="Insert Email Template Structure"
          >
            Template
          </Button>
        </Space>

        {/* Preview Toggle */}
        <Button
          size="small"
          type={showPreview ? "primary" : "default"}
          onClick={() => setShowPreview(!showPreview)}
          title={t('admin.contact.htmlEditor.togglePreview')}
        >
          {showPreview ? t('admin.contact.htmlEditor.edit') : t('admin.contact.htmlEditor.preview')}
        </Button>
      </div>

      {/* Editor or Preview */}
      {showPreview ? (
        <div style={{
          padding: '20px',
          minHeight: `${rows * 20}px`,
          backgroundColor: '#f9f9f9',
          borderRadius: '0 0 6px 6px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div dangerouslySetInnerHTML={{ __html: currentValue }} />
          </div>
        </div>
      ) : (
        <TextArea
          id="html-editor-textarea"
          value={currentValue}
          onChange={handleChange}
          placeholder={placeholder}
          rows={rows}
          style={{
            border: 'none',
            resize: 'vertical',
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace',
            fontSize: '13px',
            borderRadius: '0 0 6px 6px'
          }}
        />
      )}

      {/* Status Bar */}
      <div style={{
        padding: '6px 12px',
        borderTop: '1px solid #d9d9d9',
        backgroundColor: '#fafafa',
        fontSize: '11px',
        color: '#666',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Text type="secondary">
          {currentValue.length} characters
        </Text>
        <Text type="secondary">
          {showPreview ? t('admin.contact.htmlEditor.previewMode') : t('admin.contact.htmlEditor.htmlEditor')}
        </Text>
      </div>
    </div>
  );
};

// Form-compatible HTML Editor wrapper
const FormHTMLEditor = React.forwardRef(({ value, onChange, ...props }, ref) => {
  return (
    <HTMLEditor
      {...props}
      value={value}
      onChange={onChange}
    />
  );
});

FormHTMLEditor.displayName = 'FormHTMLEditor';

const Contact = () => {
  const { t } = useTranslation();
  const { modal } = App.useApp();
  const [selectedContact, setSelectedContact] = useState(null);
  const [isContactModalVisible, setIsContactModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(false);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
  const [templateForm] = Form.useForm();
  const [createTemplateForm] = Form.useForm();

  // Real-time state
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);
  const [realtimeStats, setRealtimeStats] = useState({
    newContactsToday: 0,
    pendingReply: 0,
    repliedToday: 0,
    totalContacts: 0
  });
  const [realtimeNotifications, setRealtimeNotifications] = useState([]);

  // Fetch contacts
  const { data: contactsData, loading: contactsLoading, error: contactsError, refetch: refetchContacts } = useQuery(GET_CONTACTS, {
    variables: { first: 50 }
  });

  // Fetch all email templates
  const { data: templatesData, loading: templatesLoading, refetch: refetchTemplates } = useQuery(GET_EMAIL_TEMPLATES);

  // Fetch specific email template
  const { data: templateData, loading: templateLoading, refetch: refetchTemplate } = useQuery(GET_EMAIL_TEMPLATE, {
    variables: { name: 'default_thank_you' },
    skip: !editingTemplate,
    errorPolicy: 'all' // Allow partial data even if there are errors
  });

  // Update contact status mutation
  const [updateContactStatus, { loading: updatingStatus }] = useMutation(UPDATE_CONTACT_STATUS, {
    onCompleted: (data) => {
      if (data.updateContactStatus.success) {
        message.success(t('admin.contact.messages.statusUpdated'));
        refetchContacts();
      } else {
        message.error(data.updateContactStatus.errors?.join(', ') || t('admin.contact.messages.statusUpdateFailed'));
      }
    },
    onError: (error) => {
      message.error(error.message || t('admin.contact.messages.statusUpdateFailed'));
    }
  });

  // Update email template mutation
  const [updateEmailTemplate, { loading: updatingTemplate }] = useMutation(UPDATE_EMAIL_TEMPLATE, {
    onCompleted: (data) => {
      if (data.updateEmailTemplate.success) {
        message.success(t('admin.contact.messages.templateUpdated'));
        setEditingTemplate(false);
        refetchTemplate();
        refetchTemplates(); // Also refresh the templates list
      } else {
        message.error(data.updateEmailTemplate.errors?.join(', ') || t('admin.contact.messages.templateUpdateFailed'));
      }
    },
    onError: (error) => {
      message.error(error.message || t('admin.contact.messages.templateUpdateFailed'));
    }
  });

  // Create email template mutation
  const [createEmailTemplate, { loading: creatingTemplateLoading }] = useMutation(CREATE_EMAIL_TEMPLATE, {
    onCompleted: (data) => {
      if (data.createEmailTemplate.success) {
        message.success(t('admin.contact.messages.templateCreated'));
        setCreatingTemplate(false);
        createTemplateForm.resetFields();
        refetchTemplates();
      } else {
        message.error(data.createEmailTemplate.errors?.join(', ') || t('admin.contact.messages.templateCreateFailed'));
      }
    },
    onError: (error) => {
      message.error(error.message || t('admin.contact.messages.templateCreateFailed'));
    }
  });

  // Delete email template mutation
  const [deleteEmailTemplate, { loading: deletingTemplate }] = useMutation(DELETE_EMAIL_TEMPLATE, {
    onCompleted: (data) => {
      if (data.deleteEmailTemplate.success) {
        message.success(t('admin.contact.messages.templateDeleted'));
        setSelectedTemplate(null);
        refetchTemplates();
      } else {
        message.error(data.deleteEmailTemplate.errors?.join(', ') || t('admin.contact.messages.templateDeleteFailed'));
      }
    },
    onError: (error) => {
      message.error(error.message || t('admin.contact.messages.templateDeleteFailed'));
    }
  });

  // Send thank you email mutation
  const [sendThankYouEmail, { loading: sendingEmail }] = useMutation(SEND_THANK_YOU_EMAIL, {
    onCompleted: (data) => {
      if (data.sendThankYouEmail.success) {
        message.success(t('admin.contact.messages.emailSent'));
        refetchContacts();
      } else {
        message.error(data.sendThankYouEmail.errors?.join(', ') || t('admin.contact.messages.emailSendFailed'));
      }
    },
    onError: (error) => {
      message.error(error.message || t('admin.contact.messages.emailSendFailed'));
    }
  });

  // Extract data from queries with memoization
  const contacts = useMemo(() =>
    contactsData?.contacts?.edges?.map(edge => edge.node) || [],
    [contactsData]
  );
  const emailTemplate = templateData?.emailTemplate;
  const emailTemplates = templatesData?.emailTemplates || [];

  // Real-time functionality - memoize stats calculation
  const realtimeStatsCalculated = useMemo(() => {
    if (contacts.length === 0) {
      return {
        newContactsToday: 0,
        pendingReply: 0,
        repliedToday: 0,
        totalContacts: 0
      };
    }

    const today = new Date().toDateString();
    const newToday = contacts.filter(contact =>
      new Date(contact.createdAt).toDateString() === today
    ).length;

    const pending = contacts.filter(contact =>
      contact.status === 'NEW' || contact.status === 'READ'
    ).length;

    const replied = contacts.filter(contact =>
      contact.status === 'RESPONDED' &&
      new Date(contact.updatedAt).toDateString() === today
    ).length;

    return {
      newContactsToday: newToday,
      pendingReply: pending,
      repliedToday: replied,
      totalContacts: contacts.length
    };
  }, [contacts]);

  useEffect(() => {
    setRealtimeStats(realtimeStatsCalculated);
  }, [realtimeStatsCalculated]);

  // Real-time notifications simulation
  useEffect(() => {
    if (!realtimeEnabled) return;

    const interval = setInterval(() => {
      // Simulate random notifications
      const notificationTypes = [
        {
          type: 'new_contact',
          title: t('admin.contact.realtime.stats.newToday'),
          message: 'New contact received from website'
        },
        {
          type: 'status_update',
          title: 'Status Updated',
          message: 'Contact status changed to responded'
        }
      ];

      const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      const newNotification = {
        ...randomNotification,
        timestamp: new Date().toISOString(),
        id: Date.now()
      };

      setRealtimeNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
    }, 30000); // Add notification every 30 seconds

    return () => clearInterval(interval);
  }, [realtimeEnabled, t]);

  const handleStatusChange = useCallback((contactId, newStatus) => {
    updateContactStatus({
      variables: { id: parseInt(contactId, 10), status: newStatus }
    });
  }, [updateContactStatus]);

  const handleSendThankYou = useCallback((contactId, templateId = null) => {
    sendThankYouEmail({
      variables: { contactId, templateId }
    });
  }, [sendThankYouEmail]);

  const handleViewContact = useCallback((contact) => {
    setSelectedContact(contact);
    setIsContactModalVisible(true);
  }, []);

  const handleUpdateTemplate = useCallback((values) => {
    const templateName = selectedTemplate?.name || 'default_thank_you';
    updateEmailTemplate({
      variables: {
        name: templateName,
        subject: values.subject,
        content: values.content
      }
    });
  }, [selectedTemplate?.name, updateEmailTemplate]);

  const handleCreateTemplate = useCallback((values) => {
    createEmailTemplate({
      variables: {
        name: values.name,
        subject: values.subject,
        content: values.content
      }
    });
  }, [createEmailTemplate]);

  const handleDeleteTemplate = useCallback((template) => {
    modal.confirm({
      title: t('admin.contact.actions.deleteTemplate'),
      content: t('admin.contact.messages.deleteTemplateConfirm', { name: template.name }),
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      okType: 'danger',
      onOk: () => {
        deleteEmailTemplate({
          variables: { id: template.id }
        });
      }
    });
  }, [t, deleteEmailTemplate, modal]);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'new': return 'blue';
      case 'in_progress': return 'orange';
      case 'resolved': return 'green';
      case 'closed': return 'gray';
      default: return 'default';
    }
  }, []);

  // Memoize columns to prevent infinite re-renders
  const contactColumns = useMemo(() => [
    {
      title: t('admin.contact.table.date'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
      sorter: true,
      width: 120
    },
    {
      title: t('admin.contact.table.name'),
      dataIndex: 'name',
      key: 'name',
      render: (name) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <Text strong>{name}</Text>
        </Space>
      )
    },
    {
      title: t('admin.contact.table.email'),
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <Space>
          <MailOutlined style={{ color: '#52c41a' }} />
          <Text copyable>{email}</Text>
        </Space>
      )
    },
    {
      title: t('admin.contact.table.phone'),
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone ? (
        <Space>
          <PhoneOutlined style={{ color: '#fa8c16' }} />
          <Text copyable>{phone}</Text>
        </Space>
      ) : '-'
    },
    {
      title: t('admin.contact.table.service'),
      dataIndex: 'requestService',
      key: 'requestService',
      render: (service) => (
        <Text ellipsis style={{ maxWidth: 150 }} title={service}>
          {service}
        </Text>
      )
    },
    {
      title: t('admin.contact.table.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select
          value={status}
          onChange={(newStatus) => handleStatusChange(record.id, newStatus)}
          loading={updatingStatus}
          style={{ width: 120 }}
        >
          <Option value="new">
            <Tag color={getStatusColor('new')}>{t('admin.contact.status.new')}</Tag>
          </Option>
          <Option value="in_progress">
            <Tag color={getStatusColor('in_progress')}>{t('admin.contact.status.read')}</Tag>
          </Option>
          <Option value="resolved">
            <Tag color={getStatusColor('resolved')}>{t('admin.contact.status.responded')}</Tag>
          </Option>
          <Option value="closed">
            <Tag color={getStatusColor('closed')}>{t('admin.contact.status.closed')}</Tag>
          </Option>
        </Select>
      )
    },
    {
      title: t('admin.contact.table.actions'),
      key: 'actions',
      render: (_, record) => {
        const emailTemplateMenu = {
          onClick: ({ key }) => handleSendThankYou(record.id, key),
          items: emailTemplates.map(template => ({
            key: template.id,
            label: `${template.name} - ${template.subject}`,
          })),
        };

        return (
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewContact(record)}
            >
              {t('admin.contact.actions.view')}
            </Button>
            <Dropdown menu={emailTemplateMenu} disabled={sendingEmail || emailTemplates.length === 0}>
              <Button
                type="default"
                size="small"
                icon={<SendOutlined />}
                loading={sendingEmail}
              >
                {t('admin.contact.actions.sendEmail')} <DownOutlined />
              </Button>
            </Dropdown>
          </Space>
        );
      }
    }
  ], [t, updatingStatus, sendingEmail, emailTemplates, handleStatusChange, handleViewContact, handleSendThankYou, getStatusColor]);

  if (contactsError) {
    return (
      <Alert
        message={t('admin.contact.messages.loadingError')}
        description={contactsError.message}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <Title level={2}>{t('admin.contact.title')}</Title>
          <Text type="secondary">{t('admin.contact.subtitle')}</Text>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title={t('admin.contact.table.title')} loading={contactsLoading}>
            <Table
              columns={contactColumns}
              dataSource={contacts}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} contacts`
              }}
            />
          </Card>
        </Col>

        <Col span={24}>
          <Card
            title={
              <Space>
                <span>{t('admin.contact.template.management')}</span>
                {emailTemplates.length > 0 && (
                  <Select
                    style={{ width: 200 }}
                    placeholder={t('admin.contact.template.selectTemplate')}
                    value={selectedTemplate?.id}
                    onChange={(value) => {
                      const template = emailTemplates.find(t => t.id === value);
                      setSelectedTemplate(template);
                      if (editingTemplate) {
                        templateForm.setFieldsValue({
                          subject: template?.subject || '',
                          content: template?.content || ''
                        });
                      }
                    }}
                  >
                    {emailTemplates.map(template => (
                      <Select.Option key={template.id} value={template.id}>
                        {template.name} - {template.subject}
                      </Select.Option>
                    ))}
                  </Select>
                )}
                {selectedTemplate && (
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteTemplate(selectedTemplate)}
                    loading={deletingTemplate}
                    title={t('admin.contact.actions.deleteTemplate')}
                  />
                )}
              </Space>
            }
            loading={templateLoading || templatesLoading}
            extra={
              <Space>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => setCreatingTemplate(true)}
                  disabled={creatingTemplate || editingTemplate}
                >
                  {t('admin.contact.actions.createTemplate')}
                </Button>
                <Button
                  type={editingTemplate ? "default" : "primary"}
                  icon={editingTemplate ? <SaveOutlined /> : <EditOutlined />}
                  onClick={() => {
                    if (editingTemplate) {
                      templateForm.submit();
                    } else {
                      if (!selectedTemplate && emailTemplates.length > 0) {
                        setSelectedTemplate(emailTemplates[0]);
                      }
                      setEditingTemplate(true);
                      const template = selectedTemplate || emailTemplates[0];
                      templateForm.setFieldsValue({
                        subject: template?.subject || '',
                        content: template?.content || ''
                      });
                    }
                  }}
                  loading={updatingTemplate}
                  disabled={!selectedTemplate && emailTemplates.length === 0}
                >
                  {editingTemplate ? t('admin.contact.actions.save') : t('admin.contact.actions.editTemplate')}
                </Button>
                {editingTemplate && (
                  <Button onClick={() => setEditingTemplate(false)}>
                    {t('admin.contact.actions.cancel')}
                  </Button>
                )}
              </Space>
            }
          >
            {creatingTemplate ? (
              <Form
                form={createTemplateForm}
                layout="vertical"
                onFinish={handleCreateTemplate}
                initialValues={{
                  name: '',
                  subject: '',
                  content: ''
                }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={t('admin.contact.template.name')}
                      name="name"
                      rules={[
                        { required: true, message: t('admin.contact.template.nameRequired') },
                        { min: 3, message: t('admin.contact.template.nameMinLength') },
                        { max: 50, message: t('admin.contact.template.nameMaxLength') }
                      ]}
                    >
                      <Input
                        placeholder={t('admin.contact.template.namePlaceholder')}
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={t('admin.contact.form.emailSubject')}
                      name="subject"
                      rules={[{ required: true, message: t('admin.contact.form.emailSubjectRequired') }]}
                    >
                      <Input
                        placeholder="Thank you for contacting us"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label={t('admin.contact.form.emailContent')}
                      name="content"
                      rules={[{ required: true, message: t('admin.contact.form.emailContentRequired') }]}
                    >
                      <FormHTMLEditor
                        rows={15}
                        placeholder={t('admin.contact.form.emailContentPlaceholder')}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={creatingTemplateLoading}
                      size="large"
                      icon={<SaveOutlined />}
                    >
                      {t('admin.contact.actions.createTemplate')}
                    </Button>
                    <Button
                      onClick={() => {
                        setCreatingTemplate(false);
                        createTemplateForm.resetFields();
                      }}
                      size="large"
                    >
                      {t('admin.contact.actions.cancel')}
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            ) : editingTemplate ? (
              <Form
                form={templateForm}
                layout="vertical"
                onFinish={handleUpdateTemplate}
                initialValues={{
                  subject: selectedTemplate?.subject || '',
                  content: selectedTemplate?.content || ''
                }}
              >
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label={t('admin.contact.form.emailSubject')}
                      name="subject"
                      rules={[{ required: true, message: t('admin.contact.form.emailSubjectRequired') }]}
                    >
                      <Input
                        placeholder="Thank you for contacting us"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label={t('admin.contact.form.emailContent')}
                      name="content"
                      rules={[{ required: true, message: t('admin.contact.form.emailContentRequired') }]}
                    >
                      <FormHTMLEditor
                        rows={15}
                        placeholder={t('admin.contact.form.emailContentPlaceholder')}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Card size="small" title={t('admin.contact.template.availableVariables')} style={{ marginBottom: '16px' }}>
                      <Space wrap>
                        <Tag>{'{{ name }}'}</Tag>
                        <Tag>{'{{ email }}'}</Tag>
                        <Tag>{'{{ phone }}'}</Tag>
                        <Tag>{'{{ request_service }}'}</Tag>
                        <Tag>{'{{ request_content }}'}</Tag>
                        <Tag>{'{{ company_name }}'}</Tag>
                      </Space>
                      <div style={{ marginTop: '8px' }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {t('admin.contact.template.variablesDescription')}
                        </Text>
                      </div>
                    </Card>
                  </Col>
                </Row>

                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={updatingTemplate}
                      size="large"
                      icon={<SaveOutlined />}
                    >
                      {t('admin.contact.actions.saveTemplate')}
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingTemplate(false);
                        templateForm.resetFields();
                      }}
                      size="large"
                    >
                      {t('admin.contact.actions.cancel')}
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            ) : (
              <div>
                {selectedTemplate ? (
                  <>
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <div>
                          <Text strong>Template: </Text>
                          <Text>{selectedTemplate.name}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div>
                          <Text strong>Last Updated: </Text>
                          <Text type="secondary">{new Date(selectedTemplate.updatedAt).toLocaleString()}</Text>
                        </div>
                      </Col>
                      <Col span={24}>
                        <div>
                          <Text strong>{t('admin.contact.details.subject')}: </Text>
                          <Text style={{ fontSize: '16px' }}>{selectedTemplate.subject}</Text>
                        </div>
                      </Col>
                      <Col span={24}>
                        <div>
                          <Text strong>{t('admin.contact.details.contentPreview')}: </Text>
                          <div style={{
                            background: '#f9f9f9',
                            padding: '20px',
                            borderRadius: '6px',
                            marginTop: '8px',
                            border: '1px solid #e0e0e0'
                          }}>
                            <div style={{
                              backgroundColor: 'white',
                              padding: '20px',
                              borderRadius: '6px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              maxHeight: '400px',
                              overflow: 'auto'
                            }}>
                              <div dangerouslySetInnerHTML={{ __html: selectedTemplate.content }} />
                            </div>
                          </div>
                        </div>
                      </Col>
                      <Col span={24}>
                        <div>
                          <Text strong>Raw HTML: </Text>
                          <details style={{ marginTop: '8px' }}>
                            <summary style={{ cursor: 'pointer', color: '#1890ff' }}>
                              {t('admin.contact.actions.viewHtmlSource')}
                            </summary>
                            <div style={{
                              whiteSpace: 'pre-wrap',
                              background: '#f5f5f5',
                              padding: '12px',
                              borderRadius: '6px',
                              marginTop: '8px',
                              maxHeight: '200px',
                              overflow: 'auto',
                              fontFamily: 'monospace',
                              fontSize: '12px',
                              border: '1px solid #e0e0e0'
                            }}>
                              {selectedTemplate.content}
                            </div>
                          </details>
                        </div>
                      </Col>
                    </Row>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Text type="secondary" style={{ fontSize: '16px' }}>
                      {emailTemplates.length === 0 ? t('admin.contact.messages.noTemplates') : t('admin.contact.messages.selectTemplate')}
                    </Text>
                  </div>
                )}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Real-time Notifications Panel */}
      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col span={24}>
          <Collapse
            size="large"
            items={[
              {
                key: 'realtime',
                label: (
                  <Space>
                    <BellOutlined />
                    <span>{t('admin.contact.realtime.title')}</span>
                    <Badge count={realtimeStats.newContactsToday} showZero color="#52c41a" />
                  </Space>
                ),
                children: (
                  <div className="realtime-dashboard">
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12} md={6}>
                        <Statistic
                          title={t('admin.contact.realtime.stats.newToday')}
                          value={realtimeStats.newContactsToday}
                          prefix={<UserAddOutlined />}
                          valueStyle={{ color: '#3f8600' }}
                        />
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Statistic
                          title={t('admin.contact.realtime.stats.pendingReply')}
                          value={realtimeStats.pendingReply}
                          prefix={<ClockCircleOutlined />}
                          valueStyle={{ color: '#cf1322' }}
                        />
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Statistic
                          title={t('admin.contact.realtime.stats.repliedToday')}
                          value={realtimeStats.repliedToday}
                          prefix={<CheckCircleOutlined />}
                          valueStyle={{ color: '#1890ff' }}
                        />
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Statistic
                          title={t('admin.contact.realtime.stats.totalContacts')}
                          value={realtimeStats.totalContacts}
                          prefix={<ContactsOutlined />}
                        />
                      </Col>
                    </Row>

                    <div style={{ marginTop: '20px' }}>
                      <Space>
                        <Switch
                          checked={realtimeEnabled}
                          onChange={setRealtimeEnabled}
                          checkedChildren={t('admin.contact.realtime.enabled')}
                          unCheckedChildren={t('admin.contact.realtime.disabled')}
                        />
                        <Typography.Text type="secondary">
                          {realtimeEnabled ? t('admin.contact.realtime.status.connected') : t('admin.contact.realtime.status.disconnected')}
                        </Typography.Text>
                        {realtimeEnabled && (
                          <Badge status="processing" text={t('admin.contact.realtime.status.live')} />
                        )}
                      </Space>
                    </div>

                    {realtimeNotifications.length > 0 && (
                      <div style={{ marginTop: '20px' }}>
                        <Typography.Text strong>{t('admin.contact.realtime.recentNotifications')}</Typography.Text>
                        <List
                          size="small"
                          dataSource={realtimeNotifications.slice(0, 5)}
                          renderItem={(notification, index) => (
                            <List.Item key={index}>
                              <List.Item.Meta
                                avatar={
                                  <Avatar icon={
                                    notification.type === 'new_contact' ? <UserAddOutlined /> :
                                      notification.type === 'status_update' ? <SyncOutlined /> :
                                        <BellOutlined />
                                  } />
                                }
                                title={notification.title}
                                description={
                                  <Space>
                                    <Typography.Text type="secondary">{notification.message}</Typography.Text>
                                    <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                                      {new Date(notification.timestamp).toLocaleTimeString()}
                                    </Typography.Text>
                                  </Space>
                                }
                              />
                            </List.Item>
                          )}
                        />
                      </div>
                    )}
                  </div>
                )
              }
            ]}
          />
        </Col>
      </Row>

      {/* Contact Details Modal */}
      <Modal
        title={t('admin.contact.modals.contactDetails')}
        open={isContactModalVisible}
        onCancel={() => {
          setIsContactModalVisible(false);
          setSelectedContact(null);
        }}
        footer={[
          <Button key="close" onClick={() => setIsContactModalVisible(false)}>
            {t('admin.contact.actions.close')}
          </Button>,
          <Dropdown
            key="send"
            menu={{
              onClick: ({ key }) => {
                handleSendThankYou(selectedContact.id, key);
                setIsContactModalVisible(false);
              },
              items: emailTemplates.map(template => ({
                key: template.id,
                label: `${t('admin.contact.actions.send')}: ${template.subject}`,
              })),
            }}
            disabled={sendingEmail || emailTemplates.length === 0}
          >
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={sendingEmail}
            >
              Send Email <DownOutlined />
            </Button>
          </Dropdown>
        ]}
        width={700}
      >
        {selectedContact && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Name:</Text><br />
                <Text>{selectedContact.name}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Email:</Text><br />
                <Text copyable>{selectedContact.email}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Phone:</Text><br />
                <Text copyable>{selectedContact.phone || 'Not provided'}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Date:</Text><br />
                <Text>{formatDate(selectedContact.createdAt)}</Text>
              </Col>
              <Col span={24}>
                <Text strong>Service:</Text><br />
                <Text>{selectedContact.requestService}</Text>
              </Col>
              <Col span={24}>
                <Text strong>Message:</Text><br />
                <div style={{
                  whiteSpace: 'pre-wrap',
                  background: '#f9f9f9',
                  padding: '12px',
                  borderRadius: '6px',
                  marginTop: '8px'
                }}>
                  {selectedContact.requestContent}
                </div>
              </Col>
              <Col span={24}>
                <Text strong>Status:</Text><br />
                <Tag color={getStatusColor(selectedContact.status)}>
                  {selectedContact.status}
                </Tag>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Contact;

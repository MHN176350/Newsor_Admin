import React, { useState } from 'react';
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
  Menu
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
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  LinkOutlined,
  OrderedListOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';
import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_CONTACTS, 
  UPDATE_CONTACT_STATUS,
  GET_EMAIL_TEMPLATE,
  GET_EMAIL_TEMPLATES,
  UPDATE_EMAIL_TEMPLATE,
  SEND_THANK_YOU_EMAIL
} from '../graphql/queries';
import { formatDate } from '../utils/helpers';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

// Enhanced HTML Editor Component
const HTMLEditor = ({ value, onChange, placeholder, rows = 12 }) => {
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
            overlay={
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
  const [selectedContact, setSelectedContact] = useState(null);
  const [isContactModalVisible, setIsContactModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
  const [templateForm] = Form.useForm();

  // Fetch contacts
  const { data: contactsData, loading: contactsLoading, error: contactsError, refetch: refetchContacts } = useQuery(GET_CONTACTS, {
    variables: { first: 50 }
  });

  // Fetch all email templates
  const { data: templatesData, loading: templatesLoading, refetch: refetchTemplates } = useQuery(GET_EMAIL_TEMPLATES);

  // Fetch specific email template
  const { data: templateData, loading: templateLoading, refetch: refetchTemplate } = useQuery(GET_EMAIL_TEMPLATE, {
    variables: { name: 'default_thank_you' },
    skip: !editingTemplate
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

  const contacts = contactsData?.contacts?.edges?.map(edge => edge.node) || [];
  const emailTemplate = templateData?.emailTemplate;
  const emailTemplates = templatesData?.emailTemplates || [];

  const handleStatusChange = (contactId, newStatus) => {
    updateContactStatus({
      variables: { id: contactId, status: newStatus }
    });
  };

  const handleSendThankYou = (contactId, templateId = null) => {
    sendThankYouEmail({
      variables: { contactId, templateId }
    });
  };

  const handleViewContact = (contact) => {
    setSelectedContact(contact);
    setIsContactModalVisible(true);
  };

  const handleUpdateTemplate = (values) => {
    const templateName = selectedTemplate?.name || 'default_thank_you';
    updateEmailTemplate({
      variables: {
        name: templateName,
        subject: values.subject,
        content: values.content
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW': return 'blue';
      case 'READ': return 'orange';
      case 'RESPONDED': return 'green';
      case 'CLOSED': return 'gray';
      default: return 'default';
    }
  };

  const contactColumns = [
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
          <Option value="NEW">
            <Tag color={getStatusColor('NEW')}>{t('admin.contact.status.new')}</Tag>
          </Option>
          <Option value="READ">
            <Tag color={getStatusColor('READ')}>{t('admin.contact.status.read')}</Tag>
          </Option>
          <Option value="RESPONDED">
            <Tag color={getStatusColor('RESPONDED')}>{t('admin.contact.status.responded')}</Tag>
          </Option>
          <Option value="CLOSED">
            <Tag color={getStatusColor('CLOSED')}>{t('admin.contact.status.closed')}</Tag>
          </Option>
        </Select>
      )
    },
    {
      title: t('admin.contact.table.actions'),
      key: 'actions',
      render: (_, record) => {
        const emailTemplateMenu = (
          <Menu onClick={({ key }) => handleSendThankYou(record.id, key)}>
            {emailTemplates.map(template => (
              <Menu.Item key={template.id}>
                {template.name} - {template.subject}
              </Menu.Item>
            ))}
          </Menu>
        );

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
            <Dropdown overlay={emailTemplateMenu} disabled={sendingEmail || emailTemplates.length === 0}>
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
  ];

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
          <Card title="Contact Messages" loading={contactsLoading}>
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
                <span>Email Templates Management</span>
                {emailTemplates.length > 0 && (
                  <Select
                    style={{ width: 200 }}
                    placeholder="Select template"
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
              </Space>
            }
            loading={templateLoading || templatesLoading}
            extra={
              <Space>
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
                  {editingTemplate ? 'Save Template' : 'Edit Template'}
                </Button>
                {editingTemplate && (
                  <Button onClick={() => setEditingTemplate(false)}>
                    Cancel
                  </Button>
                )}
              </Space>
            }
          >
            {editingTemplate ? (
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
                      label={
                        <Space>
                          <span>Email Content (HTML)</span>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Use the toolbar to format text and insert variables
                          </Text>
                        </Space>
                      }
                      name="content"
                      rules={[{ required: true, message: 'Please enter email content' }]}
                    >
                      <FormHTMLEditor
                        rows={15}
                        placeholder="Enter HTML email template content... Use the 'Template' button to insert a basic structure."
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Card size="small" title="Available Variables" style={{ marginBottom: '16px' }}>
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
                          These variables will be automatically replaced with actual contact data when sending emails.
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
                      Save Template
                    </Button>
                    <Button 
                      onClick={() => {
                        setEditingTemplate(false);
                        templateForm.resetFields();
                      }}
                      size="large"
                    >
                      Cancel
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
            overlay={
              <Menu onClick={({ key }) => {
                handleSendThankYou(selectedContact.id, key);
                setIsContactModalVisible(false);
              }}>
                {emailTemplates.map(template => (
                  <Menu.Item key={template.id}>
                    {t('admin.contact.actions.send')}: {template.subject}
                  </Menu.Item>
                ))}
              </Menu>
            }
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

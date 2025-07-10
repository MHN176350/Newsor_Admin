import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Tabs, Space, Typography, Divider, Badge, App } from 'antd';
import { SaveOutlined, ReloadOutlined, ApiOutlined } from '@ant-design/icons';
import { textConfigService } from '../services/textConfigServiceApi';

const { TextArea } = Input;
const { Title, Text } = Typography;

const Settings = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [texts, setTexts] = useState({});
  const [apiStatus, setApiStatus] = useState('checking');

  // Load saved texts from service on component mount
  useEffect(() => {
    const loadTexts = async () => {
      try {
        // Check API health
        const apiHealthy = await textConfigService.checkApiHealth();
        setApiStatus(apiHealthy ? 'connected' : 'disconnected');
        
        // Load texts
        const savedTexts = await textConfigService.getTexts();
        setTexts(savedTexts);
        form.setFieldsValue(savedTexts);
      } catch (error) {
        setApiStatus('error');
      }
    };

    loadTexts();
  }, [form]);

  const handleSave = async (values) => {
    setLoading(true);
    try {
      // Save using the API service
      const success = await textConfigService.saveTexts(values);
      if (success) {
        setTexts(values);
        
        message.success('Text content updated successfully!');
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      message.error('Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      const success = await textConfigService.resetTexts();
      if (success) {
        const defaultTexts = textConfigService.defaultTexts;
        form.setFieldsValue(defaultTexts);
        setTexts(defaultTexts);
        message.success('Text content reset to defaults!');
      } else {
        throw new Error('Failed to reset configuration');
      }
    } catch (error) {
      message.error('Failed to reset. Please try again.');
    }
  };

  const tabItems = [
    {
      key: '1',
      label: 'Company Info',
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Title level={4}>Hero Section</Title>
            <Form.Item label="Page Slogan" name="pageSlogan">
              <Input placeholder="Main headline on the homepage" />
            </Form.Item>
            <Form.Item label="Page Description" name="pageShortDescription">
              <TextArea rows={3} placeholder="Short description under the main headline" />
            </Form.Item>
          </div>

          <Divider />

          <div>
            <Title level={4}>About Section</Title>
            <Form.Item label="Company Name" name="companyName">
              <Input placeholder="Company name" />
            </Form.Item>
            <Form.Item label="Description 1" name="companyShortDescription1">
              <TextArea rows={2} placeholder="First company description paragraph" />
            </Form.Item>
            <Form.Item label="Description 2" name="companyShortDescription2">
              <TextArea rows={3} placeholder="Second company description paragraph" />
            </Form.Item>
            <Form.Item label="Slogan Description" name="companySloganDescription">
              <TextArea rows={4} placeholder="Company slogan and partnership description" />
            </Form.Item>
          </div>
        </Space>
      ),
    },
    {
      key: '2',
      label: 'Vision & Mission',
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Title level={4}>Vision</Title>
            <Form.Item label="Vision Statement 1" name="companyVision1">
              <TextArea rows={2} placeholder="First vision statement" />
            </Form.Item>
            <Form.Item label="Vision Statement 2" name="companyVision2">
              <TextArea rows={2} placeholder="Second vision statement" />
            </Form.Item>
          </div>

          <Divider />

          <div>
            <Title level={4}>Mission</Title>
            <Form.Item label="Mission Statement 1" name="companyMission1">
              <TextArea rows={2} placeholder="First mission statement" />
            </Form.Item>
            <Form.Item label="Mission Statement 2" name="companyMission2">
              <TextArea rows={2} placeholder="Second mission statement" />
            </Form.Item>
          </div>
        </Space>
      ),
    },
    {
      key: '3',
      label: 'Company Values',
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="medium">
          <Title level={4}>Core Values</Title>
          <Form.Item label="Value 1 (Collaboration)" name="companyValue1">
            <TextArea rows={2} placeholder="Collaboration value description" />
          </Form.Item>
          <Form.Item label="Value 2 (Innovation)" name="companyValue2">
            <TextArea rows={2} placeholder="Innovation value description" />
          </Form.Item>
          <Form.Item label="Value 3 (Excellence)" name="companyValue3">
            <TextArea rows={2} placeholder="Excellence value description" />
          </Form.Item>
          <Form.Item label="Value 4 (Integrity)" name="companyValue4">
            <TextArea rows={2} placeholder="Integrity value description" />
          </Form.Item>
          <Form.Item label="Value 5 (Customer Success)" name="companyValue5">
            <TextArea rows={2} placeholder="Customer Success value description" />
          </Form.Item>
        </Space>
      ),
    },
    {
      key: '4',
      label: 'Services',
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Title level={4}>Service Names</Title>
            <Form.Item label="Service 1 Name" name="serviceName1">
              <Input placeholder="Database Services" />
            </Form.Item>
            <Form.Item label="Service 2 Name" name="serviceName2">
              <Input placeholder="Application Development" />
            </Form.Item>
            <Form.Item label="Service 3 Name" name="serviceName3">
              <Input placeholder="System Integration" />
            </Form.Item>
          </div>

          <Divider />

          <div>
            <Title level={4}>Database Services (Service 1)</Title>
            {Array.from({ length: 12 }, (_, i) => (
              <Form.Item key={i} label={`Description ${i + 1}`} name={`service1Desc${i + 1}`}>
                <Input placeholder={`Database service description ${i + 1}`} />
              </Form.Item>
            ))}
          </div>

          <Divider />

          <div>
            <Title level={4}>Application Development (Service 2)</Title>
            {Array.from({ length: 13 }, (_, i) => (
              <Form.Item key={i} label={`Description ${i + 1}`} name={`service2Desc${i + 1}`}>
                <Input placeholder={`Application development description ${i + 1}`} />
              </Form.Item>
            ))}
          </div>

          <Divider />

          <div>
            <Title level={4}>System Integration (Service 3)</Title>
            {Array.from({ length: 13 }, (_, i) => (
              <Form.Item key={i} label={`Description ${i + 1}`} name={`service3Desc${i + 1}`}>
                <Input placeholder={`System integration description ${i + 1}`} />
              </Form.Item>
            ))}
          </div>
        </Space>
      ),
    },
    {
      key: '5',
      label: 'Contact Info',
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Title level={4}>Contact Information</Title>
          <Form.Item label="Headquarters Address" name="headquartersAddress">
            <TextArea rows={2} placeholder="Company headquarters address" />
          </Form.Item>
          <Form.Item label="Hotline Number" name="hotlineNumber">
            <Input placeholder="Company hotline phone number" />
          </Form.Item>
          <Form.Item label="Support Email" name="supportEmail">
            <Input placeholder="Company support email address" />
          </Form.Item>
          <Form.Item label="Working Hours (Monday-Friday)" name="workingHoursAM">
            <Input placeholder="Monday - Friday working hours" />
          </Form.Item>
          <Form.Item label="Working Hours (Saturday)" name="workingHoursPM">
            <Input placeholder="Saturday working hours" />
          </Form.Item>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>
        EvoluSoft Homepage Text Management
        <Badge 
          style={{ marginLeft: 16 }}
          status={apiStatus === 'connected' ? 'success' : apiStatus === 'disconnected' ? 'warning' : 'error'}
          text={
            <span style={{ fontSize: '14px' }}>
              <ApiOutlined style={{ marginRight: 4 }} />
              {apiStatus === 'connected' ? 'API Connected' : 
               apiStatus === 'disconnected' ? 'API Offline (Using localStorage)' : 
               'API Error'}
            </span>
          }
        />
      </Title>
      <Text type="secondary">
        Configure and customize all text content displayed on the EvoluSoft homepage
      </Text>
      
      <Card style={{ marginTop: 16 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={texts}
        >
          <Tabs
            defaultActiveKey="1"
            items={tabItems}
            tabPosition="top"
            size="large"
          />
          
          <Divider />
          
          <Space>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />}
              loading={loading}
              size="large"
            >
              Save Changes
            </Button>
            <Button 
              onClick={handleReset}
              icon={<ReloadOutlined />}
              size="large"
            >
              Reset to Defaults
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;

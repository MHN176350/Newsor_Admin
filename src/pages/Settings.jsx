import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Tabs, Space, Typography, Divider, Badge, App } from 'antd';
import { SaveOutlined, ReloadOutlined, ApiOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { textConfigService } from '../api/textConfigServiceApi';

const { TextArea } = Input;
const { Title, Text } = Typography;

const Settings = () => {
  const { message } = App.useApp();
  const { t } = useTranslation();
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
        
        message.success(t('settings.messages.textUpdateSuccess'));
      } else {
        throw new Error(t('settings.messages.configSaveError'));
      }
    } catch (error) {
      message.error(t('settings.messages.textUpdateError'));
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
        message.success(t('settings.messages.textResetSuccess'));
      } else {
        throw new Error(t('settings.messages.configResetError'));
      }
    } catch (error) {
      message.error(t('settings.messages.textResetError'));
    }
  };

  const getApiStatusText = () => {
    switch (apiStatus) {
      case 'connected':
        return t('settings.evolusoft.apiStatus.connected');
      case 'disconnected':
        return t('settings.evolusoft.apiStatus.disconnected');
      case 'error':
        return t('settings.evolusoft.apiStatus.error');
      default:
        return t('settings.evolusoft.apiStatus.checking');
    }
  };

  const tabItems = [
    {
      key: '1',
      label: t('settings.evolusoft.tabs.companyInfo'),
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Title level={4}>{t('settings.evolusoft.sections.heroSection')}</Title>
            <Form.Item label={t('settings.evolusoft.fields.pageSlogan')} name="pageSlogan">
              <Input placeholder={t('settings.evolusoft.fields.pageSloganPlaceholder')} />
            </Form.Item>
            <Form.Item label={t('settings.evolusoft.fields.pageDescription')} name="pageShortDescription">
              <TextArea rows={3} placeholder={t('settings.evolusoft.fields.pageDescriptionPlaceholder')} />
            </Form.Item>
          </div>

          <Divider />

          <div>
            <Title level={4}>{t('settings.evolusoft.sections.aboutSection')}</Title>
            <Form.Item label={t('settings.evolusoft.fields.companyName')} name="companyName">
              <Input placeholder={t('settings.evolusoft.fields.companyNamePlaceholder')} />
            </Form.Item>
            <Form.Item label={t('settings.evolusoft.fields.description1')} name="companyShortDescription1">
              <TextArea rows={2} placeholder={t('settings.evolusoft.fields.description1Placeholder')} />
            </Form.Item>
            <Form.Item label={t('settings.evolusoft.fields.description2')} name="companyShortDescription2">
              <TextArea rows={3} placeholder={t('settings.evolusoft.fields.description2Placeholder')} />
            </Form.Item>
            <Form.Item label={t('settings.evolusoft.fields.sloganDescription')} name="companySloganDescription">
              <TextArea rows={4} placeholder={t('settings.evolusoft.fields.sloganDescriptionPlaceholder')} />
            </Form.Item>
          </div>
        </Space>
      ),
    },
    {
      key: '2',
      label: t('settings.evolusoft.tabs.visionMission'),
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Title level={4}>{t('settings.evolusoft.sections.vision')}</Title>
            <Form.Item label={t('settings.evolusoft.fields.visionStatement1')} name="companyVision1">
              <TextArea rows={2} placeholder={t('settings.evolusoft.fields.visionStatement1Placeholder')} />
            </Form.Item>
            <Form.Item label={t('settings.evolusoft.fields.visionStatement2')} name="companyVision2">
              <TextArea rows={2} placeholder={t('settings.evolusoft.fields.visionStatement2Placeholder')} />
            </Form.Item>
          </div>

          <Divider />

          <div>
            <Title level={4}>{t('settings.evolusoft.sections.mission')}</Title>
            <Form.Item label={t('settings.evolusoft.fields.missionStatement1')} name="companyMission1">
              <TextArea rows={2} placeholder={t('settings.evolusoft.fields.missionStatement1Placeholder')} />
            </Form.Item>
            <Form.Item label={t('settings.evolusoft.fields.missionStatement2')} name="companyMission2">
              <TextArea rows={2} placeholder={t('settings.evolusoft.fields.missionStatement2Placeholder')} />
            </Form.Item>
          </div>
        </Space>
      ),
    },
    {
      key: '3',
      label: t('settings.evolusoft.tabs.companyValues'),
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="medium">
          <Title level={4}>{t('settings.evolusoft.sections.coreValues')}</Title>
          <Form.Item label={t('settings.evolusoft.fields.value1')} name="companyValue1">
            <TextArea rows={2} placeholder={t('settings.evolusoft.fields.value1Placeholder')} />
          </Form.Item>
          <Form.Item label={t('settings.evolusoft.fields.value2')} name="companyValue2">
            <TextArea rows={2} placeholder={t('settings.evolusoft.fields.value2Placeholder')} />
          </Form.Item>
          <Form.Item label={t('settings.evolusoft.fields.value3')} name="companyValue3">
            <TextArea rows={2} placeholder={t('settings.evolusoft.fields.value3Placeholder')} />
          </Form.Item>
          <Form.Item label={t('settings.evolusoft.fields.value4')} name="companyValue4">
            <TextArea rows={2} placeholder={t('settings.evolusoft.fields.value4Placeholder')} />
          </Form.Item>
          <Form.Item label={t('settings.evolusoft.fields.value5')} name="companyValue5">
            <TextArea rows={2} placeholder={t('settings.evolusoft.fields.value5Placeholder')} />
          </Form.Item>
        </Space>
      ),
    },
    {
      key: '4',
      label: t('settings.evolusoft.tabs.services'),
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Title level={4}>{t('settings.evolusoft.sections.serviceNames')}</Title>
            <Form.Item label={t('settings.evolusoft.fields.serviceName1')} name="serviceName1">
              <Input placeholder={t('settings.evolusoft.fields.serviceName1Placeholder')} />
            </Form.Item>
            <Form.Item label={t('settings.evolusoft.fields.serviceName2')} name="serviceName2">
              <Input placeholder={t('settings.evolusoft.fields.serviceName2Placeholder')} />
            </Form.Item>
            <Form.Item label={t('settings.evolusoft.fields.serviceName3')} name="serviceName3">
              <Input placeholder={t('settings.evolusoft.fields.serviceName3Placeholder')} />
            </Form.Item>
          </div>

          <Divider />

          <div>
            <Title level={4}>{t('settings.evolusoft.sections.databaseServices')}</Title>
            {Array.from({ length: 12 }, (_, i) => (
              <Form.Item key={i} label={t('settings.evolusoft.fields.serviceDescription', { number: i + 1 })} name={`service1Desc${i + 1}`}>
                <Input placeholder={t('settings.evolusoft.fields.databaseServicePlaceholder', { number: i + 1 })} />
              </Form.Item>
            ))}
          </div>

          <Divider />

          <div>
            <Title level={4}>{t('settings.evolusoft.sections.applicationDevelopment')}</Title>
            {Array.from({ length: 13 }, (_, i) => (
              <Form.Item key={i} label={t('settings.evolusoft.fields.serviceDescription', { number: i + 1 })} name={`service2Desc${i + 1}`}>
                <Input placeholder={t('settings.evolusoft.fields.applicationDevPlaceholder', { number: i + 1 })} />
              </Form.Item>
            ))}
          </div>

          <Divider />

          <div>
            <Title level={4}>{t('settings.evolusoft.sections.systemIntegration')}</Title>
            {Array.from({ length: 13 }, (_, i) => (
              <Form.Item key={i} label={t('settings.evolusoft.fields.serviceDescription', { number: i + 1 })} name={`service3Desc${i + 1}`}>
                <Input placeholder={t('settings.evolusoft.fields.systemIntegrationPlaceholder', { number: i + 1 })} />
              </Form.Item>
            ))}
          </div>
        </Space>
      ),
    },
    {
      key: '5',
      label: t('settings.evolusoft.tabs.contactInfo'),
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Title level={4}>{t('settings.evolusoft.sections.contactInformation')}</Title>
          <Form.Item label={t('settings.evolusoft.fields.contactAddress')} name="contactAddress">
            <TextArea rows={2} placeholder={t('settings.evolusoft.fields.contactAddressPlaceholder')} />
          </Form.Item>
          <Form.Item label={t('settings.evolusoft.fields.contactPhone')} name="contactPhone">
            <Input placeholder={t('settings.evolusoft.fields.contactPhonePlaceholder')} />
          </Form.Item>
          <Form.Item label={t('settings.evolusoft.fields.contactEmail')} name="contactEmail">
            <Input placeholder={t('settings.evolusoft.fields.contactEmailPlaceholder')} />
          </Form.Item>
          <Form.Item label={t('settings.evolusoft.fields.workingHoursWeekday')} name="workingHoursWeekday">
            <Input placeholder={t('settings.evolusoft.fields.workingHoursWeekdayPlaceholder')} />
          </Form.Item>
          <Form.Item label={t('settings.evolusoft.fields.workingHoursWeekend')} name="workingHoursWeekend">
            <Input placeholder={t('settings.evolusoft.fields.workingHoursWeekendPlaceholder')} />
          </Form.Item>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>
        {t('settings.evolusoft.title')}
        <Badge 
          style={{ marginLeft: 16 }}
          status={apiStatus === 'connected' ? 'success' : apiStatus === 'disconnected' ? 'warning' : 'error'}
          text={
            <span style={{ fontSize: '14px' }}>
              <ApiOutlined style={{ marginRight: 4 }} />
              {getApiStatusText()}
            </span>
          }
        />
      </Title>
      <Text type="secondary">
        {t('settings.evolusoft.subtitle')}
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
              {t('settings.evolusoft.actions.saveChanges')}
            </Button>
            <Button 
              onClick={handleReset}
              icon={<ReloadOutlined />}
              size="large"
            >
              {t('settings.evolusoft.actions.resetToDefaults')}
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;

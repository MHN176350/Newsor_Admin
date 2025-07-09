import React from 'react';
import { Card, Typography, Divider, Tabs } from 'antd';
import { SettingOutlined, InfoCircleOutlined, HomeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import HomepageSectionManager from '../components/HomepageSectionManager';

const { Title, Text } = Typography;

const Settings = () => {
  const { t } = useTranslation();

  const tabItems = [
    {
      key: '1',
      label: (
        <span>
          <HomeOutlined />
          Homepage Sections
        </span>
      ),
      children: <HomepageSectionManager />
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <SettingOutlined />
          {t('navigation.settings', 'System Settings')}
        </Title>
        <Text type="secondary">
          {t('admin.settingsDescription', 'Configure system settings and homepage content')}
        </Text>
      </div>
      
      <Card>
        <Tabs 
          defaultActiveKey="1" 
          items={tabItems}
          size="large"
        />
      </Card>
    </div>
  );
};

export default Settings;

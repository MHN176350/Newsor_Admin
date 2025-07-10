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
  Popconfirm,
  Tag,
  Switch
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  TagOutlined 
} from '@ant-design/icons';
import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_ADMIN_TAGS, 
  CREATE_TAG, 
  UPDATE_TAG, 
  DELETE_TAG,
  TOGGLE_TAG 
} from '../graphql/queries';
import { formatDate } from '../utils/helpers';

const Tags = () => {
  const { t } = useTranslation();
  const [selectedTag, setSelectedTag] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' or 'edit'
  const [form] = Form.useForm();

  // Fetch tags
  const { data, loading, error, refetch } = useQuery(GET_ADMIN_TAGS);

  // Create tag mutation
  const [createTag, { loading: creating }] = useMutation(CREATE_TAG, {
    onCompleted: (data) => {
      if (data.createTag.success) {
        message.success(t('pages.tags.createSuccess'));
        setIsModalVisible(false);
        form.resetFields();
        refetch();
      } else {
        message.error(data.createTag.errors?.join(', ') || t('pages.tags.createFailed'));
      }
    },
    onError: (error) => {
      message.error(t('pages.tags.createError', { error: error.message }));
    }
  });

  // Update tag mutation
  const [updateTag, { loading: updating }] = useMutation(UPDATE_TAG, {
    onCompleted: (data) => {
      if (data.updateTag.success) {
        message.success(t('pages.tags.updateSuccess'));
        setIsModalVisible(false);
        setSelectedTag(null);
        form.resetFields();
        refetch();
      } else {
        message.error(data.updateTag.errors?.join(', ') || t('pages.tags.updateFailed'));
      }
    },
    onError: (error) => {
      message.error(t('pages.tags.updateError', { error: error.message }));
    }
  });

  // Delete tag mutation
  const [deleteTag, { loading: deleting }] = useMutation(DELETE_TAG, {
    onCompleted: (data) => {
      if (data.deleteTag.success) {
        message.success(t('pages.tags.deleteSuccess'));
        refetch();
      } else {
        message.error(data.deleteTag.errors?.join(', ') || t('pages.tags.deleteFailed'));
      }
    },
    onError: (error) => {
      message.error(t('pages.tags.deleteError', { error: error.message }));
    }
  });

  // Toggle tag mutation
  const [toggleTag, { loading: toggling }] = useMutation(TOGGLE_TAG, {
    onCompleted: (data) => {
      if (data.toggleTag.success) {
        message.success(t('pages.tags.toggleSuccess'));
        refetch();
      } else {
        message.error(data.toggleTag.errors?.join(', ') || t('pages.tags.toggleFailed'));
      }
    },
    onError: (error) => {
      message.error(t('pages.tags.toggleError', { error: error.message }));
    }
  });

  const tags = data?.adminTags || [];

  const handleCreate = () => {
    setModalType('create');
    setSelectedTag(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (tag) => {
    setModalType('edit');
    setSelectedTag(tag);
    form.setFieldsValue({
      name: tag.name
    });
    setIsModalVisible(true);
  };

  const handleSubmit = (values) => {
    if (modalType === 'create') {
      createTag({
        variables: {
          name: values.name
        }
      });
    } else {
      updateTag({
        variables: {
          id: parseInt(selectedTag.id),
          name: values.name
        }
      });
    }
  };

  const handleDelete = (id) => {
    deleteTag({
      variables: { id: parseInt(id) }
    });
  };

  const handleToggle = (id) => {
    toggleTag({
      variables: { id: parseInt(id) }
    });
  };

  const columns = [
    {
      title: t('pages.tags.table.name'),
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Tag color={record.isActive ? 'blue' : 'default'}>
            <TagOutlined style={{ marginRight: '4px' }} />
            {text}
          </Tag>
        </div>
      )
    },
    {
      title: t('pages.tags.table.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggle(record.id)}
          loading={toggling}
          checkedChildren={t('pages.tags.table.active')}
          unCheckedChildren={t('pages.tags.table.inactive')}
        />
      )
    },
    {
      title: t('pages.tags.table.articles'),
      dataIndex: 'articleCount',
      key: 'articleCount',
      render: (count) => t('pages.tags.table.articleCount', { count: count || 0 })
    },
    {
      title: t('pages.tags.table.created'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date)
    },
    {
      title: t('pages.tags.table.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {t('pages.tags.table.edit')}
          </Button>
          <Popconfirm
            title={t('pages.tags.table.deleteConfirmTitle')}
            description={t('pages.tags.table.deleteConfirmDescription')}
            onConfirm={() => handleDelete(record.id)}
            okText={t('common.yes')}
            cancelText={t('common.no')}
          >
            <Button
              type="default"
              danger
              size="small"
              icon={<DeleteOutlined />}
              loading={deleting}
            >
              {t('pages.tags.table.delete')}
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  if (error) {
    return (
      <Alert
        message={t('pages.tags.errorLoading')}
        description={error.message}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1>{t('pages.tags.title')}</h1>
          <p>{t('pages.tags.subtitle')}</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          {t('pages.tags.createButton')}
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={tags}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              t('pages.tags.table.pagination', { start: range[0], end: range[1], total })
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={modalType === 'create' ? t('pages.tags.modal.createTitle') : t('pages.tags.modal.editTitle')}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedTag(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label={t('pages.tags.form.nameLabel')}
            name="name"
            rules={[
              { required: true, message: t('pages.tags.form.nameRequired') },
              { min: 2, message: t('pages.tags.form.nameMinLength') },
              { max: 30, message: t('pages.tags.form.nameMaxLength') },
              { pattern: /^[a-zA-Z0-9\s-]+$/, message: t('pages.tags.form.namePattern') }
            ]}
          >
            <Input placeholder={t('pages.tags.form.namePlaceholder')} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={creating || updating}
              >
                {modalType === 'create' ? t('pages.tags.form.createButton') : t('pages.tags.form.updateButton')}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Tags;

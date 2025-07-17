import React, { useState } from 'react';
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
  Popconfirm
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  FolderOutlined
} from '@ant-design/icons';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_CATEGORIES,
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY
} from '../graphql/queries';
import { formatDate } from '../utils/helpers';
import { useTranslation } from 'react-i18next';

const Categories = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' or 'edit'
  const [form] = Form.useForm();

  // Fetch categories
  const { data, loading, error, refetch } = useQuery(GET_CATEGORIES);

  // Create category mutation
  const [createCategory, { loading: creating }] = useMutation(CREATE_CATEGORY, {
    onCompleted: (data) => {
      if (data.createCategory.success) {
        message.success(t('pages.categories.createSuccess'));
        setIsModalVisible(false);
        form.resetFields();
        refetch();
      } else {
        message.error(data.createCategory.errors?.join(', ') || t('pages.categories.createFailed'));
      }
    },
    onError: (error) => {
      message.error(t('pages.categories.createError') + ': ' + error.message);
    }
  });

  // Update category mutation
  const [updateCategory, { loading: updating }] = useMutation(UPDATE_CATEGORY, {
    onCompleted: (data) => {
      if (data.updateCategory.success) {
        message.success(t('pages.categories.updateSuccess'));
        setIsModalVisible(false);
        setSelectedCategory(null);
        form.resetFields();
        refetch();
      } else {
        message.error(data.updateCategory.errors?.join(', ') || t('pages.categories.updateFailed'));
      }
    },
    onError: (error) => {
      message.error(t('pages.categories.updateError') + ': ' + error.message);
    }
  });

  // Delete category mutation
  const [deleteCategory, { loading: deleting }] = useMutation(DELETE_CATEGORY, {
    onCompleted: (data) => {
      if (data.deleteCategory.success) {
        message.success(t('pages.categories.deleteSuccess'));
        refetch();
      } else {
        message.error(data.deleteCategory.errors?.join(', ') || t('pages.categories.deleteFailed'));
      }
    },
    onError: (error) => {
      message.error(t('pages.categories.deleteError') + ': ' + error.message);
    }
  });

  const categories = data?.categories || [];

  const handleCreate = () => {
    setModalType('create');
    setSelectedCategory(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (category) => {
    setModalType('edit');
    setSelectedCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description || ''
    });
    setIsModalVisible(true);
  };

  const handleSubmit = (values) => {
    if (modalType === 'create') {
      createCategory({
        variables: {
          name: values.name,
          description: values.description
        }
      });
    } else {
      updateCategory({
        variables: {
          id: parseInt(selectedCategory.id),
          name: values.name,
          description: values.description
        }
      });
    }
  };

  const handleDelete = (id) => {
    deleteCategory({
      variables: { id: parseInt(id) }
    });
  };

  const columns = [
    {
      title: t('pages.categories.table.name'),
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <div style={{ fontWeight: 'bold' }}>
          <FolderOutlined style={{ marginRight: '8px' }} />
          {text}
        </div>
      )
    },
    {
      title: t('pages.categories.table.description'),
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || '-'
    },
    {
      title: t('pages.categories.table.articles'),
      dataIndex: 'articleCount',
      key: 'articleCount',
      render: (count) => t('pages.categories.articleCount', { count: count || 0 })
    },
    {
      title: t('pages.categories.table.created'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date)
    },
    {
      title: t('pages.categories.table.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {t('common.edit')}
          </Button>
          <Popconfirm
            title={t('pages.categories.deleteConfirmTitle')}
            description={t('pages.categories.deleteConfirmDescription')}
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
              {t('common.delete')}
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  if (error) {
    return (
      <Alert
        message={t('pages.categories.errorLoading')}
        description={error.message}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div style={{ overflow: 'auto', maxWidth: '100%' }}>
      <div style={{ minWidth: '800px'}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h1>{t('pages.categories.title')}</h1>
            <p>{t('pages.categories.subtitle')}</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            {t('pages.categories.createCategory')}
          </Button>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={categories}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                t('pages.categories.pagination.showTotal', {
                  range0: range[0],
                  range1: range[1],
                  total
                })
            }}
          />
        </Card>

        {/* Create/Edit Modal */}
        <Modal
          title={modalType === 'create' ? t('pages.categories.createCategory') : t('pages.categories.editCategory')}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setSelectedCategory(null);
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
              label={t('pages.categories.form.nameLabel')}
              name="name"
              rules={[
                { required: true, message: t('pages.categories.form.nameRequired') },
                { min: 2, message: t('pages.categories.form.nameMinLength') },
                { max: 50, message: t('pages.categories.form.nameMaxLength') }
              ]}
            >
              <Input placeholder={t('pages.categories.form.namePlaceholder')} />
            </Form.Item>

            <Form.Item
              label={t('pages.categories.form.descriptionLabel')}
              name="description"
              rules={[
                { max: 200, message: t('pages.categories.form.descriptionMaxLength') }
              ]}
            >
              <Input.TextArea
                placeholder={t('pages.categories.form.descriptionPlaceholder')}
                rows={3}
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={creating || updating}
                >
                  {modalType === 'create' ? t('pages.categories.form.create') : t('pages.categories.form.update')}
                </Button>
                <Button onClick={() => setIsModalVisible(false)}>
                  {t('pages.categories.form.cancel')}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default Categories;

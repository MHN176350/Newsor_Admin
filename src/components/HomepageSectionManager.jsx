import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Switch, 
  Select, 
  Space, 
  message, 
  Popconfirm,
  Typography,
  Upload,
  Image,
  Divider,
  Tag,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  UploadOutlined,
  UpOutlined,
  DownOutlined,
  SettingOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';
// Removed react-beautiful-dnd due to React 19 compatibility issues
// Using Ant Design buttons for reordering instead
import MDEditor from '@uiw/react-md-editor';
import { useQuery, useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { 
  GET_HOMEPAGE_SECTIONS, 
  GET_SECTION_TYPES, 
  GET_PAGE_TEMPLATES,
  CREATE_PAGE_SECTION,
  UPDATE_PAGE_SECTION,
  DELETE_PAGE_SECTION,
  UPLOAD_SECTION_MEDIA
} from '../graphql/queries';

const { Title, Text } = Typography;
const { TextArea } = Input;

const HomepageSectionManager = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  // GraphQL queries
  const { data: sectionsData, loading: sectionsLoading, refetch: refetchSections } = useQuery(GET_HOMEPAGE_SECTIONS);
  const { data: sectionTypesData } = useQuery(GET_SECTION_TYPES);
  const { data: templatesData } = useQuery(GET_PAGE_TEMPLATES);

  // GraphQL mutations
  const [createSection] = useMutation(CREATE_PAGE_SECTION);
  const [updateSection] = useMutation(UPDATE_PAGE_SECTION);
  const [deleteSection] = useMutation(DELETE_PAGE_SECTION);
  const [uploadMedia] = useMutation(UPLOAD_SECTION_MEDIA);

  useEffect(() => {
    if (sectionsData?.homepageSections) {
      setSections(sectionsData.homepageSections);
    }
  }, [sectionsData]);

  const handleCreateSection = () => {
    setEditingSection(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    form.setFieldsValue({
      title: section.title,
      subtitle: section.subtitle,
      content: section.content,
      excerpt: section.excerpt,
      isEnabled: section.isEnabled,
      sectionTypeId: section.sectionType.id,
      order: section.order
    });
    setIsModalVisible(true);
  };

  const handleDeleteSection = async (sectionId) => {
    try {
      const { data } = await deleteSection({
        variables: { id: sectionId }
      });

      if (data.deletePageSection.success) {
        message.success('Section deleted successfully');
        refetchSections();
      } else {
        message.error(data.deletePageSection.message);
      }
    } catch (error) {
      message.error('Failed to delete section');
      console.error('Delete section error:', error);
    }
  };

  const handleSaveSection = async (values) => {
    try {
      // Transform form values to ensure correct types
      const transformedValues = {
        ...values,
        // Convert order to integer if it exists
        ...(values.order !== undefined && { order: parseInt(values.order, 10) || 0 }),
        // Convert boolean fields
        ...(values.isEnabled !== undefined && { isEnabled: Boolean(values.isEnabled) }),
        ...(values.isPublished !== undefined && { isPublished: Boolean(values.isPublished) })
      };

      if (editingSection) {
        // Update existing section
        const { data } = await updateSection({
          variables: {
            id: editingSection.id,
            ...transformedValues
          }
        });

        if (data.updatePageSection.success) {
          message.success('Section updated successfully');
          setIsModalVisible(false);
          refetchSections();
        } else {
          message.error(data.updatePageSection.message);
        }
      } else {
        // Create new section
        const defaultTemplate = templatesData?.pageTemplates?.find(t => t.isDefault);
        if (!defaultTemplate) {
          message.error('No default template found');
          return;
        }

        const { data } = await createSection({
          variables: {
            templateId: defaultTemplate.id,
            ...transformedValues
          }
        });

        if (data.createPageSection.success) {
          message.success('Section created successfully');
          setIsModalVisible(false);
          refetchSections();
        } else {
          message.error(data.createPageSection.message);
        }
      }
    } catch (error) {
      message.error('Failed to save section');
      console.error('Save section error:', error);
    }
  };

  const handleUploadImage = async (file, sectionId) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result;
          const { data } = await uploadMedia({
            variables: {
              sectionId,
              base64Data,
              title: file.name,
              mediaType: 'image',
              maxWidth: 1200,
              maxHeight: 800
            }
          });

          if (data.uploadSectionMedia.success) {
            message.success('Image uploaded successfully');
            refetchSections();
            resolve(data.uploadSectionMedia.media);
          } else {
            message.error(data.uploadSectionMedia.message);
            reject(new Error(data.uploadSectionMedia.message));
          }
        } catch (error) {
          message.error('Upload failed');
          reject(error);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const moveSection = async (sectionId, direction) => {
    const currentIndex = sections.findIndex(s => s.id === sectionId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const items = Array.from(sections);
    const [movedItem] = items.splice(currentIndex, 1);
    items.splice(newIndex, 0, movedItem);

    setSections(items);

    // Update order in backend
    try {
      await Promise.all(
        items.map((item, index) =>
          updateSection({
            variables: {
              id: item.id,
              order: index
            }
          })
        )
      );
      message.success('Section order updated');
    } catch (error) {
      message.error('Failed to update section order');
      refetchSections(); // Revert to original order
    }
  };

  const columns = [
    {
      title: 'Order',
      dataIndex: 'order',
      key: 'order',
      width: 120,
      sorter: (a, b) => a.order - b.order,
      render: (order, record, index) => (
        <Space>
          <Tag color="blue">{order}</Tag>
          <Button 
            size="small" 
            icon={<UpOutlined />} 
            disabled={index === 0}
            onClick={() => moveSection(record.id, 'up')}
          />
          <Button 
            size="small" 
            icon={<DownOutlined />} 
            disabled={index === sections.length - 1}
            onClick={() => moveSection(record.id, 'down')}
          />
        </Space>
      )
    },
    {
      title: 'Section Type',
      dataIndex: ['sectionType', 'name'],
      key: 'sectionType',
      render: (text, record) => (
        <Space>
          <i className={record.sectionType.iconClass} />
          {text}
        </Space>
      )
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{text}</div>
          {record.subtitle && (
            <div style={{ fontSize: '12px', color: '#666' }}>{record.subtitle}</div>
          )}
        </div>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Tag color={record.isEnabled ? 'green' : 'red'}>
            {record.isEnabled ? 'Enabled' : 'Disabled'}
          </Tag>
          {record.isRequired && (
            <Tag color="orange">Required</Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Media',
      key: 'media',
      render: (_, record) => (
        <div>
          {record.mediaFiles?.length > 0 && (
            <Tag color="blue">{record.mediaFiles.length} files</Tag>
          )}
          {record.items?.length > 0 && (
            <Tag color="purple">{record.items.length} items</Tag>
          )}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View/Preview">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedSection(record);
                setPreviewVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditSection(record)}
            />
          </Tooltip>
          {!record.isRequired && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure you want to delete this section?"
                onConfirm={() => handleDeleteSection(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="homepage-section-manager">
      <Card 
        title={
          <Space>
            <SettingOutlined />
            <Title level={4} style={{ margin: 0 }}>
              Homepage Section Management
            </Title>
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreateSection}
          >
            Add Section
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={sections}
          rowKey="id"
          loading={sectionsLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Create/Edit Section Modal */}
      <Modal
        title={editingSection ? 'Edit Section' : 'Create New Section'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveSection}
        >
          <Form.Item
            name="sectionTypeId"
            label="Section Type"
            rules={[{ required: true, message: 'Please select a section type' }]}
          >
            <Select
              placeholder="Select section type"
              loading={!sectionTypesData}
            >
              {sectionTypesData?.sectionTypes?.map(type => (
                <Select.Option key={type.id} value={type.id}>
                  <Space>
                    <i className={type.iconClass} />
                    {type.name}
                    {type.isSystem && <Tag size="small" color="orange">System</Tag>}
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Enter section title" />
          </Form.Item>

          <Form.Item name="subtitle" label="Subtitle">
            <Input placeholder="Enter section subtitle (optional)" />
          </Form.Item>

          <Form.Item name="excerpt" label="Excerpt">
            <TextArea 
              rows={3}
              placeholder="Enter a brief description (optional)"
            />
          </Form.Item>

          <Form.Item name="content" label="Content">
            <MDEditor
              data-color-mode="light"
              height={300}
              preview="edit"
            />
          </Form.Item>

          <Form.Item name="order" label="Display Order">
            <Input type="number" placeholder="Enter display order" />
          </Form.Item>

          <Form.Item name="isEnabled" label="Enabled" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                icon={<SaveOutlined />}
              >
                {editingSection ? 'Update Section' : 'Create Section'}
              </Button>
              <Button 
                onClick={() => setIsModalVisible(false)}
                icon={<CloseOutlined />}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title={`Preview: ${selectedSection?.title}`}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={1000}
        footer={null}
      >
        {selectedSection && (
          <div>
            <Card>
              <Title level={3}>{selectedSection.title}</Title>
              {selectedSection.subtitle && (
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  {selectedSection.subtitle}
                </Text>
              )}
              <Divider />
              {selectedSection.content && (
                <MDEditor.Markdown 
                  source={selectedSection.content}
                  style={{ backgroundColor: 'transparent' }}
                />
              )}
              {selectedSection.mediaFiles?.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <Title level={5}>Media Files:</Title>
                  <Space wrap>
                    {selectedSection.mediaFiles.map(media => (
                      <Image
                        key={media.id}
                        width={100}
                        height={100}
                        src={media.fileUrl}
                        alt={media.altText || media.title}
                        style={{ objectFit: 'cover' }}
                      />
                    ))}
                  </Space>
                </div>
              )}
              {selectedSection.items?.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <Title level={5}>Items:</Title>
                  {selectedSection.items.map(item => (
                    <Card key={item.id} size="small" style={{ marginBottom: '8px' }}>
                      <Card.Meta
                        title={item.title}
                        description={item.description}
                      />
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HomepageSectionManager;

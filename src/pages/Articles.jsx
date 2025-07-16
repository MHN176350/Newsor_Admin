import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Spin,
  Input,
  Popconfirm,
  Image,
  Tree,
  Tabs,
  Typography
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  FolderOutlined,
  FileTextOutlined,
  InboxOutlined,
  DownOutlined
} from '@ant-design/icons';
import { useQuery, useMutation } from '@apollo/client';
import { GET_NEWS_LIST, UPDATE_NEWS_STATUS, DELETE_NEWS, GET_CATEGORIES } from '../graphql/queries';
import { getStatusColor, formatDate, NEWS_STATUS, truncateText } from '../utils/helpers';
import { useTranslation } from 'react-i18next';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const Articles = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'table'
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [deletingId, setDeletingId] = useState(null); // Track which article is being deleted
  const [form] = Form.useForm();

  // Fetch articles
  const { data, loading, error, refetch } = useQuery(GET_NEWS_LIST, {
    variables: { 
      status: statusFilter || undefined,
      categoryId: undefined,
      tagId: undefined,
      authorId: undefined,
      search: searchText || undefined
    }
  });

  // Fetch categories
  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES);

  // Update article status mutation
  const [updateNewsStatus, { loading: updating }] = useMutation(UPDATE_NEWS_STATUS, {
    onCompleted: (data) => {
      if (data.updateNewsStatus.success) {
        message.success(t('pages.articles.updateStatusSuccess'));
        setIsModalVisible(false);
        setSelectedArticle(null);
        form.resetFields();
        refetch();
      } else {
        message.error(data.updateNewsStatus.errors?.join(', ') || t('pages.articles.updateStatusFailed'));
      }
    },
    onError: (error) => {
      message.error(t('pages.articles.updateStatusError') + ': ' + error.message);
    }
  });

 
  const [deleteNews] = useMutation(DELETE_NEWS, {
    onCompleted: (data) => {
      setDeletingId(null);
      if (data.deleteNews.success) {
        message.success(t('pages.articles.deleteSuccess'));
        refetch();
      } else {
        message.error(data.deleteNews.errors?.join(', ') || t('pages.articles.deleteFailed'));
      }
    },
    onError: (error) => {
      setDeletingId(null);
      message.error(t('pages.articles.deleteError') + ': ' + error.message);
    }
  });

  const articles = data?.newsList || [];
  const categories = categoriesData?.categories || [];
  
  // Filter articles based on search text
  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchText.toLowerCase()) ||
    article.author.username.toLowerCase().includes(searchText.toLowerCase())
  );

  // Create tree structure for categories and articles
  const treeData = useMemo(() => {
    const categoryMap = new Map();
    
    // Group articles by category
    filteredArticles.forEach(article => {
      const categoryId = article.category?.id || 'uncategorized';
      const categoryName = article.category?.name || t('pages.articles.uncategorized');
      
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          key: `category-${categoryId}`,
          title: (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FolderOutlined />
              <span>{categoryName}</span>
              <Tag color="blue">{t('pages.articles.articleCount', { count: categoryMap.get(categoryId)?.children?.length || 0 })}</Tag>
            </div>
          ),
          children: []
        });
      }
      
      const categoryNode = categoryMap.get(categoryId);
      categoryNode.children.push({
        key: `article-${article.id}`,
        title: (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
            <FileTextOutlined />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold' }}>
                {truncateText(article.title, 40)}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                By {article.author.firstName || article.author.username} • {formatDate(article.publishedAt || article.createdAt)}
              </div>
            </div>
            <Tag color={getStatusColor(article.status)}>
              {article.status.toUpperCase()}
            </Tag>
            <Space>
              {article.status === NEWS_STATUS.PUBLISHED && (
                <Button
                  type="link"
                  size="small"
                  icon={<InboxOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArchive(article);
                  }}
                >
                  Archive
                </Button>
              )}
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(article);
                }}
              >
                Edit
              </Button>
              {(() => {
                const status = article.status?.toString().toLowerCase();
                const canDelete = status === NEWS_STATUS.DRAFT.toLowerCase() || status === NEWS_STATUS.ARCHIVED.toLowerCase();
                if (canDelete) {
                  return (
                    <Popconfirm
                      title="Are you sure you want to delete this article?"
                      onConfirm={(e) => {
                        e.stopPropagation();
                        handleDelete(article.id);
                      }}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        type="link"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        loading={deletingId === article.id}
                        disabled={!!deletingId && deletingId !== article.id}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Delete
                      </Button>
                    </Popconfirm>
                  );
                } else {
                  return (
                    <Button
                      type="link"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      disabled
                      title={`Only draft or archived articles can be deleted. Current status: ${article.status}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Delete
                    </Button>
                  );
                }
              })()}
            </Space>
          </div>
        ),
        isLeaf: true,
        articleData: article
      });
    });

    // Update category titles with correct article counts
    categoryMap.forEach((category, categoryId) => {
      const articleCount = category.children.length;
      category.title = (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FolderOutlined />
          <span>{categoryId === 'uncategorized' ? t('pages.articles.uncategorized') : categories.find(c => c.id === categoryId)?.name || t('pages.articles.unknown')}</span>
          <Tag color="blue">{t('pages.articles.articleCount', { count: articleCount })}</Tag>
        </div>
      );
    });
    
    return Array.from(categoryMap.values());
  }, [filteredArticles, categories, deletingId]);

  const handleArchive = (article) => {
    updateNewsStatus({
      variables: {
        id: parseInt(article.id),
        status: NEWS_STATUS.ARCHIVED
      }
    });
  };

  const handleStatusChange = (article) => {
    setSelectedArticle(article);
    form.setFieldsValue({
      newStatus: article.status
    });
    setIsModalVisible(true);
  };

  const handleSubmit = (values) => {
    if (selectedArticle) {
      updateNewsStatus({
        variables: {
          id: parseInt(selectedArticle.id),
          status: values.newStatus
        }
      });
    }
  };

  const handleDelete = (id) => {
    if (deletingId) {
      // Prevent double deletion
      return;
    }
    const article = articles.find(a => a.id === id);
    if (!article) {
      message.error('Article not found.');
      return;
    }
    const status = article.status?.toString().toLowerCase();
    if (status !== NEWS_STATUS.DRAFT.toLowerCase() && status !== NEWS_STATUS.ARCHIVED.toLowerCase()) {
      message.error(`Only draft or archived articles can be deleted. Current status: ${article.status}`);
      return;
    }
    setDeletingId(id);
    deleteNews({
      variables: { id: parseInt(id) }
    });
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {truncateText(text, 50)}
          </div>
          <Image
            width={60}
            height={40}
            src={record.featuredImageUrl || '/default-news.svg'}
            fallback="/default-news.svg"
            style={{ objectFit: 'cover', borderRadius: '4px' }}
          />
        </div>
      )
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      render: (author) => (
        <div>
          <div>{author.firstName || author.username}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            @{author.username}
          </div>
        </div>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color="blue">{category?.name || t('pages.articles.uncategorized')}</Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Published',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      render: (date) => date ? formatDate(date) : '-'
    },
    {
      title: 'Stats',
      key: 'stats',
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div>👁️ {record.viewCount || 0}</div>
          <div>❤️ {record.likeCount || 0}</div>
          <div>💬 {0}</div>
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === NEWS_STATUS.PUBLISHED && (
            <Button
              type="default"
              size="small"
              icon={<InboxOutlined />}
              onClick={() => handleArchive(record)}
            >
              Archive
            </Button>
          )}
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleStatusChange(record)}
          >
            Change Status
          </Button>
          {(() => {
            const status = record.status?.toString().toLowerCase();
            const canDelete = status === NEWS_STATUS.DRAFT.toLowerCase() || status === NEWS_STATUS.ARCHIVED.toLowerCase();
            if (canDelete) {
              return (
                <Popconfirm
                  title="Are you sure you want to delete this article?"
                  onConfirm={() => handleDelete(record.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    type="default"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    loading={deletingId === record.id}
                    disabled={!!deletingId && deletingId !== record.id}
                    title={deletingId === record.id ? 'Deleting in progress...' : 'Delete this article'}
                  >
                    Delete
                  </Button>
                </Popconfirm>
              );
            } else {
              return (
                <Button
                  type="default"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  disabled
                  title={`Only draft or archived articles can be deleted. Current status: ${record.status}`}
                >
                  Delete
                </Button>
              );
            }
          })()}
        </Space>
      )
    }
  ];

  const statusOptions = [
    { value: NEWS_STATUS.DRAFT, label: 'DRAFT' },
    { value: NEWS_STATUS.PENDING, label: 'PENDING' },
    { value: NEWS_STATUS.PUBLISHED, label: 'PUBLISHED' },
    { value: NEWS_STATUS.ARCHIVED, label: 'ARCHIVED' }
  ];

  if (error) {
    return (
      <Alert
        message="Error loading articles"
        description={error.message}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div style={{ padding: '0', maxWidth: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Title level={2} style={{ margin: 0, color: '#1a1a1a' }}>
            Article Management
          </Title>
          <Text type="secondary" style={{ fontSize: '16px', marginTop: '8px', display: 'block' }}>
            Manage articles and their publication status across categories
          </Text>
        </div>
        <Button
          type="primary"
          style={{ borderRadius: '8px', fontWeight: 600, minWidth: 160 }}
          onClick={() => navigate('/create-article')}
        >
          + New Article
        </Button>
      </div>

      {/* Filters */}
      <Card 
        className="article-search-card"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SearchOutlined />
            <span>Search & Filter Articles</span>
          </div>
        }
        style={{ marginBottom: '24px', marginTop: '24px' }}
        styles={{ body: { padding: '20px' } }}
      >
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'stretch' }}>
          <div style={{ flex: 2, minWidth: '320px' }}>
            <Input
              size="large"
              placeholder="Search by title, author name..."
              prefix={<SearchOutlined style={{ color: '#999' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ 
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                height: '40px'
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '200px', maxWidth: '240px' }}>
            <Select
              size="large"
              placeholder="All Statuses"
              value={statusFilter || null}
              onChange={setStatusFilter}
              allowClear
              style={{ 
                width: '100%',
                borderRadius: '8px',
                height: '40px'
              }}
              suffixIcon={<FilterOutlined />}
            >
              <Select.Option value={null}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tag color="default" style={{ margin: 0 }}>
                    All Statuses
                  </Tag>
                </div>
              </Select.Option>
              {statusOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Tag color={getStatusColor(option.value)} style={{ margin: 0 }}>
                      {option.label}
                    </Tag>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </div>
          {(searchText || statusFilter) && (
            <Button
              type="default"
              onClick={() => {
                setSearchText('');
                setStatusFilter('');
              }}
              style={{ 
                borderRadius: '8px', 
                minWidth: '100px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Clear All
            </Button>
          )}
        </div>
        
        {/* Results Summary */}
        <div className="article-stats-summary" style={{ 
          marginTop: '16px', 
          padding: '12px 16px', 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Text type="secondary">
            Showing {filteredArticles.length} of {articles.length} articles
            {searchText && <span> • Search: "{searchText}"</span>}
            {statusFilter ? (
              <span> • Status: {statusOptions.find(s => s.value === statusFilter)?.label}</span>
            ) : (
              <span> • Status: All Statuses</span>
            )}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Last updated: {new Date().toLocaleTimeString()}
          </Text>
        </div>
      </Card>

      <Card 
        style={{ 
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}
        styles={{ body: { padding: '0' } }}
      >
        <Tabs 
          activeKey={viewMode} 
          onChange={setViewMode}
          style={{ padding: '0 24px' }}
          tabBarStyle={{ 
            margin: 0, 
            padding: '20px 0 0 0',
            borderBottom: '1px solid #f0f0f0'
          }}
          items={[
            {
              key: 'tree',
              label: (
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  <FolderOutlined />
                  Category Tree View
                </span>
              ),
              children: (
                <div style={{ padding: '24px 0' }}>
                  {loading || categoriesLoading ? (
                    <Spin size="large" style={{ display: 'block', textAlign: 'center', margin: '50px 0' }} />
                  ) : (
                    <Tree
                      showLine
                      switcherIcon={<DownOutlined />}
                      treeData={treeData}
                      expandedKeys={expandedKeys}
                      onExpand={setExpandedKeys}
                      style={{ 
                        background: '#fafafa', 
                        padding: '20px', 
                        borderRadius: '8px',
                        border: '1px solid #f0f0f0'
                      }}
                    />
                  )}
                </div>
              )
            },
            {
              key: 'table',
              label: (
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  <FileTextOutlined />
                  Table View
                </span>
              ),
              children: (
                <div style={{ padding: '24px 0' }} className="article-table-container">
                  <Table
                    columns={columns}
                    dataSource={filteredArticles}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => 
                        `${range[0]}-${range[1]} of ${total} articles`,
                      style: { padding: '16px 0' }
                    }}
                    style={{
                      background: '#fafafa',
                      borderRadius: '8px',
                      padding: '16px'
                    }}
                  />
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* Status Change Modal */}
      <Modal
        title={`Change Status for "${selectedArticle?.title}"`}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedArticle(null);
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
            <p><strong>Current Status:</strong> {selectedArticle?.status}</p>
            <p><strong>Author:</strong> {selectedArticle?.author?.firstName || selectedArticle?.author?.username}</p>
            <p><strong>Category:</strong> {selectedArticle?.category?.name || t('pages.articles.uncategorized')}</p>
          </div>

          <Form.Item
            label="New Status"
            name="newStatus"
            rules={[{ required: true, message: 'Please select a new status' }]}
          >
            <Select placeholder="Select a status">
              {statusOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  <Tag color={getStatusColor(option.value)}>
                    {option.label}
                  </Tag>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={updating}>
                Update Status
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Articles;

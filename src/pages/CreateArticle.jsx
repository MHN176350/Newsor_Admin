import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { Modal, Button, Typography, Spin, Alert, Space } from 'antd';
import { useAuth } from '../store/AuthContext';
import ArticleForm from '../components/ArticleForm';
import { CREATE_NEWS, UPDATE_NEWS } from '../graphql/mutations';
import { GET_CATEGORIES, GET_TAGS, GET_NEWS } from '../graphql/queries';
import { useTranslation } from 'react-i18next';

export default function CreateArticle() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams(); // id is article id for editing/duplicating
  const location = useLocation();
  
  // Determine mode based on current path
  const isEditing = location.pathname.includes('/edit/');
  const isDuplicating = location.pathname.includes('/duplicate/');
  const isCreating = !isEditing && !isDuplicating;

  // Modal always open for create/edit/duplicate
  const [showModal, setShowModal] = useState(true);
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // GraphQL hooks (declare these first)
  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES);
  const { data: tagsData, loading: tagsLoading } = useQuery(GET_TAGS);
  const { data: articleData, loading: articleLoading } = useQuery(
    GET_NEWS,
    {
      variables: { id: parseInt(id) },
      skip: !isEditing && !isDuplicating
    }
  );

  // Compute initial values for ArticleForm (after articleData is declared)
  const initialValues = useMemo(() => {
    let values = {
      title: '',
      content: '',
      excerpt: '',
      categoryId: '',
      tags: [],
      featuredImage: '',
      metaDescription: '',
      metaKeywords: '',
    };
    
    if ((isEditing || isDuplicating) && articleData?.newsArticle) {
      const article = articleData.newsArticle;
      values = {
        title: isDuplicating ? `${article.title} (Copy)` : (article.title || ''),
        content: article.content || '',
        excerpt: article.excerpt || '',
        categoryId: article.category?.id || '',
        tags: article.tags || [],
        featuredImage: article.featuredImageUrl || '',
        metaDescription: article.metaDescription || '',
        metaKeywords: article.metaKeywords || '',
      };
    }
    
    return values;
  }, [isEditing, isDuplicating, articleData]);
  const [createNews] = useMutation(CREATE_NEWS, {
    onCompleted: (data) => {
      if (data?.createNews?.success) {
        // Navigate after successful creation
        navigate('/articles', { 
          state: { 
            message: t('createArticle.successCreate') 
          }
        });
      }
    }
  });
  const [updateNews] = useMutation(UPDATE_NEWS, {
    onCompleted: (data) => {
      if (data?.updateNews?.success) {
        // Navigate after successful update
        navigate('/articles', { 
          state: { 
            message: t('createArticle.successUpdate') 
          }
        });
      }
    }
  });

  // Remove the useEffect that was causing form resets
  // The initialValues memoization above handles the data properly

  // Check authentication and permissions
  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <Typography.Title level={3} style={{ marginBottom: 16 }}>
          {t('createArticle.authRequired')}
        </Typography.Title>
        <Typography.Text style={{ display: 'block', marginBottom: 24, color: '#666' }}>
          {t('createArticle.signInMessage', { action: isEditing ? t('common.edit') : isDuplicating ? t('createArticle.duplicate') : t('common.create') })}
        </Typography.Text>
        <Button type="primary" onClick={() => navigate('/login')}>
          {t('auth.login.signIn')}
        </Button>
      </div>
    );
  }

  const userRole = user?.profile?.role?.toLowerCase();
  const canCreateArticles = ['writer', 'manager', 'admin'].includes(userRole);

  if (!canCreateArticles) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <Typography.Title level={3} style={{ marginBottom: 16, color: '#ff4d4f' }}>
          {t('createArticle.permissionDenied')}
        </Typography.Title>
        <Typography.Text style={{ display: 'block', marginBottom: 16, color: '#666' }}>
          {t('createArticle.writerPrivileges', { action: isEditing ? t('common.edit') : t('common.create') })}
        </Typography.Text>
        <Typography.Text style={{ display: 'block', marginBottom: 24, color: '#666' }}>
          {t('createArticle.currentRole')}: {user?.profile?.role || t('common.reader')}
        </Typography.Text>
        <Button onClick={() => navigate(-1)}>
          {t('common.back')}
        </Button>
      </div>
    );
  }

  // Show loading state when editing and article data is loading
  if (isEditing && articleLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <Spin size="large" />
        <Typography.Text style={{ display: 'block', marginTop: 16 }}>
          {t('createArticle.loadingArticle')}
        </Typography.Text>
      </div>
    );
  }

  // Check if article exists and user owns it when editing
  if (isEditing && articleData && !articleLoading) {
    const article = articleData.newsArticle;
    if (!article) {
      return (
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Typography.Title level={3} style={{ marginBottom: 16, color: '#ff4d4f' }}>
            {t('createArticle.articleNotFound')}
          </Typography.Title>
          <Typography.Text style={{ display: 'block', marginBottom: 24, color: '#666' }}>
            {t('createArticle.articleNotFoundMessage')}
          </Typography.Text>
          <Button onClick={() => navigate('/articles')}>
            {t('createArticle.backToMyArticles')}
          </Button>
        </div>
      );
    }

    // Check if user owns the article (unless they're admin/manager)
    if (!['admin', 'manager'].includes(userRole) && article.author.id !== user.id) {
      return (
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Typography.Title level={3} style={{ marginBottom: 16, color: '#ff4d4f' }}>
            {t('createArticle.permissionDenied')}
          </Typography.Title>
          <Typography.Text style={{ display: 'block', marginBottom: 24, color: '#666' }}>
            {t('createArticle.canOnlyEditOwn')}
          </Typography.Text>
          <Button onClick={() => navigate('/articles')}>
            {t('createArticle.backToMyArticles')}
          </Button>
        </div>
      );
    }

    // Check if article can be edited (only drafts and rejected articles)
    if (!['draft', 'rejected'].includes(article.status?.toLowerCase())) {
      return (
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Typography.Title level={3} style={{ marginBottom: 16, color: '#faad14' }}>
            {t('createArticle.cannotEdit')}
          </Typography.Title>
          <Typography.Text style={{ display: 'block', marginBottom: 16, color: '#666' }}>
            {t('createArticle.cannotEditMessage')}
          </Typography.Text>
          <Typography.Text style={{ display: 'block', marginBottom: 24, color: '#666' }}>
            {t('createArticle.currentStatus')}: {article.status}
          </Typography.Text>
          <Button onClick={() => navigate('/articles')}>
            {t('createArticle.backToMyArticles')}
          </Button>
        </div>
      );
    }
  }


  // Handle form submit from ArticleForm
  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    setErrors([]);
    try {
      console.log('Form values received:', values);
      
      const variables = {
        title: values.title.trim(),
        content: values.content,
        excerpt: values.excerpt.trim(),
        categoryId: parseInt(values.categoryId),
        tagIds: values.tags.length > 0 ? values.tags.map(tag => parseInt(tag.id)) : null,
        featuredImage: values.featuredImage || null,
        metaDescription: values.metaDescription || null,
        metaKeywords: values.metaKeywords || null,
      };
      
      console.log('GraphQL variables:', variables);
      
      let data;
      if (isEditing) {
        const result = await updateNews({ variables: { id: parseInt(id), ...variables } });
        data = result.data;
      } else {
        const result = await createNews({ variables });
        data = result.data;
      }
      
      console.log('GraphQL response:', data);
      
      const operation = isEditing ? 'updateNews' : 'createNews';
      if (!data?.[operation]?.success) {
        console.error('GraphQL errors:', data?.[operation]?.errors);
        setErrors(data?.[operation]?.errors || [t('createArticle.failedMessage', { action: isEditing ? t('common.update') : isDuplicating ? t('createArticle.duplicate') : t('common.create') })]);
      } else {
        setShowModal(false);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors([error.message || t('createArticle.failedMessage', { action: isEditing ? t('common.update') : isDuplicating ? t('createArticle.duplicate') : t('common.create') })]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine form mode and modal title
  let formMode = 'create';
  let modalTitle = t('createArticle.createTitle');
  if (isEditing) {
    formMode = 'edit';
    modalTitle = t('createArticle.editTitle');
  } else if (isDuplicating) {
    formMode = 'duplicate';
    modalTitle = t('createArticle.duplicateTitle');
  }

  return (
    <Modal
      open={showModal}
      onCancel={() => {
        setShowModal(false);
        navigate(-1); // Go back on close
      }}
      footer={null}
      title={modalTitle}
      width={800}
      destroyOnClose
    >
      <ArticleForm
        mode={formMode}
        initialValues={initialValues}
        categoriesData={categoriesData?.categories || []}
        categoriesLoading={categoriesLoading}
        tagsData={tagsData?.tags || []}
        tagsLoading={tagsLoading}
        isSubmitting={isSubmitting}
        errors={errors}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowModal(false);
          navigate(-1);
        }}
        t={t}
      />
    </Modal>
  );
}

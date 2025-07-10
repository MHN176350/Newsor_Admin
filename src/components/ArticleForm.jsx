import { useState, useEffect } from 'react';
import { Typography, Input, Select, Button, Form, Alert, Spin } from 'antd';
const { TextArea } = Input;
import MarkdownEditor from './MarkdownEditor';
import TagAutocomplete from './TagAutocomplete';
import ImageUpload from './ImageUpload';

export default function ArticleForm({
  mode = 'create',
  initialValues = {},
  categoriesData = [],
  categoriesLoading = false,
  tagsData = [],
  tagsLoading = false,
  isSubmitting = false,
  errors = [],
  onSubmit,
  onCancel,
  t
}) {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    categoryId: '',
    tags: [],
    featuredImage: '',
    metaDescription: '',
    metaKeywords: '',
    ...initialValues
  });

  useEffect(() => {
    // Only update form data if initialValues actually changed and has meaningful content
    if (initialValues && Object.keys(initialValues).length > 0) {
      const newFormData = { ...formData, ...initialValues };
      setFormData(newFormData);
      form.setFieldsValue(newFormData);
    }
    // eslint-disable-next-line
  }, [initialValues, mode]); // Add mode to dependencies to prevent unnecessary updates

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    form.setFieldsValue({ [field]: value });
  };

  const handleTagsChange = (newTags) => {
    const updatedFormData = { ...formData, tags: newTags };
    setFormData(updatedFormData);
    // Don't call form.setFieldsValue here as it can cause re-renders
  };

  const handleImageUploaded = (imageUrl, result) => {
    console.log('Image uploaded successfully:', imageUrl);
    handleInputChange('featuredImage', imageUrl);
  };

  const handleImageRemoved = () => {
    console.log('Image removed');
    handleInputChange('featuredImage', '');
  };

  const handleFinish = (values) => {
    // Merge form values with current formData state
    const finalValues = { ...formData, ...values };
    console.log('Form submission values:', finalValues);
    if (onSubmit) onSubmit(finalValues);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={formData}
      onFinish={handleFinish}
    >
      {errors.length > 0 && (
        <Alert type="error" showIcon style={{ marginBottom: 16 }}>
          {errors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </Alert>
      )}
      <Form.Item
        label={t('createArticle.titleLabel')}
        name="title"
        rules={[{ required: true, message: t('validation.required') }]}
      >
        <Input
          placeholder={t('createArticle.titlePlaceholder')}
          onChange={e => handleInputChange('title', e.target.value)}
        />
      </Form.Item>
      <Form.Item
        label={t('createArticle.excerptLabel')}
        name="excerpt"
        rules={[{ required: true, message: t('createArticle.excerptRequired') }]}
      >
        <TextArea
          placeholder={t('createArticle.excerptPlaceholder')}
          maxLength={300}
          autoSize={{ minRows: 2, maxRows: 3 }}
          onChange={e => handleInputChange('excerpt', e.target.value)}
        />
        <div style={{ textAlign: 'right', color: '#888', fontSize: 12 }}>{formData.excerpt.length}/300</div>
      </Form.Item>
      <Form.Item
        label={t('createArticle.categoryLabel')}
        name="categoryId"
        rules={[{ required: true, message: t('createArticle.categoryRequired') }]}
      >
        {categoriesLoading ? (
          <Spin size="small" />
        ) : (
          <Select
            placeholder={t('createArticle.categoryPlaceholder')}
            onChange={value => handleInputChange('categoryId', value)}
            value={formData.categoryId || undefined}
            allowClear
          >
            {categoriesData?.map((category) => (
              <Select.Option key={category.id} value={category.id}>{category.name}</Select.Option>
            ))}
          </Select>
        )}
      </Form.Item>
      <TagAutocomplete
        tags={tagsData || []}
        selectedTags={formData.tags}
        onTagsChange={handleTagsChange}
        loading={tagsLoading}
        label={t('createArticle.tagsLabel')}
        placeholder={t('createArticle.tagsPlaceholder')}
        t={t}
      />
      <Form.Item label={t('createArticle.featuredImageLabel')} name="featuredImage">
        <ImageUpload
          variant="thumbnail"
          currentImageUrl={formData.featuredImage}
          onImageUploaded={handleImageUploaded}
          onImageRemoved={handleImageRemoved}
          maxSizeInMB={5}
          uploadButtonText={t('createArticle.uploadThumbnail')}
          removeButtonText={t('createArticle.removeThumbnail')}
          t={t}
        />
      </Form.Item>
      <Form.Item
        label={t('createArticle.contentLabel')}
        name="content"
        rules={[{ required: true, message: t('createArticle.contentRequired') }]}
      >
        <MarkdownEditor
          value={formData.content}
          onChange={content => handleInputChange('content', content)}
          placeholder={t('createArticle.contentPlaceholder')}
          t={t}
        />
      </Form.Item>
      <Typography.Title level={4} style={{ marginTop: 24 }}>{t('createArticle.seoTitle')}</Typography.Title>
      <Form.Item label={t('createArticle.metaDescriptionLabel')} name="metaDescription">
        <TextArea
          placeholder={t('createArticle.metaDescriptionPlaceholder')}
          maxLength={160}
          autoSize={{ minRows: 2, maxRows: 2 }}
          onChange={e => handleInputChange('metaDescription', e.target.value)}
        />
        <div style={{ textAlign: 'right', color: '#888', fontSize: 12 }}>{formData.metaDescription.length}/160</div>
      </Form.Item>
      <Form.Item label={t('createArticle.metaKeywordsLabel')} name="metaKeywords">
        <Input
          placeholder={t('createArticle.metaKeywordsPlaceholder')}
          onChange={e => handleInputChange('metaKeywords', e.target.value)}
        />
      </Form.Item>
      <Form.Item>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
          <Button onClick={onCancel} disabled={isSubmitting} style={{ minWidth: 100 }}>
            {t('common.cancel')}
          </Button>
          <Button type="primary" htmlType="submit" loading={isSubmitting} disabled={isSubmitting} style={{ minWidth: 120 }}>
            {isSubmitting ? t('createArticle.creating') : t('createArticle.createButton')}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
}

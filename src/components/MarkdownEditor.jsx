import React, { useState, useCallback } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Button, Modal, Input, Alert, Space, Upload, message } from 'antd';
import { PictureOutlined, UploadOutlined } from '@ant-design/icons';
import { useMutation } from '@apollo/client';
import { GET_CLOUDINARY_SIGNATURE } from '../graphql/mutations';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MarkdownEditor = ({ 
  value = '', 
  onChange, 
  placeholder = "Start writing your article...",
  t = (key) => key // Default translation function
}) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [getCloudinarySignature] = useMutation(GET_CLOUDINARY_SIGNATURE);

  const uploadImageToCloudinary = async (file) => {
    try {
      setIsUploading(true);
      setUploadError('');

      // Get upload signature from backend
      const { data } = await getCloudinarySignature();
      
      if (!data?.getCloudinarySignature?.success) {
        throw new Error(data?.getCloudinarySignature?.errors?.[0] || 'Failed to get upload signature');
      }

      const uploadData = data.getCloudinarySignature;

      // Create form data for Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', uploadData.apiKey);
      formData.append('timestamp', uploadData.timestamp);
      formData.append('signature', uploadData.signature);
      formData.append('folder', uploadData.folder);

      // Upload to Cloudinary
      const response = await fetch(`https://api.cloudinary.com/v1_1/${uploadData.cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      return result.secure_url;

    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError(t('articleForm.imageUpload.invalidFileType'));
      return false;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(t('articleForm.imageUpload.fileTooLarge'));
      return false;
    }

    try {
      const url = await uploadImageToCloudinary(file);
      setImageUrl(url);
      setUploadError('');
      message.success(t('articleForm.imageUpload.uploadSuccess'));
    } catch (error) {
      setUploadError(error.message || t('articleForm.imageUpload.uploadFailed'));
      message.error(t('articleForm.imageUpload.uploadFailed'));
    }
    
    return false; // Prevent default upload behavior
  };

  const insertImage = () => {
    if (!imageUrl) return;

    // Create markdown image with responsive sizing
    const alt = altText || t('articleForm.richTextEditor.defaultAltText');
    const imageMarkdown = `\n\n<img src="${imageUrl}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />\n\n`;
    
    const newValue = value + imageMarkdown;
    onChange(newValue);

    // Reset form
    setImageUrl('');
    setAltText('');
    setIsImageModalOpen(false);
  };

  const handleEditorChange = useCallback((val) => {
    onChange(val || '');
  }, [onChange]);

  return (
    <div className="markdown-editor-container">
      <MDEditor
        value={value}
        onChange={handleEditorChange}
        preview="edit"
        hideToolbar={false}
        height={400}
        data-color-mode="light"
        textareaProps={{
          placeholder,
          style: {
            fontSize: 14,
            lineHeight: 1.6,
          },
        }}
        style={{
          backgroundColor: '#fff',
        }}
      />
      
      {/* Custom Image Upload Button */}
      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          icon={<PictureOutlined />} 
          onClick={() => setIsImageModalOpen(true)}
          size="small"
        >
          {t('articleForm.richTextEditor.insertImage')}
        </Button>
      </div>
      
      {/* Image Upload Modal */}
      <Modal
        open={isImageModalOpen}
        onCancel={() => {
          setIsImageModalOpen(false);
          setImageUrl('');
          setAltText('');
          setUploadError('');
        }}
        footer={null}
        title={t('articleForm.richTextEditor.insertImage')}
        width={500}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {uploadError && (
            <Alert 
              type="error" 
              showIcon 
              message={uploadError}
              closable
              onClose={() => setUploadError('')}
            />
          )}
          
          <Upload
            beforeUpload={handleImageUpload}
            showUploadList={false}
            accept="image/*"
            disabled={isUploading}
          >
            <Button 
              icon={<UploadOutlined />} 
              loading={isUploading}
              style={{ width: '100%' }}
            >
              {isUploading 
                ? t('articleForm.imageUpload.uploading') 
                : t('articleForm.imageUpload.selectImage')
              }
            </Button>
          </Upload>
          
          {imageUrl && (
            <div style={{ textAlign: 'center' }}>
              <img 
                src={imageUrl} 
                alt="Preview" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: 200, 
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }} 
              />
            </div>
          )}
          
          <Input
            placeholder={t('articleForm.richTextEditor.altTextPlaceholder')}
            value={altText}
            onChange={e => setAltText(e.target.value)}
          />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button 
              onClick={() => {
                setIsImageModalOpen(false);
                setImageUrl('');
                setAltText('');
                setUploadError('');
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              type="primary" 
              onClick={insertImage} 
              disabled={!imageUrl || isUploading}
            >
              {t('articleForm.richTextEditor.insertImage')}
            </Button>
          </div>
        </Space>
      </Modal>

      <style jsx>{`
        .markdown-editor-container .w-md-editor {
          background-color: #fff;
        }
        
        .markdown-editor-container .w-md-editor-text-textarea,
        .markdown-editor-container .w-md-editor-text {
          font-size: 14px !important;
          line-height: 1.6 !important;
        }
        
        .markdown-editor-container .w-md-editor-preview img {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin: 16px 0;
        }
        
        .markdown-editor-container .w-md-editor-text-textarea img {
          max-width: 100% !important;
          height: auto !important;
        }
        
        .markdown-editor-container .w-md-editor-focus {
          border-color: #1890ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default MarkdownEditor;

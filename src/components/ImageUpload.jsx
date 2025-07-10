import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button, Card, Spin, Typography, Alert, Upload, Avatar, Row, Col } from 'antd';
import { CameraOutlined, DeleteOutlined } from '@ant-design/icons';
import { processImageUrlForDisplay } from '../core/utils/cloudinaryUtils';
import { imageService } from '../services';

/**
 * Reusable image upload component
 */
export default function ImageUpload({
  currentImageUrl = null,
  onImageUploaded,
  onImageRemoved,
  variant = 'standard', // 'standard', 'avatar', 'banner'
  maxSizeInMB = 5,
  acceptedTypes = 'image/*',
  disabled = false,
  showPreview = true,
  uploadButtonText = 'Upload Image',
  removeButtonText = 'Remove Image',
  isRegistration = false, // Flag for registration uploads (no auth required)
  t = null // Translation function
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Determine what URL to show for preview
  const previewUrl = useMemo(() => {
    if (uploadedImageUrl) {
      return processImageUrlForDisplay(uploadedImageUrl);
    }
    return processImageUrlForDisplay(currentImageUrl);
  }, [uploadedImageUrl, currentImageUrl]);

  // Configuration based on variant
  const getConfig = () => {
    switch (variant) {
      case 'avatar':
        return {
          maxWidth: 600,   // Increased from 400
          maxHeight: 600,  // Increased from 400
          quality: "95",   // Very high quality
          aspectRatio: '1/1',
          previewSize: 120
        };
      case 'banner':
        return {
          maxWidth: 1800,  // Increased from 1200
          maxHeight: 600,  // Increased from 400
          quality: "90",   // High quality
          aspectRatio: '3/1',
          previewSize: 300
        };
      case 'thumbnail':
        return {
          maxWidth: 1600,  // Increased from 1200
          maxHeight: 1200, // Increased from 900  
          quality: "95",   // Very high quality
          aspectRatio: '4/3',
          previewSize: 250
        };
      default:
        return {
          maxWidth: 1200,  // Increased from 800
          maxHeight: 900,  // Increased from 600
          quality: "90",   // High quality string
          aspectRatio: 'auto',
          previewSize: 200
        };
    }
  };

  const config = getConfig();

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError(t ? t('createArticle.imageUpload.invalidFileType') : 'Please select a valid image file');
      return;
    }

    // Validate file size
    const maxSize = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSize) {
      setError(t ? t('createArticle.imageUpload.fileTooLarge', { size: maxSizeInMB }) : `Image size must be less than ${maxSizeInMB}MB`);
      return;
    }

    uploadImage(file);
  };

  const uploadImage = async (file) => {
    setUploading(true);
    setError(null);
    try {
      console.log('Uploading image:', file.name, file.size, file.type);
      
      // Use the image service like the Frontend version
      const options = {
        folder:
          variant === 'banner'
            ? 'newsor/banners'
            : variant === 'thumbnail'
            ? 'newsor/thumbnails'
            : 'newsor/uploads',
        maxWidth: config.maxWidth,
        maxHeight: config.maxHeight,
        quality: config.quality.toString(),
      };
      
      const result = await imageService.processAndUploadImage(file, options);
      console.log('Upload result:', result);
      
      const originalUrl = result.url || result.secure_url || result.cloudinaryUrl;
      if (!originalUrl) {
        throw new Error(t ? t('createArticle.imageUpload.noUrlReturned') : 'No URL returned from upload service');
      }
      
      setUploadedImageUrl(originalUrl);
      onImageUploaded?.(originalUrl, result);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || (t ? t('createArticle.imageUpload.uploadFailed') : 'Failed to upload image'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setUploadedImageUrl(null);
    setError(null);
    onImageRemoved?.();
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Preview */}
      {showPreview && previewUrl && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          {variant === 'avatar' ? (
            <Avatar src={previewUrl} size={config.previewSize} style={{ border: '2px solid #eee' }} />
          ) : (
            <Card style={{ maxWidth: config.previewSize, aspectRatio: config.aspectRatio, overflow: 'hidden' }} bordered>
              <img
                src={previewUrl}
                alt="Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Card>
          )}
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert type="error" showIcon style={{ marginBottom: 12 }}>{error}</Alert>
      )}

      {/* Controls */}
      <Row gutter={16} justify="center" style={{ marginBottom: 12 }}>
        <Col>
          <Button
            type="primary"
            icon={uploading ? <Spin size="small" /> : <CameraOutlined />}
            onClick={handleButtonClick}
            disabled={disabled || uploading}
            loading={uploading}
          >
            {uploading ? 'Uploading...' : uploadButtonText}
          </Button>
        </Col>
        {previewUrl && (
          <Col>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleRemoveImage}
              disabled={disabled || uploading}
            >
              {removeButtonText}
            </Button>
          </Col>
        )}
      </Row>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Helper Text */}
      <Typography.Text type="secondary" style={{ display: 'block', textAlign: 'center', fontSize: 12 }}>
        {variant === 'avatar' && 'Recommended: Square image, max 2MB'}
        {variant === 'banner' && 'Recommended: 3:1 aspect ratio, max 5MB'}
        {variant === 'thumbnail' && 'Recommended: 4:3 aspect ratio, high quality processing (max 1600x1200px)'}
        {variant === 'standard' && `Max size: ${maxSizeInMB}MB`}
      </Typography.Text>
    </div>
  );
}

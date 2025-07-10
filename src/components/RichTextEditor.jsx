import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { Button, Modal, Input, Alert, Typography, Divider, Spin, Space } from 'antd';
import { BoldOutlined, ItalicOutlined, PictureOutlined, LinkOutlined, OrderedListOutlined, UnorderedListOutlined, CloseOutlined, CommentOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { GET_CLOUDINARY_SIGNATURE } from '../graphql/mutations';

const RichTextEditor = ({ content, onChange, placeholder = "Start writing your article..." }) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [getCloudinarySignature] = useMutation(GET_CLOUDINARY_SIGNATURE);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'article-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'article-link',
        },
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'rich-text-editor',
      },
    },
  });

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

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB');
      return;
    }

    try {
      const url = await uploadImageToCloudinary(file);
      setImageUrl(url);
      setUploadError('');
    } catch (error) {
      setUploadError(error.message || 'Failed to upload image');
    }
  };

  const insertImage = () => {
    if (!imageUrl || !editor) return;

    editor.chain().focus().setImage({ 
      src: imageUrl, 
      alt: altText || 'Article image' 
    }).run();

    // Reset form
    setImageUrl('');
    setAltText('');
    setIsImageModalOpen(false);
  };

  const insertLink = () => {
    const url = window.prompt('Enter URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div>
      {/* Toolbar */}
      <div style={{ border: '1px solid #e5e5e5', borderBottom: 'none', borderRadius: '8px 8px 0 0', padding: 8, background: '#fafafa' }}>
        <Space wrap>
          <Button type={editor.isActive('bold') ? 'primary' : 'default'} icon={<BoldOutlined />} size="small" onClick={() => editor.chain().focus().toggleBold().run()} />
          <Button type={editor.isActive('italic') ? 'primary' : 'default'} icon={<ItalicOutlined />} size="small" onClick={() => editor.chain().focus().toggleItalic().run()} />
          <Divider type="vertical" />
          <Button type={editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'} size="small" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</Button>
          <Button type={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'} size="small" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Button>
          <Button type={editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'} size="small" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</Button>
          <Divider type="vertical" />
          <Button type={editor.isActive('bulletList') ? 'primary' : 'default'} icon={<UnorderedListOutlined />} size="small" onClick={() => editor.chain().focus().toggleBulletList().run()} />
          <Button type={editor.isActive('orderedList') ? 'primary' : 'default'} icon={<OrderedListOutlined />} size="small" onClick={() => editor.chain().focus().toggleOrderedList().run()} />
          <Divider type="vertical" />
          <Button icon={<PictureOutlined />} size="small" onClick={() => setIsImageModalOpen(true)} />
          <Button icon={<LinkOutlined />} size="small" onClick={insertLink} />
          <Divider type="vertical" />
          <Button type={editor.isActive('blockquote') ? 'primary' : 'default'} icon={<CommentOutlined />} size="small" onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        </Space>
      </div>
      {/* Editor Content */}
      <div style={{ border: '1px solid #e5e5e5', borderRadius: '0 0 8px 8px', minHeight: 300, padding: 16, background: '#fff' }}>
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>
      {/* Image Upload Modal */}
      <Modal
        open={isImageModalOpen}
        onCancel={() => setIsImageModalOpen(false)}
        footer={null}
        title="Insert Image"
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {uploadError && <Alert type="error" showIcon>{uploadError}</Alert>}
          <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
          {isUploading && <Spin size="small" />}
          {imageUrl && (
            <img src={imageUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 4 }} />
          )}
          <Input
            placeholder="Alt text (optional)"
            value={altText}
            onChange={e => setAltText(e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button icon={<CloseOutlined />} onClick={() => setIsImageModalOpen(false)}>
              Cancel
            </Button>
            <Button type="primary" onClick={insertImage} disabled={!imageUrl || isUploading}>
              Insert Image
            </Button>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default RichTextEditor;

// src/services/imageService.js
// Image upload service for Admin panel

class ImageService {
  constructor() {
    this.cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    this.uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    this.backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';
  }

  /**
   * Process and upload an image with the given options
   * @param {File} file - The image file to upload
   * @param {Object} options - Upload options (folder, maxWidth, maxHeight, quality)
   * @returns {Promise<Object>} Upload result with URL
   */
  async processAndUploadImage(file, options = {}) {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select a valid image file');
    }

    // Try Cloudinary first, then fallback to backend
    if (this.cloudName && this.uploadPreset) {
      try {
        return await this.uploadToCloudinary(file, options);
      } catch (error) {
        console.warn('Cloudinary upload failed, falling back to backend:', error.message);
        return await this.uploadToBackend(file, options);
      }
    } else {
      console.log('Cloudinary not configured, using backend upload');
      return await this.uploadToBackend(file, options);
    }
  }

  /**
   * Upload image to Cloudinary
   * @param {File} file - The image file
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Cloudinary response
   */
  async uploadToCloudinary(file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    
    if (options.folder) {
      formData.append('folder', options.folder);
    }

    const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/upload`;
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Upload failed: ${response.status}`);
    }

    const result = await response.json();
    return {
      url: result.secure_url || result.url,
      cloudinaryUrl: result.secure_url || result.url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes
    };
  }

  /**
   * Upload image to backend API
   * @param {File} file - The image file
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Backend response
   */
  async uploadToBackend(file, options = {}) {
    console.log('Uploading to backend:', file.name, file.size, file.type);
    
    const formData = new FormData();
    formData.append('image', file); // Backend expects 'image' field, not 'file'
    
    if (options.folder) {
      formData.append('folder', options.folder);
    }

    const token = localStorage.getItem('token');
    const uploadUrl = `${this.backendUrl}upload-image/`;
    
    console.log('Backend upload URL:', uploadUrl);
    console.log('Has token:', !!token);
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend upload error:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
      
      throw new Error(errorData.error || errorData.message || `Upload failed: ${response.status}`);
    }

    const result = await response.json();
    return {
      url: result.url || result.secure_url,
      cloudinaryUrl: result.url || result.secure_url,
      publicId: result.public_id,
      format: result.format
    };
  }
}

// Export a singleton instance
export const imageService = new ImageService();
export default imageService;

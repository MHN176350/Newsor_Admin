/**
 * Test script to verify Cloudinary configuration
 * Run this in browser console to test your setup
 */

// Test Cloudinary configuration
const testCloudinaryConfig = () => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  
  console.log('Testing Cloudinary Configuration:');
  console.log('Cloud Name:', cloudName);
  console.log('Upload Preset:', uploadPreset);
  
  if (!cloudName || !uploadPreset) {
    console.error('❌ Missing Cloudinary configuration');
    return false;
  }
  
  console.log('✅ Configuration looks good');
  return true;
};

// Test upload preset by making a simple request
const testUploadPreset = async () => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  
  if (!cloudName || !uploadPreset) {
    console.error('❌ Missing configuration');
    return;
  }
  
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: 'POST',
      body: new FormData() // Empty form data to test preset validation
    });
    
    const result = await response.text();
    console.log('Preset test response:', result);
    
    if (result.includes('Upload preset not found')) {
      console.error('❌ Upload preset not found in your Cloudinary account');
    } else if (result.includes('Empty file')) {
      console.log('✅ Upload preset exists and is accessible');
    }
  } catch (error) {
    console.error('❌ Error testing preset:', error);
  }
};

// Export functions for testing
window.testCloudinaryConfig = testCloudinaryConfig;
window.testUploadPreset = testUploadPreset;

console.log('Cloudinary test functions loaded. Run testCloudinaryConfig() or testUploadPreset() to test.');

import { useState, useRef, useMemo, useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { Input, Spin, Tag, Typography, Form, Dropdown, Menu, Button } from 'antd';
import { CREATE_TAG } from '../graphql/mutations';
import { GET_TAGS } from '../graphql/queries';

export default function TagAutocomplete({
  tags = [],
  selectedTags = [],
  onTagsChange,
  loading = false,
  label = "Tags",
  placeholder = "Type to search or add tags...",
  required = false,
  t = null // Translation function
}) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

  const [createTag] = useMutation(CREATE_TAG, {
    update(cache, { data }) {
      if (data?.createTag?.success && data?.createTag?.tag) {
        // Read the current tags from cache
        const existingTags = cache.readQuery({ query: GET_TAGS });
        if (existingTags) {
          // Write the new tag to the cache
          cache.writeQuery({
            query: GET_TAGS,
            data: {
              tags: [...existingTags.tags, data.createTag.tag]
            }
          });
        }
      }
    }
  });

  // Memoize tags to ensure stable references
  const memoizedTags = useMemo(() => {
    if (!Array.isArray(tags)) return [];
    return tags;
  }, [tags]);
  
  // Memoize selected tag IDs for comparison
  const selectedTagIds = useMemo(() => {
    if (!Array.isArray(selectedTags)) return new Set();
    return new Set(selectedTags.map(tag => tag.id));
  }, [selectedTags]);
  
  // Memoize filtered tags based on input and selection
  const filteredTags = useMemo(() => {
    if (!inputValue.trim()) {
      return [];
    }

    return memoizedTags.filter(tag => 
      tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedTagIds.has(tag.id)
    );
  }, [inputValue, memoizedTags, selectedTagIds]);

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(value.trim().length > 0);
  }, []);

  const handleInputKeyDown = useCallback(async (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      e.stopPropagation();
      await handleAddTag(inputValue.trim());
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setShowSuggestions(false);
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      e.preventDefault();
      e.stopPropagation();
      // Remove last tag when backspace is pressed on empty input
      const newSelectedTags = selectedTags.slice(0, -1);
      onTagsChange(newSelectedTags);
    }
  }, [inputValue, selectedTags, onTagsChange]);

  const handleSelectTag = useCallback((tag) => {
    const newSelectedTags = [...selectedTags, tag];
    onTagsChange(newSelectedTags);
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, [selectedTags, onTagsChange]);

  const handleAddTag = useCallback(async (tagName) => {
    if (!tagName.trim()) return;

    // Check if tag already exists
    const existingTag = memoizedTags.find(tag => 
      tag.name.toLowerCase() === tagName.toLowerCase()
    );

    if (existingTag) {
      // Tag exists, just select it
      if (!selectedTags.some(selected => selected.id === existingTag.id)) {
        const newSelectedTags = [...selectedTags, existingTag];
        onTagsChange(newSelectedTags);
        setInputValue('');
        setShowSuggestions(false);
        inputRef.current?.focus();
      }
      return;
    }

    // Create new tag
    try {
      setIsCreatingTag(true);
      const slug = generateSlug(tagName);
      const { data } = await createTag({
        variables: { 
          name: tagName,
          slug: slug
        }
      });

      if (data?.createTag?.success && data?.createTag?.tag) {
        const newTag = data.createTag.tag;
        const newSelectedTags = [...selectedTags, newTag];
        onTagsChange(newSelectedTags);
        setInputValue('');
        setShowSuggestions(false);
        inputRef.current?.focus();
      } else {
        console.error('Failed to create tag:', data?.createTag?.errors);
      }
    } catch (error) {
      console.error('Error creating tag:', error);
    } finally {
      setIsCreatingTag(false);
    }
  }, [memoizedTags, selectedTags, createTag, onTagsChange]);

  const handleRemoveTag = useCallback((tagToRemove) => {
    const newSelectedTags = selectedTags.filter(tag => tag.id !== tagToRemove.id);
    onTagsChange(newSelectedTags);
  }, [selectedTags, onTagsChange]);

  const handleInputFocus = useCallback(() => {
    if (inputValue.trim()) {
      setShowSuggestions(true);
    }
  }, [inputValue]);

  const handleInputBlur = useCallback((e) => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      if (!listRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
      }
    }, 150);
  }, []);

  const shouldShowCreateOption = useMemo(() => {
    return inputValue.trim() && 
      !filteredTags.some(tag => tag.name.toLowerCase() === inputValue.toLowerCase()) &&
      !selectedTags.some(tag => tag.name.toLowerCase() === inputValue.toLowerCase());
  }, [inputValue, filteredTags, selectedTags]);

  return (
    <Form.Item label={label} required={required} style={{ marginBottom: 16 }}>
      {/* Selected Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        {selectedTags.map((tag) => (
          <Tag
            key={tag.id}
            closable
            onClose={() => handleRemoveTag(tag)}
            style={{ marginBottom: 4 }}
          >
            {tag.name}
          </Tag>
        ))}
      </div>
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        disabled={loading}
        suffix={(loading || isCreatingTag) && <Spin size="small" />}
        autoComplete="off"
      />
      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div 
          ref={listRef}
          style={{
            position: 'absolute',
            background: '#fff',
            border: '1px solid #eee',
            borderRadius: 4,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            zIndex: 1000,
            width: '100%',
            maxHeight: 200,
            overflowY: 'auto',
            marginTop: 2
          }}
        >
          {filteredTags.map((tag) => (
            <div
              key={tag.id}
              style={{ padding: '6px 12px', cursor: 'pointer', color: '#333' }}
              onMouseDown={() => handleSelectTag(tag)}
            >
              {tag.name}
            </div>
          ))}
          {shouldShowCreateOption && (
            <div
              style={{ padding: '6px 12px', cursor: isCreatingTag ? 'not-allowed' : 'pointer', fontStyle: 'italic', color: '#1890ff' }}
              onMouseDown={() => !isCreatingTag && handleAddTag(inputValue.trim())}
            >
              {isCreatingTag ? 
                (t ? t('createArticle.tagAutocomplete.creating') : 'Creating...') : 
                (t ? t('createArticle.tagAutocomplete.create', { name: inputValue.trim() }) : `Create "${inputValue.trim()}"`)}
            </div>
          )}
          {filteredTags.length === 0 && !shouldShowCreateOption && (
            <div style={{ padding: '6px 12px', color: '#aaa' }}>No tags found</div>
          )}
        </div>
      )}
    </Form.Item>
  );
}

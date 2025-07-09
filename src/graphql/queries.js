import { gql } from '@apollo/client';

// Authentication queries
export const LOGIN_USER = gql`
  mutation TokenAuth($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      token
      refreshToken
      user {
        id
        username
        email
        firstName
        lastName
        isActive
        profile {
          id
          role
          bio
          avatarUrl
        }
      }
    }
  }
`;

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      username
      email
      firstName
      lastName
      isActive
      profile {
        id
        role
        bio
        avatarUrl
      }
    }
  }
`;

// Dashboard queries
export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalUsers
      totalNews
      publishedNews
      pendingNews
      draftNews
      totalViews
      totalLikes
      totalComments
      totalCategories
      totalTags
      newUsersThisMonth
      newsThisMonth
      totalReaders
      totalWriters
      totalManagers
      totalAdmins
    }
  }
`;

export const GET_RECENT_ACTIVITY = gql`
  query GetRecentActivity($limit: Int) {
    recentActivity(limit: $limit) {
      id
      description
      timestamp
      user {
        id
        username
        firstName
        lastName
      }
    }
  }
`;

// User management queries
export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      username
      email
      firstName
      lastName
      isActive
      dateJoined
      profile {
        role
        bio
        avatarUrl
        createdAt
        updatedAt
      }
    }
  }
`;

export const CHANGE_USER_ROLE = gql`
  mutation ChangeUserRole($userId: Int!, $newRole: String!) {
    changeUserRole(userId: $userId, newRole: $newRole) {
      success
      errors
    }
  }
`;

// Categories queries
export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      slug
      description
      createdAt
      articleCount
    }
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($name: String!, $description: String) {
    createCategory(name: $name, description: $description) {
      success
      category {
        id
        name
        description
        createdAt
        updatedAt
      }
      errors
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: Int!, $name: String!, $description: String) {
    updateCategory(id: $id, name: $name, description: $description) {
      success
      category {
        id
        name
        description
        createdAt
        updatedAt
      }
      errors
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: Int!) {
    deleteCategory(id: $id) {
      success
      errors
    }
  }
`;

// Tags queries
export const GET_ADMIN_TAGS = gql`
  query GetAdminTags {
    adminTags {
      id
      name
      slug
      createdAt
      isActive
      articleCount
    }
  }
`;

export const CREATE_TAG = gql`
  mutation CreateTag($name: String!) {
    createTag(name: $name) {
      success
      tag {
        id
        name
        isActive
        createdAt
      }
      errors
    }
  }
`;

export const UPDATE_TAG = gql`
  mutation UpdateTag($id: Int!, $name: String!) {
    updateTag(id: $id, name: $name) {
      success
      tag {
        id
        name
        isActive
        createdAt
      }
      errors
    }
  }
`;

export const DELETE_TAG = gql`
  mutation DeleteTag($id: Int!) {
    deleteTag(id: $id) {
      success
      errors
    }
  }
`;

export const TOGGLE_TAG = gql`
  mutation ToggleTag($id: Int!) {
    toggleTag(id: $id) {
      success
      tag {
        id
        name
        isActive
        createdAt
      }
      errors
    }
  }
`;

// News/Articles queries
export const GET_NEWS_LIST = gql`
  query GetNewsList($status: String, $categoryId: Int, $tagId: Int, $authorId: Int, $search: String) {
    newsList(status: $status, categoryId: $categoryId, tagId: $tagId, authorId: $authorId, search: $search) {
      id
      title
      slug
      excerpt
      content
      status
      publishedAt
      createdAt
      updatedAt
      viewCount
      likeCount
      author {
        id
        username
        firstName
        lastName
        profile {
          avatarUrl
        }
      }
      category {
        id
        name
        slug
      }
      tags {
        id
        name
        slug
      }
      featuredImageUrl
    }
  }
`;

export const UPDATE_NEWS_STATUS = gql`
  mutation UpdateNewsStatus($id: Int!, $status: String!) {
    updateNewsStatus(id: $id, status: $status) {
      success
      news {
        id
        title
        status
        publishedAt
        updatedAt
      }
      errors
    }
  }
`;

export const DELETE_NEWS = gql`
  mutation DeleteNews($id: Int!) {
    deleteNews(id: $id) {
      success
      errors
    }
  }
`;

// Page Section Management Queries
export const GET_PAGE_TEMPLATES = gql`
  query GetPageTemplates {
    pageTemplates {
      id
      name
      slug
      description
      isActive
      isDefault
      sectionsCount
      createdAt
      updatedAt
    }
  }
`;

export const GET_SECTION_TYPES = gql`
  query GetSectionTypes {
    sectionTypes {
      id
      name
      slug
      description
      iconClass
      isSystem
      supportsRichText
      supportsMedia
      supportsItems
      maxInstances
    }
  }
`;

export const GET_PAGE_SECTIONS = gql`
  query GetPageSections($templateId: ID, $sectionTypeSlug: String, $isEnabled: Boolean, $isPublished: Boolean) {
    pageSections(templateId: $templateId, sectionTypeSlug: $sectionTypeSlug, isEnabled: $isEnabled, isPublished: $isPublished) {
      id
      title
      subtitle
      slug
      content
      excerpt
      isEnabled
      isRequired
      isPublished
      order
      template {
        id
        name
        slug
      }
      sectionType {
        id
        name
        slug
        iconClass
        supportsRichText
        supportsMedia
        supportsItems
      }
      mediaFiles {
        id
        title
        altText
        mediaType
        fileUrl
        isFeatured
        order
      }
      items {
        id
        title
        subtitle
        description
        content
        iconUrl
        imageUrl
        linkUrl
        linkText
        order
        isActive
        isFeatured
      }
      createdAt
      updatedAt
      createdBy {
        id
        username
        firstName
        lastName
      }
    }
  }
`;

export const GET_HOMEPAGE_SECTIONS = gql`
  query GetHomepageSections {
    homepageSections {
      id
      title
      subtitle
      slug
      content
      excerpt
      isEnabled
      isRequired
      order
      sectionType {
        id
        name
        slug
        iconClass
        supportsRichText
        supportsMedia
        supportsItems
      }
      mediaFiles {
        id
        title
        altText
        mediaType
        fileUrl
        isFeatured
        order
      }
      items {
        id
        title
        subtitle
        description
        content
        iconUrl
        imageUrl
        linkUrl
        linkText
        order
        isActive
      }
    }
  }
`;

export const GET_CONTACT_INFO = gql`
  query GetContactInfo($contactType: String) {
    contactInfo(contactType: $contactType) {
      id
      contactType
      title
      content
      subtitle
      description
      iconClass
      iconImageUrl
      linkUrl
      isClickable
      order
      isActive
      isFeatured
    }
  }
`;

// Page Section Management Mutations
export const CREATE_PAGE_SECTION = gql`
  mutation CreatePageSection(
    $templateId: ID!
    $sectionTypeId: ID!
    $title: String!
    $subtitle: String
    $content: String
    $excerpt: String
    $isEnabled: Boolean
    $order: Int
  ) {
    createPageSection(
      templateId: $templateId
      sectionTypeId: $sectionTypeId
      title: $title
      subtitle: $subtitle
      content: $content
      excerpt: $excerpt
      isEnabled: $isEnabled
      order: $order
    ) {
      section {
        id
        title
        subtitle
        content
        excerpt
        isEnabled
        order
        sectionType {
          id
          name
          slug
        }
      }
      success
      message
    }
  }
`;

export const UPDATE_PAGE_SECTION = gql`
  mutation UpdatePageSection(
    $id: ID!
    $title: String
    $subtitle: String
    $content: String
    $excerpt: String
    $isEnabled: Boolean
    $order: Int
  ) {
    updatePageSection(
      id: $id
      title: $title
      subtitle: $subtitle
      content: $content
      excerpt: $excerpt
      isEnabled: $isEnabled
      order: $order
    ) {
      section {
        id
        title
        subtitle
        content
        excerpt
        isEnabled
        order
      }
      success
      message
    }
  }
`;

export const DELETE_PAGE_SECTION = gql`
  mutation DeletePageSection($id: ID!) {
    deletePageSection(id: $id) {
      success
      message
    }
  }
`;

export const UPLOAD_SECTION_MEDIA = gql`
  mutation UploadSectionMedia(
    $sectionId: ID!
    $base64Data: String!
    $title: String
    $altText: String
    $mediaType: String
    $isFeatured: Boolean
    $maxWidth: Int
    $maxHeight: Int
  ) {
    uploadSectionMedia(
      sectionId: $sectionId
      base64Data: $base64Data
      title: $title
      altText: $altText
      mediaType: $mediaType
      isFeatured: $isFeatured
      maxWidth: $maxWidth
      maxHeight: $maxHeight
    ) {
      media {
        id
        title
        altText
        mediaType
        fileUrl
        isFeatured
      }
      success
      message
    }
  }
`;

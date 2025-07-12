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

export const GET_TAGS = gql`
  query GetTags {
    tags {
      id
      name
      slug
      createdAt
      isActive
      articleCount
    }
  }
`;
export const GET_NEWS = gql`
  query GetNews($id: Int, $slug: String) {
    newsArticle(id: $id, slug: $slug) {
      id
      title
      content
      excerpt
      featuredImageUrl
      status
      publishedAt
      createdAt
      updatedAt
      slug
      metaDescription
      metaKeywords
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
        slug
        description
        createdAt
        updatedAt
      }
      errors
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: Int!, $name: String, $description: String) {
    updateCategory(id: $id, name: $name, description: $description) {
      success
      category {
        id
        name
        slug
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
        slug
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
        slug
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
        slug
        isActive
        createdAt
      }
      errors
    }
  }
`;

export const GET_ARTICLES_BY_TAG = gql`
  query GetArticlesByTag($tagId: Int!) {
    articles_by_tag(tagId: $tagId) {
      id
      title
      slug
      excerpt
      status
      publishedAt
      createdAt
      viewCount
      featuredImage
      author {
        id
        username
        firstName
        lastName
      }
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

// Homepage Section Management queries (Simple version)
export const GET_HOMEPAGE_SECTIONS = gql`
  query GetHomepageSections {
    homepageSections {
      id
      title
      subtitle
      content
      excerpt
      isEnabled
      isPublished
      order
      createdAt
      updatedAt
      sectionType {
        id
        name
        slug
      }
      template {
        id
        name
        slug
      }
    }
  }
`;

export const CREATE_HOMEPAGE_SECTION = gql`
  mutation CreateHomepageSection(
    $templateId: ID!
    $sectionTypeId: ID!
    $title: String!
    $subtitle: String
    $content: String
    $excerpt: String
    $order: Int
    $isEnabled: Boolean
    $isPublished: Boolean
  ) {
    createPageSection(
      templateId: $templateId
      sectionTypeId: $sectionTypeId
      title: $title
      subtitle: $subtitle
      content: $content
      excerpt: $excerpt
      order: $order
      isEnabled: $isEnabled
      isPublished: $isPublished
    ) {
      success
      message
      section {
        id
        title
        subtitle
        content
        excerpt
        isEnabled
        isPublished
        order
        createdAt
        updatedAt
      }
    }
  }
`;

export const UPDATE_HOMEPAGE_SECTION = gql`
  mutation UpdateHomepageSection(
    $id: ID!
    $title: String
    $subtitle: String
    $content: String
    $excerpt: String
    $isEnabled: Boolean
    $isPublished: Boolean
    $order: Int
  ) {
    updatePageSection(
      id: $id
      title: $title
      subtitle: $subtitle
      content: $content
      excerpt: $excerpt
      isEnabled: $isEnabled
      isPublished: $isPublished
      order: $order
    ) {
      success
      message
      section {
        id
        title
        subtitle
        content
        excerpt
        isEnabled
        isPublished
        order
        updatedAt
      }
    }
  }
`;

export const DELETE_HOMEPAGE_SECTION = gql`
  mutation DeleteHomepageSection($id: ID!) {
    deletePageSection(id: $id) {
      success
      message
    }
  }
`;

export const GET_PAGE_TEMPLATES = gql`
  query GetPageTemplates {
    pageTemplates {
      id
      name
      slug
      description
      isActive
      isDefault
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
      supportsRichText
      supportsMedia
      supportsItems
      maxInstances
    }
  }
`;

// Contact management queries
export const GET_CONTACTS = gql`
  query GetContacts($first: Int, $after: String) {
    contacts(first: $first, after: $after) {
      edges {
        node {
          id
          name
          email
          phone
          requestService
          requestContent
          status
          createdAt
          respondedAt
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const CREATE_CONTACT = gql`
  mutation CreateContact(
    $name: String!
    $email: String!
    $phone: String
    $requestService: String!
    $requestContent: String!
  ) {
    createContact(
      name: $name
      email: $email
      phone: $phone
      requestService: $requestService
      requestContent: $requestContent
    ) {
      success
      contact {
        id
        name
        email
        phone
        requestService
        requestContent
        status
        createdAt
      }
      errors
    }
  }
`;

export const UPDATE_CONTACT_STATUS = gql`
  mutation UpdateContactStatus($id: ID!, $status: String!) {
    updateContactStatus(id: $id, status: $status) {
      success
      contact {
        id
        status
        respondedAt
      }
      errors
    }
  }
`;

export const GET_EMAIL_TEMPLATE = gql`
  query GetEmailTemplate($name: String!) {
    emailTemplate(name: $name) {
      id
      name
      subject
      content
      variables
      updatedAt
    }
  }
`;

export const GET_EMAIL_TEMPLATES = gql`
  query GetEmailTemplates($templateType: String) {
    emailTemplates(templateType: $templateType) {
      id
      name
      templateType
      subject
      content
      variables
      isActive
      updatedAt
    }
  }
`;

export const UPDATE_EMAIL_TEMPLATE = gql`
  mutation UpdateEmailTemplate(
    $name: String!
    $subject: String!
    $content: String!
  ) {
    updateEmailTemplate(
      name: $name
      subject: $subject
      content: $content
    ) {
      success
      emailTemplate {
        id
        name
        subject
        content
        variables
        updatedAt
      }
      errors
    }
  }
`;

export const SEND_THANK_YOU_EMAIL = gql`
  mutation SendThankYouEmail($contactId: ID!, $templateId: ID) {
    sendThankYouEmail(contactId: $contactId, templateId: $templateId) {
      success
      message
      errors
    }
  }
`;

// Subscriptions
export const NOTIFICATION_SUBSCRIPTION = gql`
  subscription OnNotificationAdded {
    notificationAdded {
      id
      message
      notificationType
      createdAt
      article {
        slug
      }
    }
  }
`;

export const GET_UNREAD_NOTIFICATIONS = gql`
  query GetUnreadNotifications {
    unreadNotifications {
      id
      title
      message
      notificationType
      isRead
      readAt
      createdAt
      sender {
        id
        username
        firstName
        lastName
      }
      article {
        id
        title
        slug
      }
    }
  }
`;

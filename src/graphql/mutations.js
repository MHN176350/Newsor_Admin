import { gql } from '@apollo/client';

// Create a new article (news)
export const CREATE_NEWS = gql`
  mutation CreateNews($title: String!, $content: String!, $excerpt: String!, $categoryId: Int!, $tagIds: [Int], $featuredImage: String, $metaDescription: String, $metaKeywords: String) {
    createNews(
      title: $title
      content: $content
      excerpt: $excerpt
      categoryId: $categoryId
      tagIds: $tagIds
      featuredImage: $featuredImage
      metaDescription: $metaDescription
      metaKeywords: $metaKeywords
    ) {
      news {
        id
        title
        slug
        status
        createdAt
        author {
          id
          username
        }
      }
      success
      errors
    }
  }
`;
export const GET_CLOUDINARY_SIGNATURE = gql`
  mutation GetCloudinarySignature {
    getCloudinarySignature {
      signature
      timestamp
      apiKey
      cloudName
      folder
      success
      errors
    }
  }
`;
export const CREATE_TAG = gql`
  mutation CreateTag($name: String!) {
    createTag(name: $name) {
      tag {
        id
        name
        slug
      }
      success
      errors
    }
  }
`;
export const UPDATE_NEWS = gql`
  mutation UpdateNews(
    $id: Int!
    $title: String!
    $content: String!
    $excerpt: String!
    $featuredImage: String
    $categoryId: Int!
    $tagIds: [Int!]
    $metaDescription: String
    $metaKeywords: String
  ) {
    updateNews(
      id: $id
      title: $title
      content: $content
      excerpt: $excerpt
      featuredImage: $featuredImage
      categoryId: $categoryId
      tagIds: $tagIds
      metaDescription: $metaDescription
      metaKeywords: $metaKeywords
    ) {
      news {
        id
        title
        content
        excerpt
        featuredImageUrl
        status
        updatedAt
        category {
          id
          name
        }
        tags {
          id
          name
        }
      }
      success
      errors
    }
  }
`;
// Notification Mutations
export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($notificationId: Int!) {
    markNotificationAsRead(notificationId: $notificationId) {
      success
      notification {
        id
        isRead
        readAt
      }
      errors
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead {
      success
      count
      errors
    }
  }
`;

// Email Template Mutations
export const CREATE_EMAIL_TEMPLATE = gql`
  mutation CreateEmailTemplate($name: String!, $subject: String!, $content: String!, $variables: [String]) {
    createEmailTemplate(
      name: $name
      subject: $subject
      content: $content
      variables: $variables
    ) {
      emailTemplate {
        id
        name
        subject
        content
        variables
        createdAt
        updatedAt
      }
      success
      errors
    }
  }
`;

export const DELETE_EMAIL_TEMPLATE = gql`
  mutation DeleteEmailTemplate($id: ID!) {
    deleteEmailTemplate(id: $id) {
      success
      errors
    }
  }
`;

export const UPDATE_EMAIL_TEMPLATE = gql`
  mutation UpdateEmailTemplate($name: String!, $subject: String!, $content: String!, $variables: [String]) {
    updateEmailTemplate(
      name: $name
      subject: $subject
      content: $content
      variables: $variables
    ) {
      emailTemplate {
        id
        name
        subject
        content
        variables
        updatedAt
      }
      success
      errors
    }
  }
`;

export const UPDATE_CONTACT_STATUS = gql`
  mutation UpdateContactStatus($id: Int!, $status: String!) {
    updateContactStatus(id: $id, status: $status) {
      contact {
        id
        status
        updatedAt
      }
      success
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
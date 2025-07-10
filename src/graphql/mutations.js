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

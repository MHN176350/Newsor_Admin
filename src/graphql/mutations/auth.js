import { gql } from '@apollo/client';

// Request password reset
export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email) {
      success
      message
      errors
    }
  }
`;

// Reset password with token
export const RESET_PASSWORD = gql`
  mutation ResetPassword($uid: String!, $token: String!, $username: String!, $newPassword: String!) {
    resetPassword(uid: $uid, token: $token, username: $username, newPassword: $newPassword) {
      success
      message
      errors
    }
  }
`;

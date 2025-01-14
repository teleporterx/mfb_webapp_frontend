// src/types/User.ts

export interface User {
    email: string;
    // Add any other fields you expect from user data
  }
  
  export interface UserResponse {
    user: User;
    // Add any other fields returned from your API response
  }
  
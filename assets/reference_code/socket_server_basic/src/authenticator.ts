export const authenticator = async ({ token }: { token: string }) => {
  // Implement your authentication logic here
  if (!token || token !== process.env.AUTH_TOKEN) {
    throw new Error("Unauthorized");
  }
  // If authentication is successful, return user data or any other relevant information
  return { user_id: "12345", username: "testuser" };
};

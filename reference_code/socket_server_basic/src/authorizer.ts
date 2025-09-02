export const authorizer = async (
  { token, channel_name }: { token: string; channel_name: string },
) => {
  // Implement your authorization logic here
  if (!token || token !== process.env.AUTH_TOKEN) {
    throw new Error("Unauthorized");
  }

  if (!channel_name?.startsWith("private-")) {
    throw new Error("Forbidden: Only private channels are allowed");
  }

  if (!channel_name.endsWith('admin')) {
    console.warn(`Unauthorized access attempt to channel: ${channel_name}`);
    throw new Error("Forbidden: Unauthorized channel access");
  }

  // If authorization is successful, return user data or any other relevant information
  return {
    user_id: "12345",
    username: "testuser",
  };
};

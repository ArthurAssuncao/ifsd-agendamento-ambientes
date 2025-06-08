import { useSession } from "next-auth/react";

export function AccessToken() {
  const { data } = useSession();
  console.log("AccessToken data:", data);
  if (!data || !data.accessToken) {
    return <div>No access token available</div>;
  }
  const { accessToken } = data;

  return <div>Access Token: {accessToken}</div>;
}

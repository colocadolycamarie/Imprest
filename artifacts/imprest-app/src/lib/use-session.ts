import { getGetCurrentUserQueryKey, useGetCurrentUser } from '@workspace/api-client-react';

export function useSession() {
  const query = useGetCurrentUser({
    query: {
      queryKey: getGetCurrentUserQueryKey(),
      retry: false,
      // A 401 here just means "not signed in" — not a transient failure —
      // so don't keep this around as if it were cached user data.
      staleTime: 0,
    },
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    isSignedIn: Boolean(query.data) && !query.isError,
  };
}

'use client';
import { ApolloProvider } from '@apollo/client/react';
import { useMemo } from 'react';
import { createApolloClient } from '../lib/apollo-client';
import { useAuth } from '@clerk/nextjs';

export function ClerkApolloProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getToken } = useAuth();

  const client = useMemo(() => createApolloClient(getToken), [getToken]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

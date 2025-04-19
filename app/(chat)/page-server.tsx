import { cookies } from 'next/headers';
import PageClient from './page-client';

export default async function Page() {
  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');
  return <PageClient modelIdFromCookie={modelIdFromCookie?.value} />;
}

import { cookies } from 'next/headers';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SupabaseUserProvider } from '@/components/supabase-user-context';
import AppSidebarWithUser from '@/components/app-sidebar-with-user';
import ClientOnly from '@/components/client-only';
import Script from 'next/script';

export const experimental_ppr = true;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <SupabaseUserProvider>
        <SidebarProvider defaultOpen={!isCollapsed}>
          <ClientOnly>
            <AppSidebarWithUser />
          </ClientOnly>
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </SupabaseUserProvider>
    </>
  );
}

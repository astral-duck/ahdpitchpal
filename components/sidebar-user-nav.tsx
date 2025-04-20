'use client';
import { ChevronUp } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function SidebarUserNav({ user }: { user: any }) {
  const { setTheme, theme } = useTheme();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      if (!user) return setIsAdmin(false);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
      setIsAdmin(!!data);
    }
    checkAdmin();
  }, [user]);

  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="p-4 text-xs text-gray-500 text-center">
            Not logged in
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground h-10">
              <Image
                src={`https://avatar.vercel.sh/${user.email}`}
                alt={user.email ?? 'User Avatar'}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="truncate">{user?.email}</span>
              <ChevronUp className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            className="w-[--radix-popper-anchor-width]"
          >
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {`Toggle ${theme === 'light' ? 'dark' : 'light'} mode`}
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin" className={`w-full text-left ${isAdmin ? 'cursor-pointer' : 'opacity-50 pointer-events-none cursor-not-allowed'}`}>
                Admin Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <button
                type="button"
                className="w-full cursor-pointer"
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = '/login';
                }}
              >
                Sign out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

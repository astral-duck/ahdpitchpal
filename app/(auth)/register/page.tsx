'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';

import { register, type RegisterActionState } from '../actions';
import { toast } from '@/components/toast';

// This page is disabled. Registration is only allowed for admins via the dashboard.
export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Registration Disabled</h1>
      <p className="text-lg text-gray-600">Please contact your administrator to create an account.</p>
    </div>
  );
}

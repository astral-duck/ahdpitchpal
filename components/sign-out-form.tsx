import Form from 'next/form';

export const SignOutForm = () => {
  return (
    <form
      className="w-full"
      action={async () => {
        'use server';
        // Implement sign out logic here if needed
        window.location.href = '/login';
      }}
    >
      <button
        type="submit"
        className="w-full text-left px-1 py-0.5 text-red-500"
      >
        Sign out
      </button>
    </form>
  );
};

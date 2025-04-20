import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email, role } = await req.json();
    // Send invite (password setup) email
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    // Insert role if not already present
    const { error: roleError } = await supabaseAdmin.from('user_roles').upsert([
      { user_id: data.user.id, role: 'user' }, // Always default to 'user' role
    ], { onConflict: 'user_id' });
    if (roleError) return NextResponse.json({ error: 'Invite sent, but failed to assign role: ' + roleError.message }, { status: 400 });
    // Do NOT create a profile yet—user will fill out first/last name after accepting invite
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

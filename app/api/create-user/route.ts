import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();
    // Create user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { role },
    });
    console.log('User creation:', data);
    console.log('User creation error:', error);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Assign role in user_roles
    const { error: roleError, data: roleData } = await supabaseAdmin.from('user_roles').insert([
      { user_id: data.user.id, role },
    ]);
    console.log('Role insert error:', roleError);
    console.log('Role insert data:', roleData);

    if (roleError) return NextResponse.json({ error: 'User created, but failed to assign role: ' + roleError.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.log('Create user API exception:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

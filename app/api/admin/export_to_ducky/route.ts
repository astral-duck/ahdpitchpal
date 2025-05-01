import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const EXPORT_DIR = 'c:/ahdpitchpal/exports';
const EXPORT_FILE = path.join(EXPORT_DIR, 'training_export.txt');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { txt } = await req.json();
  // 1. Remove old .txt files
  if (!fs.existsSync(EXPORT_DIR)) fs.mkdirSync(EXPORT_DIR);
  for (const fname of fs.readdirSync(EXPORT_DIR)) {
    if (fname.endsWith('.txt')) fs.unlinkSync(path.join(EXPORT_DIR, fname));
  }
  // 2. Write new export file
  fs.writeFileSync(EXPORT_FILE, txt, 'utf8');
  // 3. Call the python upload script
  await new Promise((resolve, reject) => {
    exec('python c:/ahdpitchpal/upload_to_ducky.py', (err, stdout, stderr) => {
      if (err) reject(stderr);
      else resolve(stdout);
    });
  });
  // 4. Mark all pending corrections as completed
  await supabase
    .from('training_corrections')
    .update({ completed: true })
    .eq('completed', false);
  return NextResponse.json({ success: true });
}

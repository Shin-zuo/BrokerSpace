import { NextResponse } from 'next/server';
import { getSystemSettings } from '@/src/lib/systemSettings';

export async function GET() {
  try {
    const settings = await getSystemSettings();
    return NextResponse.json({
      success: true,
      data: {
        announcement_active: settings.announcement_active,
        announcement_banner: settings.announcement_banner,
        maintenance_mode: settings.maintenance_mode,
        maintenance_message: settings.maintenance_message,
        global_property_posting_enabled: settings.global_property_posting_enabled,
        global_messaging_enabled: settings.global_messaging_enabled,
        global_login_enabled: settings.global_login_enabled,
        global_registration_enabled: settings.global_registration_enabled,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

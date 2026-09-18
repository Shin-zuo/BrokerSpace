import { prisma } from './prisma';

export interface SystemSettingsMap {
  global_login_enabled: boolean;
  global_property_posting_enabled: boolean;
  global_messaging_enabled: boolean;
  global_registration_enabled: boolean;
  global_payments_enabled: boolean;
  maintenance_mode: boolean;
  maintenance_message: string;
  announcement_banner: string;
  announcement_active: boolean;
  default_max_listings: number;
}

export const DEFAULT_SYSTEM_SETTINGS: SystemSettingsMap = {
  global_login_enabled: true,
  global_property_posting_enabled: true,
  global_messaging_enabled: true,
  global_registration_enabled: true,
  global_payments_enabled: true,
  maintenance_mode: false,
  maintenance_message: 'BrokerSpace is currently undergoing scheduled maintenance. Please check back shortly.',
  announcement_banner: '',
  announcement_active: false,
  default_max_listings: 50,
};

/**
 * Retrieves all system settings from the database, falling back to defaults if not yet seeded
 */
export async function getSystemSettings(): Promise<SystemSettingsMap> {
  try {
    const rows = await prisma.systemSetting.findMany();
    const map: Record<string, string> = {};
    rows.forEach((r) => {
      map[r.key] = r.value;
    });

    return {
      global_login_enabled: map.global_login_enabled !== undefined ? map.global_login_enabled === 'true' : DEFAULT_SYSTEM_SETTINGS.global_login_enabled,
      global_property_posting_enabled: map.global_property_posting_enabled !== undefined ? map.global_property_posting_enabled === 'true' : DEFAULT_SYSTEM_SETTINGS.global_property_posting_enabled,
      global_messaging_enabled: map.global_messaging_enabled !== undefined ? map.global_messaging_enabled === 'true' : DEFAULT_SYSTEM_SETTINGS.global_messaging_enabled,
      global_registration_enabled: map.global_registration_enabled !== undefined ? map.global_registration_enabled === 'true' : DEFAULT_SYSTEM_SETTINGS.global_registration_enabled,
      global_payments_enabled: map.global_payments_enabled !== undefined ? map.global_payments_enabled === 'true' : DEFAULT_SYSTEM_SETTINGS.global_payments_enabled,
      maintenance_mode: map.maintenance_mode !== undefined ? map.maintenance_mode === 'true' : DEFAULT_SYSTEM_SETTINGS.maintenance_mode,
      maintenance_message: map.maintenance_message ?? DEFAULT_SYSTEM_SETTINGS.maintenance_message,
      announcement_banner: map.announcement_banner ?? DEFAULT_SYSTEM_SETTINGS.announcement_banner,
      announcement_active: map.announcement_active !== undefined ? map.announcement_active === 'true' : DEFAULT_SYSTEM_SETTINGS.announcement_active,
      default_max_listings: map.default_max_listings !== undefined ? Number(map.default_max_listings) : DEFAULT_SYSTEM_SETTINGS.default_max_listings,
    };
  } catch (error) {
    console.error('Failed to load system settings from DB, using defaults:', error);
    return DEFAULT_SYSTEM_SETTINGS;
  }
}

/**
 * Quick boolean check for a specific feature key
 */
export async function isFeatureEnabled(key: keyof SystemSettingsMap): Promise<boolean> {
  const settings = await getSystemSettings();
  const value = settings[key];
  return typeof value === 'boolean' ? value : true;
}

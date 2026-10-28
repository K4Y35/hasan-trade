export const THEME_IDS = ['CLASSIC', 'MODERN', 'BOLD'] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export const STORAGE_DRIVERS = ['local', 'minio', 's3'] as const;
export type StorageDriverName = (typeof STORAGE_DRIVERS)[number];

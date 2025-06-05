
import { useSettings as useModularSettings } from './settings';

// Re-export the new implementation to maintain backward compatibility
export const useSettings = useModularSettings;

// Also re-export the types to maintain compatibility
export type { SettingsState } from './settings/types';

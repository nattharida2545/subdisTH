
export interface SettingsState {
  [key: string]: any;
}

export type SettingItem = {
  key: string;
  value: any;
  category?: string;
};

export type SettingUpdate = {
  category: string;
  key: string;
  value: any;
};

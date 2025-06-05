
import React from 'react';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import {
  Slider
} from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Volume2, Play } from 'lucide-react';
import { TextToSpeechConfig } from './types';

interface TextToSpeechSettingsProps {
  ttsConfig: TextToSpeechConfig;
  isEditing: boolean;
  handleTtsConfigChange: (field: keyof TextToSpeechConfig, value: any) => void;
}

const TextToSpeechSettings: React.FC<TextToSpeechSettingsProps> = ({
  ttsConfig,
  isEditing,
  handleTtsConfigChange
}) => {
  const testVoice = () => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance();
      msg.text = 'ทดสอบเสียงประกาศภาษาไทย ระบบคิวห้องยาโรงพยาบาลชุมชนตัวอย่าง';
      msg.lang = ttsConfig.language;
      msg.volume = ttsConfig.volume;
      msg.rate = ttsConfig.rate;
      
      // Find Thai voice if available
      const voices = window.speechSynthesis.getVoices();
      const thaiVoice = voices.find(voice => 
        voice.lang.includes('th') || 
        voice.lang.includes('TH')
      );
      
      if (thaiVoice) {
        msg.voice = thaiVoice;
      }
      
      window.speechSynthesis.speak(msg);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>การตั้งค่าเสียงประกาศ</CardTitle>
        <CardDescription>
          กำหนดค่าเสียงประกาศสำหรับการเรียกคิว
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="font-medium">เปิดใช้งานเสียงประกาศ</div>
            <div className="text-sm text-gray-500">
              เปิดหรือปิดการประกาศเรียกคิวด้วยเสียง
            </div>
          </div>
          <Switch 
            checked={ttsConfig.enabled}
            disabled={!isEditing}
            onCheckedChange={(checked) => handleTtsConfigChange('enabled', checked)}
          />
        </div>

        <div className="space-y-2">
          <div className="font-medium">ภาษาของเสียงประกาศ</div>
          <Select 
            value={ttsConfig.language}
            disabled={!isEditing || !ttsConfig.enabled}
            onValueChange={(value) => handleTtsConfigChange('language', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="เลือกภาษา" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="th-TH">ภาษาไทย</SelectItem>
              <SelectItem value="en-US">English (US)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="font-medium">ระดับความดัง</div>
          <div className="flex items-center gap-4">
            <Volume2 className="w-4 h-4 text-gray-500" />
            <Slider
              value={[ttsConfig.volume * 100]}
              min={0}
              max={100}
              step={5}
              disabled={!isEditing || !ttsConfig.enabled}
              onValueChange={(values) => handleTtsConfigChange('volume', values[0] / 100)}
              className="flex-1"
            />
            <span className="text-sm w-10 text-right">{Math.round(ttsConfig.volume * 100)}%</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="font-medium">ความเร็วในการพูด</div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">ช้า</span>
            <Slider
              value={[ttsConfig.rate * 50]} // normalize to 0-100 range
              min={25}
              max={100}
              step={5}
              disabled={!isEditing || !ttsConfig.enabled}
              onValueChange={(values) => handleTtsConfigChange('rate', values[0] / 50)} 
              className="flex-1"
            />
            <span className="text-sm text-gray-500">เร็ว</span>
            <span className="text-sm w-10 text-right">{(ttsConfig.rate).toFixed(1)}x</span>
          </div>
        </div>

        {!isEditing && ttsConfig.enabled && (
          <Button 
            variant="outline" 
            onClick={testVoice}
            className="w-full"
          >
            <Play className="h-4 w-4 mr-2" />
            ทดสอบเสียงประกาศ
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default TextToSpeechSettings;


import React from 'react';
import { Input } from '@/components/ui/input';
import { FormLabel } from '@/components/ui/form';
import { AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LineSettings, LineSettingsErrors } from './types';

interface LineCredentialFieldsProps {
  lineSettings: LineSettings;
  isEditing: boolean;
  handleChange: (field: keyof LineSettings, value: string) => void;
  errors?: LineSettingsErrors;
}

const LineCredentialFields: React.FC<LineCredentialFieldsProps> = ({
  lineSettings,
  isEditing,
  handleChange,
  errors = {}
}) => {
  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-medium">LINE Messaging API Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center">
              <FormLabel>Channel ID (Messaging API)</FormLabel>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertCircle className="h-4 w-4 text-gray-400 ml-2 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-56 text-xs">Channel ID พบได้ใน LINE Developer Console ในส่วน Channel ของ Messaging API</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input 
              value={lineSettings.channelId} 
              onChange={(e) => handleChange('channelId', e.target.value)}
              disabled={!isEditing} 
              className={!isEditing ? "bg-gray-50" : errors.channelId ? "border-red-500" : ""}
            />
            {isEditing && errors.channelId && (
              <p className="text-red-500 text-xs mt-1">{errors.channelId}</p>
            )}
          </div>
          
          <div>
            <div className="flex items-center">
              <FormLabel>Channel Secret (Messaging API)</FormLabel>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertCircle className="h-4 w-4 text-gray-400 ml-2 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-56 text-xs">Channel Secret พบได้ใน LINE Developer Console ในส่วน Basic settings ของ Messaging API</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input 
              value={isEditing ? lineSettings.channelSecret : "••••••••••••••••••••••"} 
              onChange={(e) => handleChange('channelSecret', e.target.value)}
              type={isEditing ? "text" : "password"}
              disabled={!isEditing} 
              className={!isEditing ? "bg-gray-50" : errors.channelSecret ? "border-red-500" : ""}
            />
            {isEditing && errors.channelSecret && (
              <p className="text-red-500 text-xs mt-1">{errors.channelSecret}</p>
            )}
          </div>
        </div>
        
        <div>
          <div className="flex items-center">
            <FormLabel>Access Token (Messaging API)</FormLabel>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertCircle className="h-4 w-4 text-gray-400 ml-2 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-72 text-xs">Access Token (long-lived) พบได้ใน LINE Official Account Manager ที่ Settings &gt; Messaging API ในส่วน &quot;Channel access token&quot;</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input 
            value={isEditing ? lineSettings.accessToken : "••••••••••••••••••••••••••••••••••••••••••••••••••"}
            onChange={(e) => handleChange('accessToken', e.target.value)}
            type={isEditing ? "text" : "password"}
            disabled={!isEditing} 
            className={!isEditing ? "bg-gray-50" : errors.accessToken ? "border-red-500" : ""}
          />
          {isEditing && errors.accessToken && (
            <p className="text-red-500 text-xs mt-1">{errors.accessToken}</p>
          )}
        </div>
      </div>

      <div className="space-y-4 border-t pt-4">
        <h3 className="text-lg font-medium">LINE Login Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center">
              <FormLabel>Login Channel ID</FormLabel>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertCircle className="h-4 w-4 text-gray-400 ml-2 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-56 text-xs">Channel ID สำหรับ LINE Login (แยกจาก Messaging API)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input 
              value={lineSettings.loginChannelId || ''} 
              onChange={(e) => handleChange('loginChannelId', e.target.value)}
              disabled={!isEditing} 
              className={!isEditing ? "bg-gray-50" : errors.loginChannelId ? "border-red-500" : ""}
            />
            {isEditing && errors.loginChannelId && (
              <p className="text-red-500 text-xs mt-1">{errors.loginChannelId}</p>
            )}
          </div>
          
          <div>
            <div className="flex items-center">
              <FormLabel>Login Channel Secret</FormLabel>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertCircle className="h-4 w-4 text-gray-400 ml-2 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-56 text-xs">Channel Secret สำหรับ LINE Login</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input 
              value={isEditing ? (lineSettings.loginChannelSecret || '') : "••••••••••••••••••••••"} 
              onChange={(e) => handleChange('loginChannelSecret', e.target.value)}
              type={isEditing ? "text" : "password"}
              disabled={!isEditing} 
              className={!isEditing ? "bg-gray-50" : errors.loginChannelSecret ? "border-red-500" : ""}
            />
            {isEditing && errors.loginChannelSecret && (
              <p className="text-red-500 text-xs mt-1">{errors.loginChannelSecret}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormLabel>Callback URL</FormLabel>
            <Input 
              value={lineSettings.callbackUrl || ''} 
              onChange={(e) => handleChange('callbackUrl', e.target.value)}
              disabled={!isEditing} 
              className={!isEditing ? "bg-gray-50" : errors.callbackUrl ? "border-red-500" : ""}
            />
            {isEditing && errors.callbackUrl && (
              <p className="text-red-500 text-xs mt-1">{errors.callbackUrl}</p>
            )}
          </div>
          
          <div>
            <FormLabel>LIFF ID</FormLabel>
            <Input 
              value={lineSettings.liffId || ''} 
              onChange={(e) => handleChange('liffId', e.target.value)}
              disabled={!isEditing} 
              className={!isEditing ? "bg-gray-50" : ""}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default LineCredentialFields;

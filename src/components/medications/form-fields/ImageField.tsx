import * as React from 'react';
import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { MedicationFormValues } from '../schemas/medicationSchema';
import { Button } from '@/components/ui/button';
import { ImageIcon, X } from 'lucide-react';

interface ImageFieldProps {
  control: Control<MedicationFormValues>;
}

export const ImageField: React.FC<ImageFieldProps> = ({ control }) => {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const inputUid = React.useId();

  return (
    <FormField
      control={control}
      name="image"
      render={({ field: { value, onChange, ...fieldProps } }) => {
        // Set preview URL when component mounts or value changes
        React.useEffect(() => {
          if (typeof value === 'string' && value.trim() !== '') {
            setPreviewUrl(value);
          }
        }, [value]);

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;

          // Store the file in the form value
          onChange(file);

          // Create a preview URL
          const objectUrl = URL.createObjectURL(file);
          setPreviewUrl(objectUrl);
        };
        
        // Clean up object URLs when component unmounts
        React.useEffect(() => {
          return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
              URL.revokeObjectURL(previewUrl);
            }
          };
        }, [previewUrl]);

        const handleRemoveImage = () => {
          onChange(null);
          setPreviewUrl(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        };

        // No need for a manual click handler when using a label htmlFor

        return (
          <FormItem>
            <FormLabel>รูปภาพ</FormLabel>
            <FormControl>
              <div className="space-y-2">
                <input
                  id={`medication-image-input-${inputUid}`}
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="sr-only"
                  name={fieldProps.name}
                  onBlur={fieldProps.onBlur}
                />
                <label htmlFor={`medication-image-input-${inputUid}`} className="w-full">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="w-4 h-4" />
                    อัพโหลดรูปภาพ
                  </Button>
                </label>
                
                {previewUrl && (
                  <div className="relative mt-2">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-auto max-h-48 object-contain rounded-md border" 
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

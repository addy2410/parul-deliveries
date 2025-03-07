
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Image, Upload } from 'lucide-react';

// Define the form schema
const shopFormSchema = z.object({
  name: z.string().min(3, 'Shop name must be at least 3 characters'),
  location: z.string().min(5, 'Location must be at least 5 characters'),
  description: z.string().optional(),
  cuisine: z.string().min(2, 'Cuisine type is required'),
});

type ShopFormValues = z.infer<typeof shopFormSchema>;

interface ShopRegistrationProps {
  vendorId: string;
  onComplete: () => void;
}

const ShopRegistration: React.FC<ShopRegistrationProps> = ({ vendorId, onComplete }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shopImage, setShopImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form
  const form = useForm<ShopFormValues>({
    resolver: zodResolver(shopFormSchema),
    defaultValues: {
      name: '',
      location: '',
      description: '',
      cuisine: '',
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setShopImage(file);
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const uploadImage = async (file: File, shopId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${shopId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('shop_images')
        .upload(fileName, file);
      
      if (error) {
        console.error('Error uploading image:', error);
        throw error;
      }

      // Get public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('shop_images')
        .getPublicUrl(fileName);
        
      return publicUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Failed to upload shop image');
      return null;
    }
  };

  const onSubmit = async (data: ShopFormValues) => {
    setIsSubmitting(true);
    console.log("Submitting shop data for vendor:", vendorId);
    
    try {
      // Insert shop data into Supabase
      const { data: shop, error } = await supabase
        .from('shops')
        .insert([
          {
            vendor_id: vendorId,
            name: data.name,
            location: data.location,
            description: data.description || '',
            cuisine: data.cuisine,
            tags: [data.cuisine],
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error registering shop:', error);
        toast.error('Failed to register shop: ' + error.message);
        return;
      }

      // Upload image if selected
      if (shopImage && shop) {
        const imageUrl = await uploadImage(shopImage, shop.id);
        if (imageUrl) {
          // Update shop with image URL
          const { error: updateError } = await supabase
            .from('shops')
            .update({ image_url: imageUrl })
            .eq('id', shop.id);
            
          if (updateError) {
            console.error('Error updating shop with image:', updateError);
            toast.error('Shop created but image could not be saved');
          }
        }
      }

      console.log("Shop registered successfully:", shop);
      toast.success('Shop registered successfully!');
      onComplete();
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 shadow-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shop Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your shop name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your shop location on campus" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cuisine"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cuisine Type</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Italian, Chinese, Fast Food" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe your shop and what makes it special" 
                    className="resize-none min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormLabel htmlFor="shop-image">Shop Image</FormLabel>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors ${
                previewUrl ? 'border-green-300' : 'border-gray-300'
              }`}
              onClick={triggerFileInput}
            >
              <input
                type="file"
                id="shop-image"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageSelect}
              />
              
              {previewUrl ? (
                <div className="flex flex-col items-center">
                  <img 
                    src={previewUrl} 
                    alt="Shop preview" 
                    className="mb-2 max-h-40 object-contain rounded-md" 
                  />
                  <p className="text-sm text-gray-500">Click to change image</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Image className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-500">Click to upload shop image</p>
                  <p className="text-sm text-gray-400 mt-1">Recommended: 500x300 pixels</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting} className="bg-vendor-600 hover:bg-vendor-700">
              {isSubmitting ? 'Registering...' : 'Register Shop'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default ShopRegistration;

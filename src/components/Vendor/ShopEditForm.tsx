
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

// Define the form schema
const shopEditFormSchema = z.object({
  name: z.string().min(3, 'Shop name must be at least 3 characters'),
  location: z.string().min(5, 'Location must be at least 5 characters'),
});

type ShopEditFormValues = z.infer<typeof shopEditFormSchema>;

interface ShopEditFormProps {
  shopId: string;
  initialData: {
    name: string;
    location: string;
  };
  onComplete: () => void;
}

const ShopEditForm: React.FC<ShopEditFormProps> = ({ shopId, initialData, onComplete }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with initial data
  const form = useForm<ShopEditFormValues>({
    resolver: zodResolver(shopEditFormSchema),
    defaultValues: {
      name: initialData.name || '',
      location: initialData.location || '',
    },
  });

  const onSubmit = async (data: ShopEditFormValues) => {
    setIsSubmitting(true);
    console.log("Updating shop data for shop:", shopId);
    
    try {
      // Update shop data in Supabase
      const { data: shop, error } = await supabase
        .from('shops')
        .update({
          name: data.name,
          location: data.location,
        })
        .eq('id', shopId)
        .select()
        .single();

      if (error) {
        console.error('Error updating shop:', error);
        toast.error('Failed to update shop: ' + error.message);
        return;
      }

      console.log("Shop updated successfully:", shop);
      toast.success('Shop updated successfully!');
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

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting} className="bg-vendor-600 hover:bg-vendor-700">
              {isSubmitting ? 'Updating...' : 'Update Shop'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default ShopEditForm;


import React, { useState } from 'react';
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

  const onSubmit = async (data: ShopFormValues) => {
    setIsSubmitting(true);
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
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error registering shop:', error);
        toast.error('Failed to register shop. Please try again.');
        return;
      }

      toast.success('Shop registered successfully!');
      onComplete();
    } catch (error) {
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

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register Shop'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default ShopRegistration;

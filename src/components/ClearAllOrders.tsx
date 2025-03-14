
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cleanupAllOrders } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function ClearAllOrders() {
  const [isClearing, setIsClearing] = useState(false);

  const handleClearAllOrders = async () => {
    setIsClearing(true);
    try {
      const result = await cleanupAllOrders();
      
      if (result.success) {
        toast.success("Successfully cleared all active orders!");
        console.log("Orders cleared:", result.data);
      } else {
        toast.error("Failed to clear orders");
      }
    } catch (error) {
      console.error("Error clearing orders:", error);
      toast.error("An error occurred while clearing orders");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          className="w-full sm:w-auto"
        >
          Clear All Active Orders
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will mark ALL active orders as "delivered". This is irreversible and will remove all orders from all restaurant active order lists.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleClearAllOrders();
            }}
            disabled={isClearing}
          >
            {isClearing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Clearing...
              </>
            ) : (
              "Yes, clear all orders"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

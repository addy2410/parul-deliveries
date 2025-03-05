
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";

const DeleteEmptyShop = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDeleteEmptyShops = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-empty-shop');
      
      if (error) {
        toast.error("Failed to delete empty shops: " + error.message);
        setResult("Error: " + error.message);
        return;
      }
      
      if (data.success) {
        toast.success(data.message);
        setResult("Success: " + data.message);
      } else {
        toast.error("Operation failed: " + data.error);
        setResult("Error: " + data.error);
      }
    } catch (error: any) {
      console.error("Failed to delete empty shops:", error);
      toast.error("An unexpected error occurred");
      setResult("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>
        
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Delete Empty Shops</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              This utility will delete any empty "Santushti Shakes" shops that don't have any menu items.
            </p>
            
            <Button 
              onClick={handleDeleteEmptyShops} 
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Processing..." : "Delete Empty Shops"}
            </Button>
            
            {result && (
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <p>{result}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeleteEmptyShop;

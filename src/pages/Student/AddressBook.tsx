
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, MapPin, ArrowLeft, Trash2 } from "lucide-react";
import StudentHeader from "@/components/StudentHeader";
import { Separator } from "@/components/ui/separator";

const AddressBook = () => {
  const [addresses, setAddresses] = useState(() => {
    const saved = localStorage.getItem("savedAddresses");
    return saved ? JSON.parse(saved) : [
      { id: "addr-1", label: "Home", address: "Block-A, Boys Hostel, Parul University Campus, Vadodara" },
      { id: "addr-2", label: "College", address: "Parul Institute of Engineering, Parul University, Vadodara" }
    ];
  });
  
  const deleteAddress = (id: string) => {
    const updatedAddresses = addresses.filter((addr: any) => addr.id !== id);
    setAddresses(updatedAddresses);
    localStorage.setItem("savedAddresses", JSON.stringify(updatedAddresses));
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/student/restaurants" className="flex items-center gap-1">
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </Button>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Address Book</h1>
          
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Saved Addresses</CardTitle>
            </CardHeader>
            <CardContent>
              {addresses.length > 0 ? (
                <div className="space-y-4">
                  {addresses.map((addr: any) => (
                    <div key={addr.id} className="flex items-start justify-between border p-3 rounded-md">
                      <div className="flex items-start gap-3">
                        <MapPin className="text-muted-foreground mt-1" size={18} />
                        <div>
                          <h3 className="font-medium">{addr.label}</h3>
                          <p className="text-sm text-muted-foreground">{addr.address}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => deleteAddress(addr.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">You don't have any saved addresses yet.</p>
                </div>
              )}
              
              <Separator className="my-4" />
              
              <Button 
                className="w-full bg-[#ea384c] hover:bg-[#d02e40]"
                asChild
              >
                <Link to="/student/address/new" className="flex items-center justify-center gap-2">
                  <Plus size={16} />
                  Add New Address
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddressBook;

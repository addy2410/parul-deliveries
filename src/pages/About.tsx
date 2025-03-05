
import React from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-purple-50">
      <Container className="py-12">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold text-center text-purple-900">About CampusGrub</h1>
          
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-purple-800">Made By Parul University Dropout Student</h2>
            <h3 className="text-lg font-medium mb-4 text-purple-700">Aditya Mishra</h3>
            
            <p className="text-gray-700 mb-4">
              CampusGrub was created to solve the problem of food delivery within the campus. 
              Students often struggle to get food from different food courts and vendors across the campus, 
              especially during busy hours or when they're studying.
            </p>
            
            <p className="text-gray-700 mb-4">
              Our platform connects students with campus food vendors, making it easy to browse menus, 
              place orders, and get food delivered right to your location within the campus.
            </p>
            
            <p className="text-gray-700 mb-4">
              For vendors, CampusGrub provides a simple way to reach more students, manage orders, 
              and grow their business without investing in their own delivery infrastructure.
            </p>
            
            <h3 className="text-lg font-medium mt-8 mb-4 text-purple-700">Our Mission</h3>
            <p className="text-gray-700">
              To make campus dining more convenient, efficient, and enjoyable for everyone in the 
              Parul University community.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default About;

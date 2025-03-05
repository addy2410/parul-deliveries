
import React from "react";
import { Container } from "@/components/ui/container";
import RoleSelection from "@/components/RoleSelection";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center py-10 px-4"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mt-6 text-gray-800">
            Parul In Campus Delivery
          </h1>
          <p className="mt-4 text-gray-600 max-w-xl mx-auto">
            Order food from your favorite campus eateries and get it delivered right to your location.
          </p>
        </motion.div>

        <Container className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-4xl">
            <RoleSelection />
          </div>
        </Container>
      </main>
    </div>
  );
};

export default Index;

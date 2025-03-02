
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Cpu, Users, Rocket, Heart, Coffee, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <div className="min-h-screen purple-pattern flex flex-col">
      {/* Header with back button */}
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <Button variant="outline" size="sm" asChild>
            <Link to="/student/restaurants">
              <ArrowLeft size={16} className="mr-1" /> Back to Restaurants
            </Link>
          </Button>
          <h1 className="text-xl font-bold text-purple-800">Campus Eats</h1>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-block mb-6 bg-purple-100 p-3 rounded-2xl">
              <GraduationCap className="h-10 w-10 text-purple-700" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-purple-900">
              A Startup by Students, For Students
            </h1>
            <p className="text-lg text-purple-800 mb-8">
              Campus Eats was created by the talented students of Parul University, Vadodara
              as a solution to make campus dining easier, faster, and more enjoyable.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-full font-medium shadow-lg"
            >
              <Heart className="h-5 w-5" />
              Made with love in Vadodara
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Fun Features Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Rocket className="h-8 w-8 text-purple-600" />,
                title: "Student Initiative",
                description: "Born from a hackathon project, this app is entirely created and maintained by Parul University students."
              },
              {
                icon: <Users className="h-8 w-8 text-purple-600" />,
                title: "For The Community",
                description: "Designed to solve real problems faced by students and local food vendors on campus."
              },
              {
                icon: <Cpu className="h-8 w-8 text-purple-600" />,
                title: "Tech Innovation",
                description: "Built using cutting-edge technologies to deliver a seamless food ordering experience."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-purple-900">{feature.title}</h3>
                <p className="text-purple-700">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section with Playful Elements */}
      <section className="py-16 px-4 relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-24 h-24 bg-purple-400 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-pink-400 rounded-full"></div>
          <div className="absolute top-40 right-40 w-16 h-16 bg-yellow-400 rounded-full"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-purple-900">Meet Our Amazing Team</h2>
            <p className="text-purple-700">
              Passionate students from different departments working together to bring you the best campus food ordering experience.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-5 text-center shadow-md"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold">
                  PU
                </div>
                <h3 className="text-lg font-semibold text-purple-900">Parul Student {index + 1}</h3>
                <p className="text-sm text-purple-600">Computer Science • 2024</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fun Facts Section with Coffee Animation */}
      <section className="py-12 px-4 bg-gradient-to-r from-purple-100 to-pink-100">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:w-1/2 mb-8 md:mb-0"
            >
              <h2 className="text-2xl font-bold mb-4 text-purple-900">Fun Facts</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-purple-200 p-2 rounded-full mr-3">
                    <Coffee className="h-5 w-5 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-purple-800">This project was fueled by over 150 cups of coffee during development</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-purple-200 p-2 rounded-full mr-3">
                    <Cpu className="h-5 w-5 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-purple-800">Our first prototype was built in just 48 hours during a campus hackathon</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-purple-200 p-2 rounded-full mr-3">
                    <Users className="h-5 w-5 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-purple-800">We interviewed over 200 fellow students to understand their food ordering needs</p>
                  </div>
                </li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:w-2/5"
            >
              <img 
                src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7" 
                alt="Team coding session" 
                className="rounded-lg shadow-xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-purple-900 text-white py-8 px-4 mt-auto">
        <div className="container mx-auto text-center">
          <p className="mb-4">© 2024 Campus Eats - A Parul University Student Project</p>
          <div className="flex justify-center space-x-4">
            <Link to="/student/restaurants" className="hover:text-purple-300 transition-colors">Home</Link>
            <Link to="/" className="hover:text-purple-300 transition-colors">Sign In</Link>
            <a href="#" className="hover:text-purple-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;

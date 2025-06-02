"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

export default function PremierFacilities() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(0)

  const facilities = [
    {
      title: "AI-Powered Auto-Linking",
      description: "Intelligent system that automatically suggests connections between your documents and ideas.",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      fallbackImage: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2274&q=80",
      cta: "Learn More",
    },
    {
      title: "Semantic Search Engine",
      description: "Advanced search capabilities that understand context and meaning, not just keywords.",
      image: "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      fallbackImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      cta: "Explore",
    },
    {
      title: "Interactive Knowledge Graphs",
      description: "Visualize connections and relationships between your ideas with dynamic graph networks.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      fallbackImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2415&q=80",
      cta: "Try Now",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-gray-50 px-10">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-amber-800 font-medium">Intelligence</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">AI-Powered Core Features</h2>
          <p className="text-gray-700">Transforming Knowledge Management</p>
        </motion.div>

        <div className="flex flex-wrap -mx-4">
          {facilities.map((facility, index) => (
            <div key={index} className="w-full md:w-1/3 px-4 mb-8">
              <motion.div
                className="bg-white p-10 rounded-lg shadow-md flex flex-col relative overflow-hidden h-auto"
                onHoverStart={() => setHoveredCard(index)}
                onHoverEnd={() => setHoveredCard(index === 0 ? 0 : null)}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div
                  className={`transition-all duration-500 ease-in-out ${
                    hoveredCard === index ? "opacity-100 h-48 mb-4" : "opacity-0 h-0 overflow-hidden"
                  }`}
                >
                  <img
                    src={facility.image}
                    alt={facility.title}
                    className="w-full h-full rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.src = facility.fallbackImage;
                    }}
                  />
                </div>

                <div className="transition-all duration-500 ease-in-out">
                  <div className="bg-black p-2 rounded w-fit mb-4">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-white"
                    >
                      <path
                        d="M21 16.0002V7.9992L12 2L3 7.9992V16.0002L12 22L21 16.0002Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>


                  <h3 className="text-xl font-bold mb-3">{facility.title}</h3>
                  <p className="text-gray-700 mb-4">{facility.description}</p>

                  <div className="mt-2">
                    <Button variant="link" className="flex items-center gap-1 p-0 h-auto text-black hover:text-amber-800">
                      {facility.cta} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

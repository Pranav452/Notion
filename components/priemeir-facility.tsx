"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

export default function PremierFacilities() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(0)

  const facilities = [
    {
      title: "State-of-the-Art Infrastructure",
      description: "200+ bed training hospital for hands-on experience.",
      image: "/prg1.png",
      cta: "Learn More",
    },
    {
      title: "Advanced Learning Resources",
      description: "Skill labs and a well-stocked library available for comprehensive learning and research.",
      image: "/prg2.png",
      cta: "Explore",
    },
    {
      title: "Innovative Technology for Training",
      description: "Computer labs and modern simulation labs enhance learning with  equipment.",
      image: "/prg3.png",
      cta: "Join Us",
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
          <span className="text-amber-800 font-medium">Empowering</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Our Premier Facilities</h2>
          <p className="text-gray-700">Equipping Students for Success</p>
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
                    src={facility.image || "/placeholder.svg"}
                    alt={facility.title}
                    className="w-full h-full rounded-lg object-cover"
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

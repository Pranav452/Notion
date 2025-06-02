"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function Events() {
  const [animationProgress, setAnimationProgress] = useState(0)

  // Events data with AI Knowledge Workspace content
  const events = [
    {
      title: "AI Auto-Linking Launch",
      description:
        "The revolutionary AI Auto-Linking feature was unveiled, transforming how users connect ideas across their knowledge base. This intelligent system automatically suggests relevant connections between documents and concepts.",
      hasLearnMore: true,
    },
    {
      title: "Semantic Search Beta",
      description:
        "Our advanced Semantic Search engine entered beta testing, allowing users to find content based on meaning and context rather than just keywords. Early users reported 300% improvement in content discovery.",
      hasLearnMore: false,
    },
    {
      title: "Knowledge Graph Visualization",
      description:
        "The interactive Knowledge Graph feature launched, providing users with dynamic visual representations of their content relationships. This powerful tool helps identify knowledge gaps and unexpected connections.",
      hasLearnMore: false,
    },
    {
      title: "Join the AI Revolution",
      description:
        "Be part of the future of knowledge management. Experience intelligent content organization, semantic discovery, and collaborative AI features that transform how you work with information.",
      hasLearnMore: false,
    },
  ]

  // Animation for the flowing beam
  useEffect(() => {
    // Animation duration in ms (20 seconds for full cycle)
    const animationDuration = 20000;
    const animationInterval = 30; // Update interval in ms for smoother animation
    
    let startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed % animationDuration) / animationDuration;
      setAnimationProgress(progress);
      
      // Reset start time after a full cycle
      if (elapsed >= animationDuration) {
        startTime = Date.now();
      }
    }, animationInterval);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 md:py-24 bg-white px-10">
      <div className="container">
        <div className="flex flex-col md:flex-row gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="w-full md:w-1/3"
          >
            <span className="text-gray-700 font-medium">Innovation</span>
            <h2 className="text-3xl md:text-4xl font-bold my-4">Recent AI Feature Releases</h2>
            <div className="flex gap-4">
              <Button variant="outline" className="bg-gray-200 hover:bg-gray-300 border-0">
                Learn More
              </Button>
              <Button className="bg-black hover:bg-gray-800 text-white">Try Features</Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="w-full md:w-2/3"
          >
            <div className="space-y-12 relative">
              {/* Timeline vertical line */}
              <div className="absolute left-4 top-4 bottom-4 w-[2px] bg-gray-200"></div>

              {/* Flowing animated beam */}
              <div className="absolute left-4 w-[2px] overflow-hidden z-0" style={{
                top: "4rem",
                bottom: "4rem",
              }}>
                <div 
                  className="absolute w-full bg-amber-400"
                  style={{
                    top: `${-100 + animationProgress * 200}%`,
                    height: "40%",
                    boxShadow: "0px 0px 8px 2px rgba(245, 158, 11, 0.3)",
                    opacity: 0.9,
                  }}
                />
              </div>

              {events.map((event, index) => {
                // Calculate whether the beam is currently passing this event
                const eventPosition = index / (events.length - 1);
                // Narrower highlight window for more precise highlighting
                const isHighlighted = Math.abs(animationProgress - eventPosition) < 0.05;
                
                return (
                  <div key={index} className="flex gap-8">
                    <div className="relative z-10">
                      <motion.div
                        className={`p-2 rounded transition-colors duration-300 ${
                          isHighlighted ? "bg-amber-600" : "bg-black"
                        }`}
                        whileHover={{ scale: 1.1 }}
                        animate={
                          isHighlighted
                            ? {
                                boxShadow: [
                                  "0px 0px 0px rgba(217, 119, 6, 0)",
                                  "0px 0px 10px rgba(217, 119, 6, 0.5)",
                                  "0px 0px 0px rgba(217, 119, 6, 0)",
                                ],
                              }
                            : {}
                        }
                        transition={{ duration: 1.5, repeat: isHighlighted ? Number.POSITIVE_INFINITY : 0 }}
                      >
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
                      </motion.div>
                    </div>
                    <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }} className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                      <p className="text-gray-700 mb-2">{event.description}</p>
                      {event.hasLearnMore && (
                        <Button variant="link" className="p-0 h-auto text-amber-800 hover:text-amber-900">
                          Learn More
                        </Button>
                      )}
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

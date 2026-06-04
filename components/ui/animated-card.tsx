"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  delay?: number
  staggerChildren?: boolean
}

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.98,
  },
  visible: (customDelay: number) => ({
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 260,
      damping: 20,
      delay: customDelay,
      duration: 0.5
    }
  })
}

export function AnimatedCard({ 
  children, 
  className, 
  delay = 0,
  staggerChildren = false,
  ...props 
}: AnimatedCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      custom={delay}
      className={cn("will-change-transform", className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

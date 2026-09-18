import React from "react";
import { motion } from "framer-motion";

export const PageContainer = ({
  children,
  className = "",
  maxWidth = "max-w-7xl",
}) => {
  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className={`flex-1 w-full px-4 sm:px-8 py-6 lg:py-8 ${maxWidth} mx-auto ${className}`}
    >
      {children}
    </motion.main>
  );
};

export default PageContainer;


import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import GhibliTransformer from '../components/GhibliTransformer';

const Ghibli = () => {
  return (
    <Layout>
      <div className="container px-4 mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Transform Images to Ghibli Style
            </span>
          </h1>
          <p className="text-gray-300 max-w-3xl mx-auto">
            Upload any image and our AI will analyze it in detail, then transform it into the 
            enchanting Studio Ghibli animation style with magical environments and whimsical elements.
          </p>
        </motion.div>

        <GhibliTransformer />
      </div>
    </Layout>
  );
};

export default Ghibli;

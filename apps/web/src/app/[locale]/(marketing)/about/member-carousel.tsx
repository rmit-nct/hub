'use client';

import { members } from './data';
import MemberCard from './member-card';
import { motion } from 'framer-motion';
import { useState } from 'react';


export default function MemberCarousel() {
  const [positionIndexes, setPositionIndexes] = useState([0, 1, 2, 3, 4]);

  const handleNext = () => {
    setPositionIndexes((prevIndexes) => {
      const updatedIndexes = prevIndexes.map(
        (prevIndex) => (prevIndex + 1) % 5
      );
      return updatedIndexes;
    });
  };

  const handleBack = () => {
    setPositionIndexes((prevIndexes) => {
      const updatedIndexes = prevIndexes.map(
        (prevIndex) => (prevIndex + 4) % 5
      );
      return updatedIndexes;
    });
  };

  const positions = ['center', 'left1', 'left', 'right', 'right1'];

  const imageVariants = {
    center: {
      x: '0%',
      scale: 1,
      zIndex: 5,
      filter: 'grayscale(0%) blur(0px)'
    },
    left1: {
      x: '-50%',
      scale: 0.7,
      zIndex: 3,
      filter: ' blur(5px)',
    },
    left: {
      x: '-90%',
      scale: 0.5,
      zIndex: 2,
      filter: ' blur(10px)',
    },
    right: {
      x: '90%',
      scale: 0.5,
      zIndex: 1,
      filter: 'blur(10px) ',
    },
    right1: {
      x: '50%',
      scale: 0.7,
      zIndex: 3,
      filter: 'blur(5px)',
    },
  };
  return (
    <div className="relative bg-transparent flex h-screen w-full flex-col items-center justify-center">
      {members.map((mem, index) => (
        <motion.div
          key={index}
          className="rounded-[12px]"
          initial="center"
          animate={positions[positionIndexes[index] as number]}
          variants={imageVariants}
          transition={{ duration: 0.5 }}
          style={{ width: '40%', position: 'absolute' }}
        >
          <MemberCard name={mem.name} role={mem.role} image={mem.image} center={positions[positionIndexes[index] as number] === 'center'} />
        </motion.div>
      ))}
      <div className="z-50 flex w-full flex-row justify-center items-center gap-[400px]">


        <div
          className="h-fit py-5 rounded-lg shadow-lg backdrop-blur-md bg-white/40 border border-white/30"
          onClick={handleBack}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="full" fill="currentColor"><path d="M8.3685 12L13.1162 3.03212L14.8838 3.9679L10.6315 12L14.8838 20.0321L13.1162 20.9679L8.3685 12Z"></path></svg>
        </div>


        <div
          className="h-fit py-5 rounded-lg shadow-lg backdrop-blur-md bg-white/40 border border-white/30"
          onClick={handleNext}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="full" fill="currentColor"><path d="M15.6315 12L10.8838 3.03212L9.11622 3.9679L13.3685 12L9.11622 20.0321L10.8838 20.9679L15.6315 12Z"></path></svg>
        </div>


      </div>
    </div>
  );
}

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

interface MemberCardProps {
  name: string;
  role: string;
  image: string;
  center: boolean;
}



export default function MemberCard({
  name,
  role,
  image,
  center,
}: MemberCardProps) {

  
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-full w-full justify-center">
        <Image
          src={image}
          width={1000}
          height={1000}
          alt={name}
          className="w-full rounded-lg object-cover md:w-2/3"
        />
      </div>
      <AnimatePresence>
        {center && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute bottom-[10px] mt-4 w-3/4 rounded-lg border border-white/30 bg-black/15 p-4 text-center shadow-lg shadow-md backdrop-blur-sm md:w-1/2"
            style={{ WebkitBackdropFilter: 'blur(10.7px)' }}
          >
            <h3 className="text-xl font-semibold text-white">{name}</h3>
            <p className="text-lg text-white">{role}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {center && (
        <div>
          <div className="absolute top-[15%] left-[10%] flex h-fit w-fit items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="80"
              height="80"
              className="mx-auto block"
            >
              <rect
                x="15"
                y="15"
                width="50"
                height="50"
                className="fill-[#439ab2]"
              >
                <animateTransform
                  attributeName="transform"
                  begin="0s"
                  dur="10s"
                  type="rotate"
                  from="0 40 40"
                  to="360 40 40"
                  repeatCount="indefinite"
                />
              </rect>
            </svg>
          </div>

          <div className="absolute top-[-1%] left-[15%] flex h-fit w-fit items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100"
              height="100"
              className="mx-auto block"
            >
              <polygon
                points="50,30 25,75 75,75"
                className="fill-transparent stroke-green-500 stroke-10"
              >
                <animateTransform
                  attributeName="transform"
                  begin="0s"
                  dur="10s"
                  type="rotate"
                  from="0 50 50"
                  to="360 50 50"
                  repeatCount="indefinite"
                />
              </polygon>
            </svg>
          </div>

          <div className="absolute top-[-5%] left-[30%] flex h-fit w-fit items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="80"
              height="80"
              className="mx-auto block"
            >
              <rect
                x="15"
                y="15"
                width="50"
                height="50"
                className="fill-[#e9b12a]"
              >
                <animateTransform
                  attributeName="transform"
                  begin="0s"
                  dur="10s"
                  type="rotate"
                  from="0 40 40"
                  to="360 40 40"
                  repeatCount="indefinite"
                />
              </rect>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

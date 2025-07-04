'use client';

import { motion } from 'framer-motion';

export default function WhyUs() {
  return (
    <motion.div
      className="flex flex-col"
      initial={{ opacity: 0, y: 50 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <p className="mt-3 mb-12 bg-gradient-to-r from-yellow-400 to-yellow-900/80 bg-clip-text px-10 py-2 text-4xl font-bold text-transparent md:px-32 md:text-5xl lg:text-8xl">
        Why us?
      </p>
      <div className="flex flex-col justify-between gap-8 text-center md:flex-row">
        <div className="flex aspect-square flex-1 flex-col md:aspect-[3/4]">
          <div
            className="flex h-1/5 items-center justify-center rounded-t-2xl py-3"
            style={{
              background:
                'linear-gradient(95.85deg, rgba(251, 200, 33, 0.7) -13.27%, rgba(94, 193, 224, 0.7) 100%)',
            }}
          >
            <p className="text-xl font-semibold text-foreground md:text-2xl lg:text-3xl">
              SPECIAL EVENTS
            </p>
          </div>
          <div className="flex flex-1 items-center justify-center bg-slate-400/30 p-4 text-foreground dark:bg-slate-700/50">
            <p className="text-center text-base md:text-sm lg:text-xl">
              Events organized to support you in finding career paths in
              technology, gaining deeper insights from company trips and alumni,
              and joining coding competitions.
            </p>
          </div>
          <div className="h-1/5 rounded-b-2xl bg-slate-400/30 md:[clip-path:polygon(0_0,90%_0,73%_80%,73%_100%,0_100%)] dark:bg-slate-700/50"></div>
        </div>
        <div className="flex aspect-square flex-1 flex-col md:aspect-[3/4]">
          <div
            className="flex h-1/5 items-center justify-center rounded-t-2xl py-3"
            style={{
              background:
                'linear-gradient(95.85deg, rgba(251, 200, 33, 0.7) -13.27%, rgba(94, 193, 224, 0.7) 100%)',
            }}
          >
            <p className="text-xl font-semibold text-foreground md:text-2xl lg:text-3xl">
              NETWORKING
            </p>
          </div>
          <div className="flex flex-1 items-center justify-center bg-slate-400/30 p-4 text-foreground dark:bg-slate-700/50">
            <p className="text-base md:text-sm lg:text-xl">
              Our network is the most valuable asset for our members. We connect
              you with the right people to help you achieve your goals.
            </p>
          </div>
          <div className="relative h-1/5 rounded-b-2xl bg-slate-400/30 md:rounded-b-none dark:bg-slate-700/50">
            <div className="absolute bottom-0 left-0 hidden h-4/5 w-1/6 -translate-x-full bg-slate-400/30 [clip-path:polygon(50%_0%,100%_0,100%_100%,0_100%,0_50%)] md:block dark:bg-slate-700/50"></div>
            <div className="absolute right-0 bottom-0 hidden h-4/5 w-1/12 translate-x-full bg-slate-400/30 [clip-path:polygon(0_0,100%_30%,100%_100%,0%_100%)] md:block dark:bg-slate-700/50"></div>
          </div>
        </div>
        <div className="flex aspect-square flex-1 flex-col md:aspect-[3/4]">
          <div
            className="flex h-1/5 items-center justify-center rounded-t-2xl py-3"
            style={{
              background:
                'linear-gradient(95.85deg, rgba(251, 200, 33, 0.7) -13.27%, rgba(94, 193, 224, 0.7) 100%)',
            }}
          >
            <p className="text-xl font-semibold text-foreground md:text-2xl lg:text-3xl">
              VISIONS
            </p>
          </div>
          <div className="flex flex-1 items-center justify-center bg-slate-400/30 p-4 text-foreground dark:bg-slate-700/50">
            <p className="text-base md:text-sm lg:text-xl">
              We create an environment not only for students from SSET students
              but also others to learn new knowledge, have fun, and expand their
              network.
            </p>
          </div>
          <div className="h-1/5 rounded-b-2xl bg-slate-400/30 md:[clip-path:polygon(0_0,100%_0,100%_100%,15%_100%,10%_100%,10%_30%)] dark:bg-slate-700/50"></div>
        </div>
      </div>
    </motion.div>
  );
}

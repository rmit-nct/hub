import {
  Calendar,
  Code,
  Component,
  ExternalLink,
  Play,
  TbBrandGithub,
  X,
} from '@ncthub/ui/icons';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { GLBViewerCanvas } from './3d-model';
import type { Project } from './data';

interface ProjectDetailProps {
  onClose: () => void;
  data: Project | undefined;
}

const STATUS_CONFIG = {
  completed: {
    color: 'bg-dynamic-green',
    label: 'Completed',
  },
  ongoing: {
    color: 'bg-dynamic-blue',
    label: 'In Progress',
  },
  planning: {
    color: 'bg-brand-light-yellow text-primary',
    label: 'Planning',
  },
} as const;

const TYPE_LABELS = {
  web: 'Software',
  software: 'Software',
  hardware: 'Hardware',
} as const;

const MODAL_VARIANTS = {
  hidden: { scale: 0.9, opacity: 0, y: 20 },
  visible: { scale: 1, opacity: 1, y: 0 },
  exit: { scale: 0.9, opacity: 0, y: 20 },
};

const BACKDROP_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function ProjectDetail({ onClose, data }: ProjectDetailProps) {
  const [is3DViewOpen, setIs3DViewOpen] = useState(false);

  if (!data) {
    return null;
  }

  const {
    name,
    description,
    techStack,
    members,
    purpose,
    manager,
    type,
    status,
    semester,
    githubUrl,
    demoUrl,
    image,
    modelFile,
  } = data;

  const handleBackdropClick = () => {
    onClose();
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 backdrop-blur-sm sm:p-4"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={BACKDROP_VARIANTS}
      onClick={handleBackdropClick}
    >
      <motion.div
        className="relative max-h-[calc(100vh-1rem)] w-full max-w-4xl overflow-y-auto rounded-2xl border border-brand-light-blue/20 bg-linear-to-br from-background via-card to-brand-light-blue/10 shadow-2xl shadow-brand-light-blue/10 sm:max-h-[90vh] sm:rounded-3xl"
        variants={MODAL_VARIANTS}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={handleModalClick}
      >
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-brand-light-yellow/5 via-transparent to-dynamic-cyan/10" />
        {/* Header */}
        <div className="relative z-10 p-4 sm:p-8">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 z-10 rounded-full bg-muted/80 p-2 text-muted-foreground backdrop-blur-sm transition-all duration-200 hover:bg-muted hover:text-foreground sm:top-6 sm:right-6"
          >
            <X size={20} />
          </button>

          <div className="relative mb-6 h-44 w-full overflow-hidden rounded-xl bg-linear-to-br from-brand-light-yellow/20 to-dynamic-cyan/20 sm:mb-8 sm:h-48 sm:rounded-2xl">
            <Image
              src={image || '/media/background/demo.jpg'}
              fill
              alt={`${name} project demo`}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-foreground/60 to-transparent" />

            <div className="absolute top-3 right-12 left-3 flex flex-wrap gap-2 sm:top-4 sm:right-auto sm:left-4">
              <div
                className={`rounded-full px-3 py-1 font-medium text-primary-foreground text-xs sm:text-sm ${STATUS_CONFIG[status].color}`}
              >
                {STATUS_CONFIG[status].label}
              </div>
              <div className="rounded-full border border-border bg-muted px-3 py-1 font-medium text-foreground text-xs sm:text-sm">
                {TYPE_LABELS[type]}
              </div>
              <div className="rounded-full border border-border bg-muted px-3 py-1 font-medium text-foreground text-xs sm:text-sm">
                {semester}
              </div>
            </div>
          </div>

          <div className="text-center">
            <h1 className="mb-2 break-words bg-linear-to-r from-brand-light-yellow to-dynamic-cyan bg-clip-text py-2 font-bold text-3xl text-transparent leading-tight sm:text-4xl md:text-5xl md:leading-tight">
              {name}
            </h1>
            {manager && (
              <p className="break-words text-base text-muted-foreground sm:text-xl">
                Project Lead:{' '}
                <span className="font-semibold text-foreground">{manager}</span>
              </p>
            )}

            {/* Project Links */}
            {(githubUrl || demoUrl) && (
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                {githubUrl && (
                  <motion.a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted/80 px-5 py-3 text-foreground backdrop-blur-sm transition-all duration-200 hover:border-border hover:bg-muted sm:w-auto sm:px-6"
                  >
                    <TbBrandGithub size={20} />
                    <span className="font-medium">View Code</span>
                  </motion.a>
                )}
                {demoUrl && (
                  <motion.a
                    href={demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 font-medium text-background transition-all duration-200 hover:bg-foreground/90 sm:w-auto sm:px-6"
                  >
                    <Play size={20} />
                    <span>View Demo</span>
                  </motion.a>
                )}
                {modelFile && (
                  <motion.button
                    onClick={() => {
                      setIs3DViewOpen((prev) => !prev);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-brand-light-blue to-dynamic-cyan px-5 py-3 font-medium text-primary transition-all duration-200 hover:shadow-brand-light-blue/30 hover:shadow-lg sm:w-auto sm:px-6"
                  >
                    <Component size={20} />
                    <span>{is3DViewOpen ? 'Close Model' : 'View Model'}</span>
                  </motion.button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-5 px-4 pb-4 sm:space-y-8 sm:px-8 sm:pb-8">
          {/* 3D Model Viewer */}
          <AnimatePresence initial={false} mode="popLayout">
            {is3DViewOpen && modelFile && (
              <motion.div
                key="viewer"
                layout
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  height: { type: 'spring', stiffness: 260, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                style={{ overflow: 'hidden' }}
                className="rounded-2xl"
              >
                <GLBViewerCanvas
                  modelUrl={modelFile}
                  enableControls
                  autoRotate
                  scale={0.5}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Project Stats */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:grid-cols-4 sm:gap-4">
            {[
              {
                label: 'Technologies',
                value: techStack?.length || 0,
                icon: Code,
              },
              {
                label: 'Team Size',
                value: members?.length || 0,
                icon: ExternalLink,
              },
              {
                label: 'Status',
                value: STATUS_CONFIG[status].label,
                icon: Play,
              },
              {
                label: 'Semester',
                value: semester,
                icon: Calendar,
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="min-w-0 rounded-xl border border-border bg-muted/50 p-3 text-center sm:p-4"
              >
                <div className="mb-2 flex justify-center">
                  <stat.icon className="h-6 w-6 text-dynamic-cyan" />
                </div>
                <p className="break-words font-bold text-foreground text-xl sm:text-2xl">
                  {stat.value}
                </p>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
          {/* Description */}
          {description && (
            <div className="rounded-xl border border-border bg-muted/50 p-4 sm:rounded-2xl sm:p-6">
              <h2 className="mb-3 font-semibold text-foreground text-xl sm:mb-4 sm:text-2xl">
                About
              </h2>
              <p className="break-words text-base text-muted-foreground leading-relaxed sm:text-lg">
                {description}
              </p>
            </div>
          )}
          {/* Purpose */}
          {purpose && (
            <div className="rounded-xl border border-border bg-muted/50 p-4 sm:rounded-2xl sm:p-6">
              <h2 className="mb-3 font-semibold text-foreground text-xl sm:mb-4 sm:text-2xl">
                Purpose
              </h2>
              <p className="break-words text-base text-muted-foreground leading-relaxed sm:text-lg">
                {purpose}
              </p>
            </div>
          )}
          {/* Tech Stack */}
          {techStack && techStack.length > 0 && (
            <div className="rounded-xl border border-border bg-muted/50 p-4 sm:rounded-2xl sm:p-6">
              <h2 className="mb-4 font-semibold text-foreground text-xl sm:mb-6 sm:text-2xl">
                Technologies
              </h2>
              <div className="flex flex-wrap gap-3">
                {techStack.map((tech, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="max-w-full rounded-xl border border-border bg-muted px-3 py-2 backdrop-blur-sm sm:px-4"
                  >
                    <span className="break-words font-medium text-foreground">
                      {tech}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          {/* Team Members */}
          {members && members.length > 0 && (
            <div className="rounded-xl border border-border bg-muted/50 p-4 sm:rounded-2xl sm:p-6">
              <h2 className="mb-4 font-semibold text-foreground text-xl sm:mb-6 sm:text-2xl">
                Team Members
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {members.map((person, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group flex min-w-0 items-center justify-between rounded-xl border border-border bg-muted/50 p-3 transition-colors hover:bg-muted sm:p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground font-bold text-background">
                        {person.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="break-words font-semibold text-foreground transition-colors group-hover:text-foreground">
                          {person.name}
                        </p>
                        <p className="break-words text-muted-foreground text-sm">
                          {person.role || 'Team Member'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="rounded-b-2xl border-border/10 border-t bg-card/5 px-4 py-5 sm:rounded-b-3xl sm:px-8 sm:py-6">
          <div className="flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            {githubUrl && (
              <motion.a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/50 bg-card/80 px-5 py-3 text-card-foreground backdrop-blur-sm transition-all duration-200 hover:border-border hover:bg-card sm:w-auto sm:px-6"
              >
                <TbBrandGithub size={20} />
                <span className="font-medium">View on GitHub</span>
              </motion.a>
            )}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full rounded-xl bg-foreground px-6 py-3 font-semibold text-background transition-all duration-200 hover:bg-foreground/90 sm:w-auto sm:rounded-2xl sm:px-8"
            >
              Close
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

import { Project } from './data';
import { Card, CardContent, CardFooter, CardHeader } from '@ncthub/ui/card';
import { cn } from '@ncthub/utils/format';
import { motion } from 'framer-motion';
import { Github, Globe, Monitor, Play, Users, Wrench } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  type?: string;
  status?: string;
  isSelected?: boolean;
  onClick: () => void;
}

// Enhanced status color mapping with gradients
const STATUS_COLORS = {
  completed: 'from-green-500 to-emerald-600',
  ongoing: 'from-blue-500 to-cyan-600',
  planning: 'from-yellow-500 to-orange-500',
} as const;

// Enhanced type configurations with icons and colors
const TYPE_CONFIG = {
  web: {
    label: 'Web Development',
    icon: Globe,
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-500/10 to-pink-500/10',
  },
  software: {
    label: 'Software',
    icon: Monitor,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/10 to-cyan-500/10',
  },
  hardware: {
    label: 'Hardware',
    icon: Wrench,
    gradient: 'from-orange-500 to-red-500',
    bgGradient: 'from-orange-500/10 to-red-500/10',
  },
} as const;

export default function ProjectCard({
  project,
  type,
  status,
  isSelected = false,
  onClick,
}: ProjectCardProps) {
  // Determine if this card should be highlighted based on current filters
  const getHighlightStatus = () => {
    if (type && status) {
      return type === project.type && status === project.status;
    } else if (type) {
      return type === project.type;
    } else if (status) {
      return status === project.status;
    }
    return null;
  };

  const isHighlighted = getHighlightStatus();
  const typeConfig = TYPE_CONFIG[project.type];
  const TypeIcon = typeConfig.icon;

  // Enhanced card container styles with modern glassmorphism
  const getCardContainerStyles = () => {
    const baseStyles = `
      relative h-full min-h-[480px] text-left transition-all duration-500
      backdrop-blur-md overflow-hidden group flex flex-col p-0
    `;

    const centerStyles = isSelected
      ? 'shadow-2xl shadow-[#1AF4E6]/20 border-[#1AF4E6]/30'
      : '';

    const highlightStyles = isHighlighted
      ? `bg-gradient-to-br ${typeConfig.bgGradient} border-[#1AF4E6]/50 shadow-xl shadow-[#1AF4E6]/25`
      : isSelected
        ? 'bg-card/80 hover:bg-card'
        : 'bg-card/40 hover:bg-card/60 hover:border-border hover:shadow-lg';

    return `${baseStyles} ${centerStyles} ${highlightStyles}`;
  };

  return (
    <Card
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      className={getCardContainerStyles()}
    >
      <div
        className={cn(
          'absolute inset-0 z-10 transition-all duration-500',
          isSelected ? 'bg-transparent' : 'bg-muted/60'
        )}
      />
      {/* Card Header with Status, Type, and Title */}
      <CardHeader className="flex flex-col gap-6 p-6">
        {/* Status and Type Indicators Row */}
        <div className="flex items-center justify-between">
          {/* Status Indicator */}
          <div
            className={`rounded-full bg-gradient-to-r px-3 py-1 text-xs font-bold text-primary-foreground shadow-lg backdrop-blur-sm ${STATUS_COLORS[project.status as keyof typeof STATUS_COLORS]} `}
          >
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </div>

          {/* Type Indicator */}
          <div
            className={`flex items-center gap-2 rounded-full bg-gradient-to-r px-3 py-1 text-xs font-medium text-primary-foreground ${typeConfig.gradient}`}
          >
            <TypeIcon className="h-3 w-3" />
            <span>{typeConfig.label}</span>
          </div>
        </div>

        {/* Title and Manager Info */}
        <div className="flex items-start gap-3">
          <div
            className={`rounded-xl bg-gradient-to-r p-2 ${typeConfig.gradient}`}
          >
            <TypeIcon className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3
              className={`leading-tight font-bold text-foreground ${isSelected ? 'text-2xl' : 'text-xl'}`}
            >
              {project.name}
            </h3>
            {project.manager && (
              <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <p className={`${isSelected ? 'text-sm' : 'text-xs'}`}>
                  Led by {project.manager}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Card Content - Flex grow to push footer down */}
      <CardContent className="flex flex-grow flex-col p-6 pt-0">
        {/* Card Description */}
        <div className="mb-6">
          <p
            className={`leading-relaxed text-muted-foreground ${
              isSelected ? 'text-base' : 'line-clamp-3 text-sm'
            }`}
          >
            {project.description || 'No description available.'}
          </p>
        </div>

        {/* Tech Stack */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-0.5 w-4 bg-gradient-to-r from-[#F4B71A] to-[#1AF4E6]" />
              <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                Tech Stack
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Show first 3 technologies with enhanced styling */}
              {project.techStack.slice(0, 3).map((tech, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-lg border border-border bg-muted/50 px-3 py-1 font-medium text-foreground backdrop-blur-sm ${isSelected ? 'text-sm' : 'text-xs'} `}
                >
                  {tech}
                </motion.span>
              ))}

              {/* Show count of remaining technologies */}
              {project.techStack.length > 3 && (
                <span
                  className={`rounded-lg border border-border bg-muted/30 px-3 py-1 font-medium text-muted-foreground ${isSelected ? 'text-sm' : 'text-xs'} `}
                >
                  +{project.techStack.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-6 pt-0">
        {/* Subtle divider */}
        <div className="mb-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="flex items-center justify-between">
          {/* Quick action buttons */}
          <div className="flex gap-2">
            {project.githubUrl && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="rounded-lg bg-muted/50 p-2 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-muted hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(project.githubUrl, '_blank');
                }}
              >
                <Github className="h-4 w-4" />
              </motion.button>
            )}
            {project.demoUrl && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="rounded-lg bg-muted/50 p-2 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-muted hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(project.demoUrl, '_blank');
                }}
              >
                <Play className="h-4 w-4" />
              </motion.button>
            )}
          </div>

          {/* Team Size Indicator with enhanced design */}
          {project.members && project.members.length > 0 && (
            <div
              className={`flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1 text-muted-foreground backdrop-blur-sm ${isSelected ? 'text-sm' : 'text-xs'}`}
            >
              <Users className="h-4 w-4" />
              <span>
                {project.members.length} member
                {project.members.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </CardFooter>

      {/* Visual Effects */}
      <>
        {/* Animated background gradient */}
        <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div
            className={`absolute inset-0 rounded-xl bg-gradient-to-br ${typeConfig.bgGradient}`}
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#F4B71A]/5 to-[#1AF4E6]/5" />
        </div>

        {/* Shimmer effect on hover */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-1000 group-hover:translate-x-full group-hover:opacity-100" />

        {/* Border glow effect for center cards */}
        {isSelected && (
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-[#F4B71A]/20 to-[#1AF4E6]/20 opacity-50 blur-xl" />
        )}
      </>
    </Card>
  );
}

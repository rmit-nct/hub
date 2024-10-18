import { Project } from './data';
import { Separator } from '@repo/ui/components/ui/separator';

interface ProjectCardDemoProps {
  project: Project;
  type?: string;
  status?: string;
  onClick: () => void;
}

export default function ProjectCardDemo({
  project,
  type,
  status,
  onClick,
}: ProjectCardDemoProps) {
  return (
    <button
      key={project.name}
      className="max-w-96 rounded-bl-lg bg-gradient-to-br from-[#F4B71A] via-white to-[#1AF4E6] p-[1px] transition duration-300 [clip-path:polygon(20%_0,85%_0,100%_15%,100%_85%,85%_100%,0_100%,0_20%,10%_15%)] hover:-translate-y-2"
      onClick={onClick}
    >
      <div
        className={`flex h-full justify-center rounded-lg [clip-path:polygon(20%_0,85%_0,100%_15%,100%_85%,85%_100%,0_100%,0_20%,10%_15%)] ${
          (type && type === project.type) ||
          (status && status === project.status)
            ? 'bg-gradient-to-br from-[#1AF4E6] via-[#212144] to-[#F4B71A]'
            : 'bg-[#18182F]'
        }`}
      >
        <div className="flex w-full flex-col px-6 py-4">
          <div className="flex flex-grow flex-col">
            <div className="mx-4 rounded-lg bg-gradient-to-br from-[#F4B71A]/70 via-[#87D580]/60 to-[#1AF4E6]/50 p-[1px] [clip-path:polygon(10%_0,100%_0,100%_40%,90%_100%,0_100%,0_60%)]">
              <p
                className={`text-md rounded-lg p-2 text-center font-bold text-white [clip-path:polygon(10%_0,100%_0,100%_40%,90%_100%,0_100%,0_60%)] ${
                  (type && type === project.type) ||
                  (status && status === project.status)
                    ? 'bg-gradient-to-r from-[#F4B71A] via-[#87D580] to-[#1AF4E6]'
                    : 'bg-[#212144]'
                }`}
              >
                {project.name}
              </p>
            </div>
            <Separator className="my-2" />
            <h2 className="mb-2 text-center text-lg text-white/75">
              {project.manager}
            </h2>
            <p className="mb-5 text-center text-xs text-white/75">
              {project.description}
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg bg-[#D9D9D9] p-[1px] [clip-path:polygon(10%_0,100%_0,100%_40%,90%_100%,0_100%,0_60%)]">
              <p className="rounded-lg bg-gradient-to-b from-[#1AF4E6] to-black/75 px-4 py-2 text-center text-sm font-semibold text-black transition-opacity [clip-path:polygon(10%_0,100%_0,100%_40%,90%_100%,0_100%,0_60%)] hover:opacity-90">
                {project.type === 'web'
                  ? 'Web Development'
                  : project.type === 'software'
                    ? 'Software'
                    : project.type === 'hardware'
                      ? 'Hardware'
                      : 'Other'}
              </p>
            </div>
            <div className="rounded-lg bg-[#D9D9D9] p-[1px] [clip-path:polygon(10%_0,100%_0,100%_40%,90%_100%,0_100%,0_60%)]">
              <p className="rounded-lg bg-gradient-to-b from-[#1AF4E6] to-black/75 px-4 py-2 text-center text-sm font-semibold text-black transition-opacity [clip-path:polygon(10%_0,100%_0,100%_40%,90%_100%,0_100%,0_60%)] hover:opacity-90">
                {project.status === 'completed'
                  ? 'Completed'
                  : project.status === 'ongoing'
                    ? 'Ongoing'
                    : project.status === 'planning'
                      ? 'Planning'
                      : 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

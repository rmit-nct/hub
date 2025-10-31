import MainProject from './main-project';
import Projects from './projects';

export default function ProjectsPage() {
  return (
    <div className="text-foreground container flex flex-col items-center gap-6">
      <MainProject />
      <Projects />
    </div>
  );
}

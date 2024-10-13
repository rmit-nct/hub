export type Project = {
  name: string;
  description?: string;
  type: 'web' | 'software' | 'hardware' | 'other';
  manager?: string;
  techStack?: string[];
  purpose: string;
  status: 'planning' | 'in-progress' | 'completed';
};

export const projects: Project[] = [
  {
    name: 'Neo Crush',
    description:
      'The first stable release of Neo Crush with new features and improvements.',
    type: 'web',
    techStack: [
      'Next.js',
      'Typescript',
      'Tailwind CSS',
      'Supabase Realtime',
      'Shadcn UI',
    ],
    status: 'in-progress',
    manager: 'Vo Hoang Phuc',
    purpose:
      'A short-term project to demonstrate realtime multiplayer game development with cutting-edge technologies.',
  },
  {
    name: 'Neo Chess',
    description:
      "An in-house chess game that is planned for RMIT 2024 Semester C's Club Day.",
    type: 'web',
    techStack: [
      'Next.js',
      'Typescript',
      'Tailwind CSS',
      'Supabase Realtime',
      'Shadcn UI',
    ],
    status: 'in-progress',
    manager: 'Vo Hoang Phuc',
    purpose:
      'A short-term project to demonstrate realtime multiplayer game development with cutting-edge technologies.',
  },
  {
    name: 'Neo Checker',
    description:
      "An in-house checkers game that is planned for RMIT 2024 Semester C's Club Day.",
    type: 'web',
    techStack: [
      'Next.js',
      'Typescript',
      'Tailwind CSS',
      'Supabase Realtime',
      'Shadcn UI',
    ],
    status: 'in-progress',
    manager: 'Vo Hoang Phuc',
    purpose:
      'A short-term project to demonstrate realtime multiplayer game development with cutting-edge technologies.',
  },
  {
    name: 'NCT-2024C Landing Page',
    description:
      "The landing page for RMIT 2024 Semester C's Club Day, showcasing the club's projects and activities.",
    type: 'web',
    techStack: ['Next.js', 'Typescript', 'Tailwind CSS'],
    status: 'planning',
    manager: 'Vo Hoang Phuc',
    purpose:
      'A revamp of the club landing page to showcase the club projects and activities.',
  },
  {
    name: 'NCT AI Chatbot',
    description:
      "An AI chatbot that is planned for RMIT 2024 Semester C's Club Day.",
    type: 'web',
    techStack: [
      'Next.js',
      'Typescript',
      'Tailwind CSS',
      'Supabase',
      'Shadcn UI',
    ],
    status: 'planning',
    manager: 'Vo Hoang Phuc',
    purpose:
      'A short-term project to demonstrate AI chatbot development with cutting-edge technologies.',
  },
  {
    name: 'Neo Crush Alpha',
    description:
      "An 4-day internal hackathon game that was planned for RMIT 2024 Semester B's Club Day.",
    type: 'web',
    techStack: [
      'Next.js',
      'Typescript',
      'Tailwind CSS',
      'Supabase',
      'Shadcn UI',
    ],
    status: 'completed',
    manager: 'Vo Hoang Phuc',
    purpose:
      'A short-term project to demonstrate game development with short deadline.',
  },
  {
    name: 'NCT Hub',
    description:
      'The official web-based platform for RMIT Neo Culture Tech, based on Tuturuuu.',
    type: 'web',
    techStack: [
      'Next.js',
      'Turborepo',
      'Typescript',
      'Tailwind CSS',
      'Supabase',
      'Shadcn UI',
    ],
    status: 'completed',
    manager: 'Vo Hoang Phuc',
    purpose:
      'An informative digital platform for visitors as well as all-in-one management platform for core team members.',
  },
  {
    name: 'NCT Event Scheduler',
    description:
      'A when2meet-like event scheduler for the club members to organize events.',
    type: 'web',
    techStack: [
      'Next.js',
      'Turborepo',
      'Typescript',
      'Tailwind CSS',
      'Supabase',
      'Shadcn UI',
    ],
    status: 'completed',
    manager: 'Vo Hoang Phuc',
    purpose:
      'An alternative tool to When2meet with enhances UI/UX and additional features.',
  },
  {
    name: 'NCT Web Platform',
    description: 'The first version of the club web platform.',
    type: 'web',
    techStack: ['React.js', 'Node.js', 'Javascript'],
    status: 'completed',
    manager: 'Seokyung Kim',
    purpose:
      'An informative digital platform for visitors as well as all-in-one management platform for core team members.',
  },
  {
    name: 'Xiang Qi',
    description: 'A Java-written Chinese chess game.',
    type: 'software',
    techStack: ['Java', 'JavaFX'],
    status: 'completed',
    manager: 'Tran Mach So Han',
    purpose:
      'Help newbies get acquainted with the object-oriented programming (OOP) concept using Java',
  },
  {
    name: 'Flappy Bird',
    description: 'A clone of the famous Flappy Bird game.',
    type: 'software',
    techStack: ['Python'],
    status: 'completed',
    purpose: 'Hands on game development using Python and its libraries.',
  },
  {
    name: 'Advanced Wireless Keyboard',
    description: 'A custom bluetooth keyboard.',
    type: 'hardware',
    techStack: ['C++', 'BLE'],
    status: 'completed',
    manager: 'Dinh Ngoc Minh',
    purpose:
      'Build a Multifunctional Bluetooth Keyboard for Calculation, Bluetooth Connectivity, and Application Resource Monitoring.',
  },
  {
    name: 'Sudoku Game',
    description: 'A Sudoku game in React.',
    type: 'web',
    techStack: ['React.js'],
    status: 'completed',
    manager: 'Nguyen Son Tung',
    purpose: 'A simple game to practice React.js and its ecosystem.',
  },
  {
    name: 'Fingerprint Lock',
    description: 'A fingerprint lock with sensors.',
    type: 'hardware',
    techStack: ['C++', 'Arduino'],
    status: 'completed',
    manager: 'Cao Viet Quang',
    purpose:
      'Hands on intermediate embedded project with hardware design and C programming.',
  },
  {
    name: 'NCT Movie Website',
    description: 'A website to watch movies with the club members.',
    type: 'web',
    techStack: ['HTML', 'CSS', 'Javascript'],
    status: 'completed',
    manager: 'Seokyung Kim',
    purpose: 'A simple project to practice front-end development.',
  },
  {
    name: 'NCT Text Converter',
    description:
      'A text converter for the club members to convert text to different formats.',
    type: 'software',
    techStack: ['Python', 'vcpkg'],
    status: 'completed',
    manager: 'Dinh Ngoc Minh',
    purpose: 'A simple project to learn about OCR and text processing.',
  },
];

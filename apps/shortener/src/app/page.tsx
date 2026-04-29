import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect(
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3002'
      : 'https://nct.gg'
  );
}

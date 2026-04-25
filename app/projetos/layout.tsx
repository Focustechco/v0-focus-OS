import { ProjectsProvider } from '@/contexts/ProjectsContext';

export default function ProjetosRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProjectsProvider>{children}</ProjectsProvider>;
}

import { useParams } from 'react-router-dom';
import { ProjectView } from '@/components/projects/ProjectView';
import NotFoundPage from './NotFoundPage';

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) return <NotFoundPage />;

  return <ProjectView projectId={id} />;
}

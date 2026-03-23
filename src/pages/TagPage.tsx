import { useParams } from 'react-router-dom';
import { TagFilterView } from '@/components/tags/TagFilterView';
import NotFoundPage from './NotFoundPage';

export default function TagPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) return <NotFoundPage />;

  return <TagFilterView tagId={id} />;
}

import type { CurrentReadingPost } from '../services/currentReadingApi';
import { CurrentReadingCard } from './CurrentReadingCard';

type CurrentReadingFeedProps = {
  items: CurrentReadingPost[];
  onEdit: (post: CurrentReadingPost) => void;
  onDelete: (post: CurrentReadingPost) => void;
  deletingPostId?: string | null;
};

export function CurrentReadingFeed({ items, onEdit, onDelete, deletingPostId = null }: CurrentReadingFeedProps) {
  if (items.length === 0) {
    return (
      <div className="panel-subtle border-dashed p-10 text-center text-slate-600">
        No one has shared a current read yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <CurrentReadingCard
          key={item.postId}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={deletingPostId === item.postId}
        />
      ))}
    </div>
  );
}


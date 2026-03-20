import type { CurrentReadingPost } from '../services/currentReadingApi';
import { CurrentReadingOwnerActions } from './CurrentReadingOwnerActions';

type CurrentReadingCardProps = {
  item: CurrentReadingPost;
  onEdit: (post: CurrentReadingPost) => void;
  onDelete: (post: CurrentReadingPost) => void;
  isDeleting?: boolean;
};

export function CurrentReadingCard({ item, onEdit, onDelete, isDeleting = false }: CurrentReadingCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-slate-900">{item.bookTitle}</p>
          <p className="mt-1 text-sm text-slate-600">{item.ownerDisplayName} · {item.ownerUserId}</p>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">{item.rating}/5</span>
      </div>
      <p className="mt-3 text-sm text-slate-500">Posted {new Date(item.postedAt).toLocaleString()}</p>
      {item.ownedByCurrentUser ? (
        <CurrentReadingOwnerActions onEdit={() => onEdit(item)} onDelete={() => onDelete(item)} isDeleting={isDeleting} />
      ) : null}
    </article>
  );
}


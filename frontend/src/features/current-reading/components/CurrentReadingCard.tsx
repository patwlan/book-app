import { Link } from 'react-router-dom';
import type { CurrentReadingPost } from '../services/currentReadingApi';
import { CurrentReadingOwnerActions } from './CurrentReadingOwnerActions';
import { StarRatingDisplay } from './StarRatingDisplay';

type CurrentReadingCardProps = {
  item: CurrentReadingPost;
  onEdit: (post: CurrentReadingPost) => void;
  onDelete: (post: CurrentReadingPost) => void;
  isDeleting?: boolean;
};

export function CurrentReadingCard({ item, onEdit, onDelete, isDeleting = false }: CurrentReadingCardProps) {
  const profileHref = `/profiles/${item.ownerUserId}`;

  return (
    <article className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-soft backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xl font-semibold tracking-tight text-slate-950">{item.bookTitle}</p>
          <p className="text-sm leading-6 text-slate-500">
            <Link className="font-medium text-slate-700 underline-offset-4 hover:text-slate-950 hover:underline" to={profileHref}>
              {item.ownerDisplayName}
            </Link>{' '}
            · {item.ownerUserId}
          </p>
        </div>
        <StarRatingDisplay rating={item.rating} className="rounded-full border border-slate-200 bg-slate-950 px-3 py-2" />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
        <span className="rounded-full bg-slate-100 px-3 py-1">Posted {new Date(item.postedAt).toLocaleString()}</span>
        {item.ownedByCurrentUser ? (
          <span className="rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-700">Your post</span>
        ) : null}
      </div>

      {item.ownedByCurrentUser ? (
        <CurrentReadingOwnerActions onEdit={() => onEdit(item)} onDelete={() => onDelete(item)} isDeleting={isDeleting} />
      ) : null}
    </article>
  );
}


type CurrentReadingOwnerActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
};

export function CurrentReadingOwnerActions({ onEdit, onDelete, isDeleting = false }: CurrentReadingOwnerActionsProps) {
  return (
    <div className="mt-4 flex gap-3">
      <button
        type="button"
        onClick={onEdit}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={isDeleting}
        className="rounded-md border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDeleting ? 'Deleting…' : 'Delete'}
      </button>
    </div>
  );
}


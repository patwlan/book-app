type CurrentReadingOwnerActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
};

export function CurrentReadingOwnerActions({ onEdit, onDelete, isDeleting = false }: CurrentReadingOwnerActionsProps) {
  return (
    <div className="mt-5 flex flex-wrap gap-3">
      <button
        type="button"
        onClick={onEdit}
        className="secondary-button px-4 py-2.5"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={isDeleting}
        className="destructive-button px-4 py-2.5"
      >
        {isDeleting ? 'Deleting…' : 'Delete'}
      </button>
    </div>
  );
}


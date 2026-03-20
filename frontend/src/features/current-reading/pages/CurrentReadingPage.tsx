import { useMemo, useState } from 'react';
import { useAuth } from '../../../shared/auth/AuthProvider';
import { HttpError } from '../../../shared/api/httpClient';
import { CurrentReadingFeed } from '../components/CurrentReadingFeed';
import { CurrentReadingForm } from '../components/CurrentReadingForm';
import { CurrentReadingHeroPanel } from '../components/CurrentReadingHeroPanel';
import { useMaintainCurrentReading } from '../hooks/useMaintainCurrentReading';
import type { CurrentReadingPost } from '../services/currentReadingApi';
import type { CurrentReadingFormValues } from '../services/currentReadingFormSchema';
import { useCurrentReadingFeedQuery, useFeaturedCurrentReadsQuery } from '../state/currentReadingQueries';
import { useCreateOrReplaceCurrentReadingMutation } from '../state/useCreateOrReplaceCurrentReadingMutation';

export function CurrentReadingPage() {
  const { currentUser } = useAuth();
  const [editingPost, setEditingPost] = useState<CurrentReadingPost | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const featuredReadsQuery = useFeaturedCurrentReadsQuery(currentUser);
  const feedQuery = useCurrentReadingFeedQuery(currentUser);
  const createMutation = useCreateOrReplaceCurrentReadingMutation(currentUser);
  const { updateMutation, deleteMutation } = useMaintainCurrentReading(currentUser);

  const ownPost = useMemo(
    () => feedQuery.data?.items.find((item: CurrentReadingPost) => item.ownedByCurrentUser) ?? null,
    [feedQuery.data?.items],
  );

  async function handleCreateOrReplace(values: CurrentReadingFormValues) {
    setPageError(null);
    try {
      await createMutation.mutateAsync(values);
    } catch (error) {
      setPageError(error instanceof HttpError ? error.message : 'Saving failed.');
      throw error;
    }
  }

  async function handleUpdate(values: CurrentReadingFormValues) {
    setPageError(null);
    try {
      await updateMutation.mutateAsync(values);
      setEditingPost(null);
    } catch (error) {
      setPageError(error instanceof HttpError ? error.message : 'Saving failed.');
      throw error;
    }
  }

  async function handleDelete(post: CurrentReadingPost) {
    setPageError(null);
    try {
      await deleteMutation.mutateAsync();
      if (editingPost?.postId === post.postId) {
        setEditingPost(null);
      }
    } catch (error) {
      setPageError(error instanceof HttpError ? error.message : 'Delete failed.');
    }
  }

  return (
    <div className="space-y-8">
      <CurrentReadingHeroPanel
        items={featuredReadsQuery.data?.featuredBooks ?? []}
        isLoading={featuredReadsQuery.isLoading}
        hasError={featuredReadsQuery.isError}
      />

      <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section className="space-y-6">
          <CurrentReadingForm
            mode={editingPost ? 'edit' : 'create'}
            submitLabel={editingPost ? 'Save changes' : 'Share current read'}
            successMessage={editingPost ? 'Updated your current read.' : 'Saved your current read.'}
            initialValues={editingPost ?? undefined}
            onSubmit={editingPost ? handleUpdate : handleCreateOrReplace}
            onCancel={editingPost ? () => setEditingPost(null) : undefined}
          />

          {ownPost && !editingPost ? (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-800">
              Posting again will replace your existing current-read entry.
            </div>
          ) : null}

          {pageError ? <p className="text-sm font-medium text-rose-600">{pageError}</p> : null}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Current reading feed</h2>
            <p className="text-sm text-slate-600">See what everyone is currently reading and how they rate it.</p>
          </div>

          {feedQuery.isLoading ? <p className="text-sm text-slate-500">Loading current reads…</p> : null}

          {feedQuery.data ? (
            <CurrentReadingFeed
              items={feedQuery.data.items}
              onEdit={setEditingPost}
              onDelete={handleDelete}
              deletingPostId={deleteMutation.isPending ? ownPost?.postId ?? null : null}
            />
          ) : null}
        </section>
      </div>
    </div>
  );
}


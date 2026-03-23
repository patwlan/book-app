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
    <div className="space-y-8 lg:space-y-10">
      <CurrentReadingHeroPanel
        items={featuredReadsQuery.data?.featuredBooks ?? []}
        isLoading={featuredReadsQuery.isLoading}
        hasError={featuredReadsQuery.isError}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(320px,380px)_minmax(0,1fr)]">
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
            <div className="panel-subtle border-sky-100 bg-sky-50/80 p-4 text-sm leading-6 text-sky-900">
              Posting again will replace your existing current-read entry.
            </div>
          ) : null}

          {pageError ? (
            <div className="rounded-[22px] border border-rose-100 bg-rose-50/90 p-4 text-sm font-medium text-rose-700">
              {pageError}
            </div>
          ) : null}
        </section>

        <section className="panel-surface space-y-5 p-6 sm:p-8">
          <div className="space-y-3">
            <p className="section-kicker">Live feed</p>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Current reading feed</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  See what everyone is currently reading and how they rate it.
                </p>
              </div>
              {feedQuery.data ? (
                <div className="self-start rounded-full border border-slate-200 bg-slate-50/90 px-4 py-2 text-sm font-medium text-slate-600">
                  {feedQuery.data.items.length} {feedQuery.data.items.length === 1 ? 'current read' : 'current reads'}
                </div>
              ) : null}
            </div>
          </div>

          {feedQuery.isLoading ? (
            <div className="panel-subtle p-6 text-sm text-slate-500">Loading current reads…</div>
          ) : null}

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


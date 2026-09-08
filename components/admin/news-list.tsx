"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteArticle } from "@/lib/actions/news";

type ArticleRow = {
  id: string;
  title: string;
  status: string;
  authorName: string;
};

export function NewsList({
  articles,
  canDelete,
}: {
  articles: ArticleRow[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<ArticleRow | null>(null);

  if (articles.length === 0) {
    return <p className="text-sm text-muted-foreground">No articles yet.</p>;
  }

  return (
    <>
      <div className="space-y-2">
        {articles.map((a) => (
          <Card key={a.id} className="transition-colors hover:bg-accent/50">
            <CardContent className="flex items-center justify-between gap-4 py-4">
              {/* The link wraps only the text, not the whole card: nesting the
                  delete button inside an <a> would be invalid markup and would
                  navigate on click instead of opening the dialog. */}
              <Link href={`/admin/news/${a.id}`} className="min-w-0 flex-1">
                <p className="truncate font-medium">{a.title}</p>
                <p className="text-sm text-muted-foreground">By {a.authorName}</p>
              </Link>
              <div className="flex shrink-0 items-center gap-2">
                <StatusBadge status={a.status} />
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${a.title}`}
                    onClick={() => setToDelete(a)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {toDelete?.title}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the article. If it is published, its page
              and any links to it will start returning 404. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  if (!toDelete) return;
                  const result = await deleteArticle(toDelete.id);
                  if (!result.success) toast.error(result.error);
                  else {
                    toast.success("Article deleted");
                    router.refresh();
                  }
                  setToDelete(null);
                })
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

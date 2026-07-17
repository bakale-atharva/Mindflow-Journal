"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteEntry } from "@/app/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function DeleteEntryDialog({ entryId }: { entryId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(deleteEntry, null);
  useEffect(() => {
    if (state?.status === "success") router.push("/journal");
  }, [router, state]);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50"
      >
        <Trash2 className="size-4" />
        Delete entry
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-[26px] p-6 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl tracking-[-.04em]">
              Delete this entry?
            </DialogTitle>
            <DialogDescription className="leading-6">
              The entry and its reflection will be permanently removed. This
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <form action={action}>
            <input type="hidden" name="entry_id" value={entryId} />
            {state?.status === "error" ? (
              <p className="mb-3 text-sm text-destructive">{state.error}</p>
            ) : null}
            <DialogFooter className="mt-4 -mx-6 -mb-6 rounded-b-[26px] p-5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-ink/10 px-4 py-2.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
              >
                Keep entry
              </button>
              <button
                disabled={pending}
                className="rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50"
              >
                {pending ? "Deleting…" : "Delete permanently"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

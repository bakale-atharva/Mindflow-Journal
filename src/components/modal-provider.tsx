"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { NewEntryModal } from "./new-entry-modal";
import { Suspense } from "react";

function ModalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const isNewEntryOpen = searchParams.has("new");

  const handleClose = () => {
    // Remove the ?new parameter
    const params = new URLSearchParams(searchParams.toString());
    params.delete("new");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return <NewEntryModal isOpen={isNewEntryOpen} onClose={handleClose} />;
}

export function ModalProvider() {
  return (
    <Suspense fallback={null}>
      <ModalContent />
    </Suspense>
  );
}

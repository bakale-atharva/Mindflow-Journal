'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { saveEntry } from "@/app/actions"

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save Entry'}
    </Button>
  )
}

export function JournalForm() {
  const [state, formAction] = useActionState(saveEntry, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
    }
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <Textarea 
        name="content"
        placeholder="What's on your mind today?" 
        className="min-h-[150px] resize-none"
        required
      />
      
      {state?.error && (
        <p className="text-sm text-red-500 font-medium">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  )
}

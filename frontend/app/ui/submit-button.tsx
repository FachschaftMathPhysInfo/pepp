'use client'
 
import { useFormStatus } from 'react-dom'
 
export function SubmitButton() {
  const { pending } = useFormStatus()
 
  return (
    <button className="bg-blue-500" type="submit" disabled={pending}>
      Submit
    </button>
  )
}
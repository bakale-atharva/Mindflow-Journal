import { NextResponse } from 'next/server'
import { generateReflection } from '@/lib/reflections'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await generateReflection(body.entry, body.retry)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

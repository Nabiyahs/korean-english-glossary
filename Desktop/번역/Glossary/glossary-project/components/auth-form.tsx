"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"

export function AuthForm() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const result = await signIn(email)
    if (result.success) {
      toast({
        title: "로그인 링크 전송",
        description: result.message,
      })
    } else {
      toast({
        title: "로그인 오류",
        description: result.message,
        variant: "destructive",
      })
    }
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
          이메일 주소
        </Label>
        <div className="mt-1">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-samoo-blue focus:outline-none focus:ring-samoo-blue sm:text-sm"
          />
        </div>
      </div>

      <div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full justify-center rounded-md border border-transparent bg-samoo-blue px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-samoo-blue-dark focus:outline-none focus:ring-2 focus:ring-samoo-blue focus:ring-offset-2"
        >
          {isSubmitting ? "로그인 중..." : "로그인 링크 받기"}
        </Button>
      </div>
    </form>
  )
}

"use client"

import { useStore } from "@/lib/store"
import { ROLE_LABELS, type Role } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChevronDown, Check, UserCog } from "lucide-react"

const ROLES: Role[] = ["sales", "dispatcher", "installer", "splicer", "activator", "supervisor", "admin"]

export function RoleSwitcher({ onRoleChange }: { onRoleChange?: () => void }) {
  const { currentUser, setRole } = useStore()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm shadow-sm transition-colors hover:bg-accent">
        <Avatar className="h-7 w-7">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {currentUser.name.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="text-right leading-tight">
          <div className="font-semibold">{currentUser.name}</div>
          <div className="text-xs text-muted-foreground">{ROLE_LABELS[currentUser.role]}</div>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex items-center gap-2">
          <UserCog className="h-4 w-4" />
          تبديل الدور (للتجربة)
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ROLES.map((role) => (
          <DropdownMenuItem
            key={role}
            onClick={() => {
              setRole(role)
              onRoleChange?.()
            }}
            className="flex items-center justify-between"
          >
            <span>{ROLE_LABELS[role]}</span>
            {currentUser.role === role && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

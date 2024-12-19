import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { UserButton } from "@clerk/nextjs"

export function NavUser() {

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <UserButton />
        
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

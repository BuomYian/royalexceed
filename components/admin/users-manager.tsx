"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import type { User } from "@prisma/client";
import { inviteUserSchema, type InviteUserInput } from "@/lib/validations/user";
import { inviteUser, updateUser } from "@/lib/actions/users";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ROLES = ["SUPER_ADMIN", "ADMIN", "SALES", "SERVICE", "EDITOR"] as const;

export function UsersManager({ users }: { users: User[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<InviteUserInput>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: { email: "", fullName: "", role: "SALES" },
  });

  function onInvite(values: InviteUserInput) {
    startTransition(async () => {
      const result = await inviteUser(values);
      if (!result.success) toast.error(result.error);
      else {
        toast.success("Invitation sent");
        form.reset();
        router.refresh();
      }
    });
  }

  function changeRole(id: string, role: string) {
    startTransition(async () => {
      const result = await updateUser({ id, role: role as InviteUserInput["role"] });
      if (!result.success) toast.error(result.error);
      else router.refresh();
    });
  }

  function toggleActive(id: string, isActive: boolean) {
    startTransition(async () => {
      const result = await updateUser({ id, isActive });
      if (!result.success) toast.error(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <Dialog>
        <DialogTrigger render={<Button><Plus className="h-4 w-4" /> Invite staff</Button>} />
        <DialogContent>
          <DialogHeader><DialogTitle>Invite staff member</DialogTitle></DialogHeader>
          <form onSubmit={form.handleSubmit(onInvite)} className="space-y-3">
            <Input placeholder="Full name" {...form.register("fullName")} />
            <Input placeholder="Email" type="email" {...form.register("email")} />
            <Input placeholder="Phone (optional)" {...form.register("phone")} />
            <Select value={form.watch("role")} onValueChange={(v) => form.setValue("role", v as InviteUserInput["role"])}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => <SelectItem key={r} value={r}>{r.replace("_", " ")}</SelectItem>)}
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" />} Send invite
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.fullName}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Select value={u.role} onValueChange={(v) => changeRole(u.id, v)} disabled={pending}>
                      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => <SelectItem key={r} value={r}>{r.replace("_", " ")}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Switch checked={u.isActive} onCheckedChange={(v) => toggleActive(u.id, v)} disabled={pending} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

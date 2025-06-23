"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "./ui/label";

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  watchlistId: string;
  onMemberAdded: () => void;
}

export function InviteUserDialog({
  open,
  onOpenChange,
  watchlistId,
  onMemberAdded,
}: InviteUserDialogProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer');

  const handleInviteUser = async () => {
    setError(null);
    if (!email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/watchlists/${watchlistId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        setError(error || "Failed to add member");
        return;
      }

      toast({
        title: "Success!",
        description: "User has been added to the watchlist.",
      });
      onMemberAdded();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Invite user error:", error);
      setError(error.message || "Could not add user to the watchlist.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setEmail('');
      setError(null);
    }
    onOpenChange(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Watchlist by Email</DialogTitle>
          <DialogDescription>
            Enter the email of a registered user to add them to this watchlist.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
          <Input
              id="email"
            placeholder="user@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
              className="col-span-3"
          />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <select
              id="role"
              value={role}
              onChange={e => setRole(e.target.value as 'viewer' | 'editor')}
              disabled={loading}
              className="col-span-3 border rounded px-2 py-1"
            >
              <option value="viewer">Viewer (can only view)</option>
              <option value="editor">Editor (can add/remove items)</option>
            </select>
          </div>
          {error && (
            <p className="col-span-4 text-center text-sm text-red-500">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleInviteUser} disabled={loading} className="w-full">
            {loading ? "Adding..." : "Add User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
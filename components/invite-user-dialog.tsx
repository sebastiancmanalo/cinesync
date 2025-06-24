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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
      <DialogContent className="font-sans">
        <DialogHeader>
          <DialogTitle className="font-heading">Share Watchlist by Email</DialogTitle>
          <DialogDescription className="font-sans">
            Enter the email of a registered user to add them to this watchlist.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right font-sans">
              Email
            </Label>
          <Input
              id="email"
            placeholder="user@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
              className="col-span-3 font-sans"
          />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right font-sans">
              Role
            </Label>
            <Select
              value={role}
              onValueChange={value => setRole(value as 'viewer' | 'editor')}
            >
              <SelectTrigger disabled={loading} className="col-span-3">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="font-sans">
                <SelectItem value="viewer" className="font-sans">Viewer (can only view)</SelectItem>
                <SelectItem value="editor" className="font-sans">Editor (can add/remove items)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && (
            <p className="col-span-4 text-center text-sm text-red-500 font-sans">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleInviteUser} disabled={loading} className="w-full font-sans">
            {loading ? "Adding..." : "Add User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
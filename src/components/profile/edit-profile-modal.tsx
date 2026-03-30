"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUpdateProfile } from "@/hooks/use-api";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    id?: string;
    name?: string;
    bio?: string;
  };
  onSuccess?: () => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onSuccess,
}: EditProfileModalProps) {
  const [name, setName] = useState(profile?.name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateProfileMutation = useUpdateProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }

    if (name.trim().length > 50) {
      toast.error("Name must be 50 characters or less");
      return;
    }

    if (bio.trim().length > 500) {
      toast.error("Bio must be 500 characters or less");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfileMutation.mutateAsync({
        name: name.trim(),
        bio: bio.trim(),
      });

      toast.success("Profile updated successfully!");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to update profile:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/8 relative animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          <X size={20} className="text-white/50" />
        </button>

        <div className="flex flex-col gap-1 mb-8">
          <h3 className="font-display text-2xl font-bold text-white tracking-tight">
            Edit Profile
          </h3>
          <p className="text-white/40 font-medium uppercase tracking-widest text-[10px]">
            Update your profile information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={50}
              disabled={isSubmitting}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 disabled:opacity-50 transition-colors"
            />
            <p className="text-xs text-white/50">{name.length}/50 characters</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              maxLength={500}
              disabled={isSubmitting}
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 disabled:opacity-50 transition-colors resize-none"
            />
            <p className="text-xs text-white/50">{bio.length}/500 characters</p>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-full border border-white/10 text-white/80 hover:bg-white/5 disabled:opacity-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-full bg-amber-400 text-black hover:bg-amber-300 disabled:opacity-50 transition-colors font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, X, Loader2 } from "lucide-react";

interface UsernameFormProps {
  initialUsername: string;
  initialBio: string;
  onSave: (username: string, bio: string) => Promise<{ error?: string }>;
  submitLabel?: string;
  showBio?: boolean;
}

export default function UsernameForm({
  initialUsername,
  initialBio,
  onSave,
  submitLabel = "Save",
  showBio = true,
}: UsernameFormProps) {
  const [username, setUsername] = useState(initialUsername);
  const [bio, setBio] = useState(initialBio);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const checkAvailability = useCallback(async (value: string) => {
    if (value.length < 3) {
      setAvailable(null);
      return;
    }
    setChecking(true);
    try {
      const res = await fetch(`/api/user/check-username?username=${encodeURIComponent(value)}`);
      const data = await res.json();
      setAvailable(data.available ?? false);
    } catch {
      setAvailable(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (username === initialUsername && initialUsername) {
      setAvailable(true);
      return;
    }
    if (username.length < 3) {
      setAvailable(null);
      return;
    }
    const timer = setTimeout(() => checkAvailability(username), 400);
    return () => clearTimeout(timer);
  }, [username, initialUsername, checkAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || username.length < 3 || available === false) return;

    setSaving(true);
    setError(null);
    setSuccess(false);
    const result = await onSave(username, bio);
    setSaving(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          Username
        </label>
        <div className="relative mt-1">
          <input
            type="text"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
            }
            placeholder="your-username"
            maxLength={30}
            className="w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 pr-10 text-sm text-stone-900 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:focus:border-stone-500 dark:focus:ring-stone-700"
          />
          <div className="absolute inset-y-0 right-3 flex items-center">
            {checking && <Loader2 className="h-4 w-4 animate-spin text-stone-400" />}
            {!checking && available === true && username.length >= 3 && (
              <Check className="h-4 w-4 text-emerald-500" />
            )}
            {!checking && available === false && (
              <X className="h-4 w-4 text-red-500" />
            )}
          </div>
        </div>
        <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
          3-30 characters, lowercase letters, numbers, and hyphens only
        </p>
        {!checking && available === false && (
          <p className="mt-1 text-xs text-red-500">Username is already taken</p>
        )}
      </div>

      {showBio && (
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 200))}
            placeholder="Tell people about yourself..."
            rows={3}
            maxLength={200}
            className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:focus:border-stone-500 dark:focus:ring-stone-700"
          />
          <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
            {bio.length}/200 characters
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {success && <p className="text-sm text-emerald-600 dark:text-emerald-400">Saved!</p>}

      <button
        type="submit"
        disabled={saving || !username || username.length < 3 || available === false}
        className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
      >
        {saving ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

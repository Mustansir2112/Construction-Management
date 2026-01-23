"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image, Video, X, Mic, Loader2, CheckCircle2 } from "lucide-react";
import VoiceRecorder from "@/components/dpr/VoiceRecorder";

export default function CreateDPRForm({ onSuccess }: { onSuccess?: () => void }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    work_done: "",
    labor_count: 0,
    materials_used: "",
    issues: "",
  });
  const [voiceText, setVoiceText] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Auto-assign project from worker assignment
  useEffect(() => {
    async function fetchWorkerProject() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoadingProject(false);
        return;
      }

      // Get worker's assigned project
      const { data: assignment } = await supabase
        .from("project_assignments")
        .select("project_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (assignment) {
        setProjectId(assignment.project_id);
      }
      setLoadingProject(false);
    }

    fetchWorkerProject();
  }, []);

  // Summarize text
  function summarizeText(text: string): string {
    if (!text || text.length < 100) return text;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const summary = sentences.slice(0, 3).join(". ");
    return summary + (sentences.length > 3 ? "..." : "");
  }

  function handleVoiceText(text: string) {
    setVoiceText(text);
    setForm(prev => ({
      ...prev,
      work_done: text,
    }));
  }

  function handleFileSelect(
    e: React.ChangeEvent<HTMLInputElement>,
    type: "photo" | "video"
  ) {
    const files = Array.from(e.target.files || []);
    const maxSize = 30 * 1024 * 1024; // 30MB

    files.forEach((file) => {
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Maximum size is 30MB.`);
        return;
      }

      if (type === "photo" && file.type.startsWith("image/")) {
        setPhotos((prev) => [...prev, file]);
      } else if (type === "video" && file.type.startsWith("video/")) {
        setVideos((prev) => [...prev, file]);
      } else {
        alert(`${file.name} is not a valid ${type} file.`);
      }
    });
  }

  function removeFile(index: number, type: "photo" | "video") {
    if (type === "photo") {
      setPhotos((prev) => prev.filter((_, i) => i !== index));
    } else {
      setVideos((prev) => prev.filter((_, i) => i !== index));
    }
  }

  async function uploadFiles(): Promise<{ photos: string[]; videos: string[] }> {
    const supabase = createClient();
    const photoUrls: string[] = [];
    const videoUrls: string[] = [];

    // Upload photos to dpr bucket
    for (const photo of photos) {
      const fileName = `photos/${Date.now()}-${Math.random().toString(36).substring(7)}-${photo.name}`;
      const { data, error } = await supabase.storage
        .from("dpr")
        .upload(fileName, photo, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error("Error uploading photo:", error);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("dpr")
        .getPublicUrl(fileName);
      photoUrls.push(urlData.publicUrl);
    }

    // Upload videos to dpr bucket
    for (const video of videos) {
      const fileName = `videos/${Date.now()}-${Math.random().toString(36).substring(7)}-${video.name}`;
      const { data, error } = await supabase.storage
        .from("dpr")
        .upload(fileName, video, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error("Error uploading video:", error);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("dpr")
        .getPublicUrl(fileName);
      videoUrls.push(urlData.publicUrl);
    }

    return { photos: photoUrls, videos: videoUrls };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to create a DPR");
      }

      if (!form.work_done.trim()) {
        throw new Error("Work done is required");
      }

      // Upload media files
      const { photos: photoUrls, videos: videoUrls } = await uploadFiles();

      // Create DPR
      const dprData = {
        project_id: projectId,
        date: form.date,
        work_done: form.work_done,
        labor_count: form.labor_count || 0,
        materials_used: form.materials_used || null,
        issues: form.issues || null,
        photos: photoUrls,
        videos: videoUrls,
        full_text: form.work_done,
        short_summary: summarizeText(form.work_done),
        created_by: user.id,
      };

      const response = await fetch("/api/dprs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dprData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create DPR");
      }

      setSuccess(true);
      
      // Reset form
      setForm({
        date: new Date().toISOString().split("T")[0],
        work_done: "",
        labor_count: 0,
        materials_used: "",
        issues: "",
      });
      setVoiceText("");
      setPhotos([]);
      setVideos([]);

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          setSuccess(false);
        }, 2000);
      }
    } catch (err) {
      setError(formatErrorForUser(err));
    } finally {
      setUploading(false);
    }
  }

  if (loadingProject) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Create Daily Progress Report</h3>
        {projectId && (
          <span className="text-xs text-muted-foreground bg-blue-50 px-2 py-1 rounded">
            Project Assigned
          </span>
        )}
      </div>

      {/* Date */}
      <div>
        <Label htmlFor="date">Date *</Label>
        <Input
          id="date"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
          className="mt-1"
        />
      </div>

      {/* Voice Recording */}
      <div>
        <Label>Voice Update (Hindi)</Label>
        <div className="mt-2">
          <VoiceRecorder onText={handleVoiceText} />
        </div>
        {voiceText && (
          <p className="text-xs text-muted-foreground mt-2">
            Voice captured: {voiceText.substring(0, 50)}...
          </p>
        )}
      </div>

      {/* Work Done */}
      <div>
        <Label htmlFor="work_done">Work Done *</Label>
        <textarea
          id="work_done"
          value={form.work_done}
          onChange={(e) => setForm({ ...form, work_done: e.target.value })}
          placeholder="Describe the work done today..."
          className="mt-1 w-full border rounded px-3 py-2 h-24 text-sm"
          required
        />
      </div>

      {/* Labor Count */}
      <div>
        <Label htmlFor="labor_count">Labor Count</Label>
        <Input
          id="labor_count"
          type="number"
          value={form.labor_count}
          onChange={(e) => setForm({ ...form, labor_count: parseInt(e.target.value) || 0 })}
          min="0"
          className="mt-1"
        />
      </div>

      {/* Materials Used */}
      <div>
        <Label htmlFor="materials_used">Materials Used</Label>
        <textarea
          id="materials_used"
          value={form.materials_used}
          onChange={(e) => setForm({ ...form, materials_used: e.target.value })}
          placeholder="List materials used..."
          className="mt-1 w-full border rounded px-3 py-2 h-20 text-sm"
        />
      </div>

      {/* Issues */}
      <div>
        <Label htmlFor="issues">Issues</Label>
        <textarea
          id="issues"
          value={form.issues}
          onChange={(e) => setForm({ ...form, issues: e.target.value })}
          placeholder="Any issues or concerns..."
          className="mt-1 w-full border rounded px-3 py-2 h-20 text-sm"
        />
      </div>

      {/* Photo Upload */}
      <div>
        <Label>Photos (Max 30MB each)</Label>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e, "photo")}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => photoInputRef.current?.click()}
          className="w-full mt-2"
        >
          <Image className="w-4 h-4 mr-2" />
          Add Photos
        </Button>
        {photos.length > 0 && (
          <div className="mt-2 space-y-2">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm"
              >
                <span className="truncate flex-1">
                  {photo.name} ({(photo.size / 1024 / 1024).toFixed(2)} MB)
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index, "photo")}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Upload */}
      <div>
        <Label>Videos (Max 30MB each)</Label>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          multiple
          onChange={(e) => handleFileSelect(e, "video")}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => videoInputRef.current?.click()}
          className="w-full mt-2"
        >
          <Video className="w-4 h-4 mr-2" />
          Add Videos
        </Button>
        {videos.length > 0 && (
          <div className="mt-2 space-y-2">
            {videos.map((video, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm"
              >
                <span className="truncate flex-1">
                  {video.name} ({(video.size / 1024 / 1024).toFixed(2)} MB)
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index, "video")}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          DPR created successfully!
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={uploading}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating DPR...
          </>
        ) : (
          "Create DPR"
        )}
      </Button>
    </form>
  );
}

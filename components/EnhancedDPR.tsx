"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Mic, Image, Video, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import VoiceRecorder from "@/components/dpr/VoiceRecorder";
import { getUserRole } from "@/lib/roleGuard";

interface DPR {
  id: string;
  date: string;
  work_done: string;
  labor_count: number;
  materials_used?: string | null;
  issues: string | null;
  photos?: string[];
  videos?: string[];
  full_text?: string;
  short_summary?: string;
}

export function EnhancedDPR() {
  const [dprs, setDprs] = useState<DPR[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDPR, setSelectedDPR] = useState<DPR | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loadedCount, setLoadedCount] = useState(5);
  const [userRole, setUserRole] = useState<string>("worker");

  // Form state
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    work_done: "",
    labor_count: 0,
    materials_used: "",
    issues: "",
    full_text: "",
    short_summary: "",
  });
  const [voiceText, setVoiceText] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDPRs();
    // Get user role to determine if create button should be shown
    async function getRole() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const role = await getUserRole(user.id);
        setUserRole(role);
      }
    }
    getRole();
  }, []);

  async function fetchDPRs() {
    try {
      const response = await fetch("/api/dprs");
      const data = await response.json();
      if (Array.isArray(data)) {
        setDprs(data);
      }
    } catch (error) {
      console.error("Error fetching DPRs:", error);
    } finally {
      setLoading(false);
    }
  }

  // Summarize text (simple client-side summarization)
  function summarizeText(text: string): string {
    if (!text || text.length < 100) return text;
    
    // Split into sentences and take first 2-3 sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const summary = sentences.slice(0, 3).join(". ");
    return summary + (sentences.length > 3 ? "..." : "");
  }

  // Handle voice text
  function handleVoiceText(text: string) {
    setVoiceText(text);
    setForm(prev => ({
      ...prev,
      work_done: text,
      full_text: text,
      short_summary: summarizeText(text),
    }));
  }

  // Handle file selection
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

  // Remove file
  function removeFile(index: number, type: "photo" | "video") {
    if (type === "photo") {
      setPhotos((prev) => prev.filter((_, i) => i !== index));
    } else {
      setVideos((prev) => prev.filter((_, i) => i !== index));
    }
  }

  // Upload files to Supabase Storage (dpr bucket)
  async function uploadFiles(): Promise<{ photos: string[]; videos: string[] }> {
    const supabase = createClient();
    const photoUrls: string[] = [];
    const videoUrls: string[] = [];

    try {
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
          if (error.message.includes("Bucket not found")) {
            throw new Error("Storage bucket 'dpr' not found. Please create it in Supabase Dashboard > Storage.");
          }
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
          if (error.message.includes("Bucket not found")) {
            throw new Error("Storage bucket 'dpr' not found. Please create it in Supabase Dashboard > Storage.");
          }
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("dpr")
          .getPublicUrl(fileName);
        videoUrls.push(urlData.publicUrl);
      }
    } catch (error) {
      throw error; // Re-throw to be caught by handleSubmit
    }

    return { photos: photoUrls, videos: videoUrls };
  }

  // Submit DPR
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);

    try {
      // Upload media files
      const { photos: photoUrls, videos: videoUrls } = await uploadFiles();

      // Get current user for created_by
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to create a DPR");
      }

      // Auto-assign project if not provided
      let projectId = null;
      const { data: assignment } = await supabase
        .from("project_assignments")
        .select("project_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();
      
      if (assignment) {
        projectId = assignment.project_id;
      }

      // Create DPR with media URLs
      const dprData = {
        project_id: projectId,
        date: form.date,
        work_done: form.work_done,
        labor_count: form.labor_count || 0,
        materials_used: form.materials_used || null,
        issues: form.issues || null,
        photos: photoUrls,
        videos: videoUrls,
        full_text: form.full_text || form.work_done,
        short_summary: form.short_summary || summarizeText(form.work_done),
        created_by: user.id,
      };

      const response = await fetch("/api/dprs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dprData),
      });

      if (!response.ok) {
        throw new Error("Failed to create DPR");
      }

      // Reset form
      setForm({
        date: new Date().toISOString().split("T")[0],
        work_done: "",
        labor_count: 0,
        materials_used: "",
        issues: "",
        full_text: "",
        short_summary: "",
      });
      setVoiceText("");
      setPhotos([]);
      setVideos([]);
      setIsCreateOpen(false);

      // Refresh DPRs
      await fetchDPRs();
      alert("DPR created successfully!");
    } catch (error) {
      console.error("Error creating DPR:", error);
      const errorMessage = formatErrorForUser(error);
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  }

  const displayedDPRs = dprs.slice(0, loadedCount);

  return (
    <>
      <Card className="p-6 transition-all duration-500 hover:shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Daily Progress Reports
          </h2>
          {/* Only show create button for workers, not managers */}
          {userRole === "worker" && (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                New DPR
              </Button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {displayedDPRs.map((dpr) => (
                <div
                  key={dpr.id}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-secondary transition-all border border-border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground text-sm">
                        {new Date(dpr.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      {(dpr.photos?.length || dpr.videos?.length) && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {dpr.photos?.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Image className="w-3 h-3" />
                              {dpr.photos.length}
                            </span>
                          )}
                          {dpr.videos?.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Video className="w-3 h-3" />
                              {dpr.videos.length}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {dpr.short_summary || dpr.work_done}
                    </p>
                    {dpr.labor_count > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {dpr.labor_count} workers
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      onClick={() => {
                        setSelectedDPR(dpr);
                        setIsPreviewOpen(true);
                      }}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {loadedCount < dprs.length && (
              <Button
                variant="outline"
                className="w-full mt-4 h-9"
                onClick={() => setLoadedCount((prev) => Math.min(prev + 5, dprs.length))}
              >
                Load More ({dprs.length - loadedCount} remaining)
              </Button>
            )}
          </>
        )}
      </Card>

      {/* Create DPR Dialog - Only show for workers */}
      {userRole === "worker" && (
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Daily Progress Report</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            {/* Voice Recording */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Voice Update (Hindi)
              </label>
              <VoiceRecorder onText={handleVoiceText} />
              {voiceText && (
                <p className="text-xs text-muted-foreground mt-2">
                  Voice text captured: {voiceText.substring(0, 50)}...
                </p>
              )}
            </div>

            {/* Work Done */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Work Done *
              </label>
              <textarea
                value={form.work_done}
                onChange={(e) => {
                  const text = e.target.value;
                  setForm({
                    ...form,
                    work_done: text,
                    full_text: text,
                    short_summary: summarizeText(text),
                  });
                }}
                placeholder="Describe the work done today..."
                className="w-full border rounded px-3 py-2 h-24"
                required
              />
            </div>

            {/* Summary Preview */}
            {form.short_summary && (
              <div className="bg-blue-50 border border-blue-200 rounded p-2">
                <p className="text-xs font-medium text-blue-800 mb-1">
                  Summary:
                </p>
                <p className="text-xs text-blue-700">{form.short_summary}</p>
              </div>
            )}

            {/* Labor Count */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Labor Count
              </label>
              <input
                type="number"
                value={form.labor_count}
                onChange={(e) =>
                  setForm({ ...form, labor_count: parseInt(e.target.value) || 0 })
                }
                className="w-full border rounded px-3 py-2"
                min="0"
              />
            </div>

            {/* Materials Used */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Materials Used
              </label>
              <textarea
                value={form.materials_used}
                onChange={(e) =>
                  setForm({ ...form, materials_used: e.target.value })
                }
                placeholder="List materials used..."
                className="w-full border rounded px-3 py-2 h-20"
              />
            </div>

            {/* Issues */}
            <div>
              <label className="block text-sm font-medium mb-1">Issues</label>
              <textarea
                value={form.issues}
                onChange={(e) => setForm({ ...form, issues: e.target.value })}
                placeholder="Any issues or concerns..."
                className="w-full border rounded px-3 py-2 h-20"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Photos (Max 30MB each)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileSelect(e, "photo")}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Image className="w-4 h-4 mr-2" />
                Add Photos
              </Button>
              {photos.length > 0 && (
                <div className="mt-2 space-y-2">
                  {photos.map((photo, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-slate-50 rounded"
                    >
                      <span className="text-sm text-slate-700 truncate flex-1">
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
              <label className="block text-sm font-medium mb-2">
                Videos (Max 30MB each)
              </label>
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
                className="w-full"
              >
                <Video className="w-4 h-4 mr-2" />
                Add Videos
              </Button>
              {videos.length > 0 && (
                <div className="mt-2 space-y-2">
                  {videos.map((video, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-slate-50 rounded"
                    >
                      <span className="text-sm text-slate-700 truncate flex-1">
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

            {/* Submit */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Create DPR"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      )}

      {/* View DPR Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              DPR - {selectedDPR && new Date(selectedDPR.date).toLocaleDateString()}
            </DialogTitle>
          </DialogHeader>

          {selectedDPR && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Work Done:</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedDPR.work_done}
                </p>
              </div>

              {selectedDPR.short_summary && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <h3 className="font-semibold text-blue-800 mb-1 text-sm">
                    Summary:
                  </h3>
                  <p className="text-sm text-blue-700">
                    {selectedDPR.short_summary}
                  </p>
                </div>
              )}

              {selectedDPR.labor_count > 0 && (
                <div>
                  <h3 className="font-semibold mb-1">Labor Count:</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedDPR.labor_count} workers
                  </p>
                </div>
              )}

              {selectedDPR.materials_used && (
                <div>
                  <h3 className="font-semibold mb-1">Materials Used:</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedDPR.materials_used}
                  </p>
                </div>
              )}

              {selectedDPR.issues && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <h3 className="font-semibold text-red-800 mb-1">Issues:</h3>
                  <p className="text-sm text-red-700">{selectedDPR.issues}</p>
                </div>
              )}

              {/* Photos */}
              {selectedDPR.photos && selectedDPR.photos.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Photos ({selectedDPR.photos.length}):
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedDPR.photos.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`DPR photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-90 transition"
                          onClick={() => window.open(url, "_blank")}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition rounded flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="text-white text-xs">Click to view</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {selectedDPR.videos && selectedDPR.videos.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Videos ({selectedDPR.videos.length}):
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedDPR.videos.map((url, index) => (
                      <div key={index} className="relative">
                        <video
                          src={url}
                          controls
                          className="w-full rounded border max-h-96"
                          preload="metadata"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* If no media but PDF exists, show PDF viewer */}
              {(!selectedDPR.photos || selectedDPR.photos.length === 0) &&
                (!selectedDPR.videos || selectedDPR.videos.length === 0) && (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No media attached to this DPR
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

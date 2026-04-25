import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImagePlus, X, Loader2, Sparkles } from "lucide-react";
import type { Post } from "@/types";
import type { FormMode } from "@/app.const";
import { usePostAssistMutation } from "@/store/api";

interface PostFormData {
  content: string;
  image?: File | null;
  removeImage?: boolean;
}

type AssistSuggestion = {
  originalText: string;
  improvedText: string;
  summary: string;
  hashtags: string[];
  category: string;
  improvementNotes: string[];
};

interface PostFormProps {
  mode: FormMode;
  initialData?: Post;
  onSubmit: (data: PostFormData) => void | Promise<void>;
  onCancel?: () => void;
}

export function PostForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
}: PostFormProps) {
  const [content, setContent] = useState(initialData?.content ?? "");
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    initialData?.image,
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assistIntent, setAssistIntent] = useState<
    "help-request" | "offer-help" | "general"
  >("general");
  const [assistTone, setAssistTone] = useState<"friendly" | "formal" | "short">(
    "friendly",
  );
  const [assistError, setAssistError] = useState<string | null>(null);
  const [assistSuggestion, setAssistSuggestion] = useState<AssistSuggestion | null>(
    null,
  );
  const [lastOriginalBeforeApply, setLastOriginalBeforeApply] = useState<
    string | null
  >(null);
  const [postAssist, { isLoading: isAiLoading }] = usePostAssistMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setSelectedImage(file);
      setIsImageRemoved(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(undefined);
    setSelectedImage(null);
    if (mode === "edit" && Boolean(initialData?.image)) {
      setIsImageRemoved(true);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        content: content.trim(),
        image: selectedImage,
        removeImage: isImageRemoved,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAskAi = async () => {
    setAssistError(null);
    if (content.trim().length < 10) {
      setAssistError("Please write at least 10 characters before using AI assist.");
      return;
    }

    try {
      const response = await postAssist({
        draft: content.trim(),
        intent: assistIntent,
        tone: assistTone,
      }).unwrap();
      setAssistSuggestion(response.data);
    } catch (error) {
      if (typeof error === "object" && error !== null && "status" in error) {
        const typedError = error as {
          status: number | string;
          data?: { message?: string };
        };
        if (typedError.status === 429) {
          setAssistError("AI rate limit reached. Please wait a bit and try again.");
          return;
        }
        if (typedError.status === "TIMEOUT_ERROR") {
          setAssistError("AI request timed out. Please try again.");
          return;
        }
        if (
          typedError.data &&
          typeof typedError.data === "object" &&
          typeof typedError.data.message === "string"
        ) {
          setAssistError(typedError.data.message);
          return;
        }
      }
      setAssistError("AI assist is currently unavailable. Please try again later.");
    }
  };

  const handleApplySuggestion = () => {
    if (!assistSuggestion) return;
    setLastOriginalBeforeApply(content);
    setContent(assistSuggestion.improvedText);
  };

  const handleCancelSuggestion = () => {
    setAssistSuggestion(null);
    setAssistError(null);
  };

  const handleRevertToOriginal = () => {
    if (!lastOriginalBeforeApply) return;
    setContent(lastOriginalBeforeApply);
  };

  const isValid = content.trim().length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "add" ? "Create New Post" : "Edit Post"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-32 resize-none"
            />
            <div className="rounded-lg border border-border p-3 space-y-3">
              <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="size-4" />
                  AI Assistant (optional)
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isAiLoading || isSubmitting}
                  onClick={handleAskAi}
                >
                  {isAiLoading ? "Generating..." : "Suggest better text"}
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <label className="text-sm text-muted-foreground">
                  Intent
                  <select
                    className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm"
                    value={assistIntent}
                    onChange={(e) =>
                      setAssistIntent(
                        e.target.value as "help-request" | "offer-help" | "general",
                      )
                    }
                    disabled={isAiLoading || isSubmitting}
                  >
                    <option value="general">General</option>
                    <option value="help-request">Help request</option>
                    <option value="offer-help">Offer help</option>
                  </select>
                </label>
                <label className="text-sm text-muted-foreground">
                  Tone
                  <select
                    className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm"
                    value={assistTone}
                    onChange={(e) =>
                      setAssistTone(e.target.value as "friendly" | "formal" | "short")
                    }
                    disabled={isAiLoading || isSubmitting}
                  >
                    <option value="friendly">Friendly</option>
                    <option value="formal">Formal</option>
                    <option value="short">Short</option>
                  </select>
                </label>
              </div>
              {assistError ? (
                <p className="text-sm text-red-600" role="alert">
                  {assistError}
                </p>
              ) : null}
            </div>
          </div>

          {assistSuggestion ? (
            <div className="space-y-3 rounded-lg border border-border p-4">
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <h3 className="font-medium text-foreground">AI suggestion comparison</h3>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelSuggestion}
                  >
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleApplySuggestion}>
                    Apply suggestion
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Original</Label>
                  <Textarea
                    value={assistSuggestion.originalText}
                    readOnly
                    className="min-h-28 resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Improved</Label>
                  <Textarea
                    value={assistSuggestion.improvedText}
                    readOnly
                    className="min-h-28 resize-none"
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Summary:</span> {assistSuggestion.summary}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Category:</span> {assistSuggestion.category}
              </p>
              {assistSuggestion.hashtags.length > 0 ? (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Hashtags:</span>{" "}
                  {assistSuggestion.hashtags.join(" ")}
                </p>
              ) : null}
              {assistSuggestion.improvementNotes.length > 0 ? (
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {assistSuggestion.improvementNotes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          {lastOriginalBeforeApply ? (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleRevertToOriginal}
                disabled={isSubmitting || isAiLoading}
              >
                Revert to original text
              </Button>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>Image (optional)</Label>
            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-auto max-h-64 object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 size-8"
                  onClick={handleRemoveImage}
                >
                  <X className="size-4" />
                  <span className="sr-only">Remove image</span>
                </Button>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                className="flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-muted-foreground hover:bg-muted/50 transition-colors"
              >
                <ImagePlus className="size-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click to upload an image
                </span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
              {mode === "add" ? "Create Post" : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

import React from "react";
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImagePlus, X, Loader2 } from "lucide-react";
import type { Post } from "@/types";
import type { FormMode } from "@/app.const";

interface PostFormData {
  content: string;
  image?: string;
}

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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(undefined);
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
        image: imagePreview,
      });
    } finally {
      setIsSubmitting(false);
    }
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
          </div>

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

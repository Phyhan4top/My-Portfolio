import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import {
  defaultPortfolio,
  portfolioSchema,
  type PortfolioData,
} from "@shared/schema";
import { usePortfolio } from "@/hooks/use-portfolio";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ADMIN_TOKEN_KEY = "portfolioAdminToken";

type UploadResult = {
  id: string;
  url: string;
  filename: string;
  contentType: string;
};

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = usePortfolio();
  const [token, setToken] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem(ADMIN_TOKEN_KEY) || ""
      : "",
  );
  const [jsonValue, setJsonValue] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingProjectIndex, setUploadingProjectIndex] = useState<number | null>(null);
  const [uploadingNewProject, setUploadingNewProject] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    const current = data ?? defaultPortfolio;
    setJsonValue(JSON.stringify(current, null, 2));
  }, [data]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  }, [token]);

  const applyJsonUpdate = (
    updater: (current: PortfolioData) => PortfolioData,
  ) => {
    try {
      const parsed = portfolioSchema.parse(JSON.parse(jsonValue));
      const updated = updater(parsed);
      setJsonValue(JSON.stringify(updated, null, 2));
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Fix the JSON before uploading files.";
      toast({
        variant: "destructive",
        title: "Invalid JSON",
        description: message,
      });
      return false;
    }
  };

  const uploadFile = async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(api.uploads.create.path, {
      method: api.uploads.create.method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      let message = "Upload failed.";
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const body = await res.json();
        if (body?.message) {
          message = body.field
            ? `${body.message} (field: ${body.field})`
            : body.message;
        }
      }
      throw new Error(message);
    }

    return api.uploads.create.responses[201].parse(await res.json());
  };

  const updateMutation = useMutation({
    mutationFn: async (payload: PortfolioData) => {
      const res = await fetch(api.portfolio.update.path, {
        method: api.portfolio.update.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = "Failed to update portfolio.";
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const body = await res.json();
          if (body?.message) {
            message = body.field
              ? `${body.message} (field: ${body.field})`
              : body.message;
          }
        }
        throw new Error(message);
      }

      return api.portfolio.update.responses[200].parse(await res.json());
    },
    onSuccess: (updated) => {
      queryClient.setQueryData([api.portfolio.get.path], updated);
      toast({
        title: "Portfolio updated",
        description: "Your changes are now live.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message,
      });
    },
  });

  const parsedValue = useMemo(() => {
    try {
      return JSON.parse(jsonValue);
    } catch {
      return null;
    }
  }, [jsonValue]);

  const handleSave = () => {
    try {
      const parsed = portfolioSchema.parse(JSON.parse(jsonValue));
      updateMutation.mutate(parsed);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid JSON payload.";
      toast({
        variant: "destructive",
        title: "Invalid data",
        description: message,
      });
    }
  };

  const handleReset = () => {
    setJsonValue(JSON.stringify(defaultPortfolio, null, 2));
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const result = await uploadFile(file);
      const updated = applyJsonUpdate((current) => ({
        ...current,
        hero: {
          ...current.hero,
          image: {
            url: result.url,
            alt:
              current.hero.image?.alt ||
              `${current.hero.profileCard.name} portrait`,
          },
        },
      }));

      if (updated) {
        toast({
          title: "Hero image uploaded",
          description: "Click Save changes to publish it.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Upload failed.",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleResumeUpload = async (file: File) => {
    setUploadingResume(true);
    try {
      const result = await uploadFile(file);
      const updated = applyJsonUpdate((current) => ({
        ...current,
        hero: {
          ...current.hero,
          secondaryCta: {
            ...current.hero.secondaryCta,
            href: result.url,
            newTab: true,
          },
        },
      }));

      if (updated) {
        toast({
          title: "Resume uploaded",
          description: "Click Save changes to publish it.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Upload failed.",
      });
    } finally {
      setUploadingResume(false);
    }
  };

  const handleProjectImageUpload = async (index: number, file: File) => {
    setUploadingProjectIndex(index);
    try {
      const result = await uploadFile(file);
      const updated = applyJsonUpdate((current) => {
        const nextItems = [...current.projects.items];
        const target = nextItems[index];
        if (!target) {
          return current;
        }
        nextItems[index] = { ...target, image: result.url };
        return {
          ...current,
          projects: {
            ...current.projects,
            items: nextItems,
          },
        };
      });

      if (updated) {
        toast({
          title: "Project image uploaded",
          description: "Click Save changes to publish it.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Upload failed.",
      });
    } finally {
      setUploadingProjectIndex(null);
    }
  };

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    try {
      const result = await uploadFile(file);
      const updated = applyJsonUpdate((current) => ({
        ...current,
        brand: {
          ...current.brand,
          logo: {
            url: result.url,
            alt: current.brand.logo?.alt || `${current.brand.name} logo`,
          },
        },
      }));

      if (updated) {
        toast({
          title: "Logo uploaded",
          description: "Click Save changes to publish it.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Upload failed.",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const addProject = (imageUrl?: string) => {
    applyJsonUpdate((current) => ({
      ...current,
      projects: {
        ...current.projects,
        items: [
          ...current.projects.items,
          {
            title: "New Project",
            description: "",
            tags: [],
            image: imageUrl || "",
            links: {
              demo: "#",
              github: "#",
            },
          },
        ],
      },
    }));
  };

  const handleNewProjectImage = async (file: File) => {
    setUploadingNewProject(true);
    try {
      const result = await uploadFile(file);
      addProject(result.url);
      toast({
        title: "Project created",
        description: "Edit details and Save changes to publish.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Upload failed.",
      });
    } finally {
      setUploadingNewProject(false);
    }
  };

  const currentPortfolio = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonValue);
      const validated = portfolioSchema.safeParse(parsed);
      return validated.success ? validated.data : null;
    } catch {
      return null;
    }
  }, [jsonValue]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-6 py-16 space-y-8">
        <div>
          <p className="text-sm uppercase tracking-widest text-primary mb-2">
            Portfolio Admin
          </p>
          <h1 className="text-3xl md:text-4xl font-display font-bold">
            Update your content
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Paste or edit the JSON below to update every section of your
            portfolio. Save to publish changes.
          </p>
        </div>

        <div className="space-y-3 max-w-xl">
          <label className="text-sm font-medium text-foreground">
            Admin Token
          </label>
          <Input
            type="password"
            placeholder="Enter ADMIN_TOKEN"
            value={token}
            onChange={(event) => setToken(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            The token is stored locally in your browser.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Hero Image</h2>
              <p className="text-sm text-muted-foreground">
                Upload a JPG/PNG/WEBP/GIF. Recommended square image.
              </p>
            </div>
            <FileDropZone
              accept="image/*"
              buttonLabel={uploadingImage ? "Uploading..." : "Choose Image"}
              disabled={uploadingImage || !token}
              onFileSelected={handleImageUpload}
            />
            <p className="text-xs text-muted-foreground">
              Current: {currentPortfolio?.hero.image?.url || "Not set"}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Resume / CV</h2>
              <p className="text-sm text-muted-foreground">
                Upload a PDF to replace the Download CV link.
              </p>
            </div>
            <FileDropZone
              accept="application/pdf"
              buttonLabel={uploadingResume ? "Uploading..." : "Choose PDF"}
              disabled={uploadingResume || !token}
              onFileSelected={handleResumeUpload}
            />
            <p className="text-xs text-muted-foreground">
              Current: {currentPortfolio?.hero.secondaryCta.href || "Not set"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Logo</h2>
            <p className="text-sm text-muted-foreground">
              Upload your logo (PNG/JPG/WEBP/GIF). Recommended square image.
            </p>
          </div>
          <FileDropZone
            accept="image/*"
            buttonLabel={uploadingLogo ? "Uploading..." : "Choose Logo"}
            disabled={uploadingLogo || !token}
            onFileSelected={handleLogoUpload}
          />
          <p className="text-xs text-muted-foreground">
            Current: {currentPortfolio?.brand.logo?.url || "Not set"}
          </p>
        </div>

        {currentPortfolio && (
          <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Projects</h2>
                <p className="text-sm text-muted-foreground">
                  Update project details and upload images.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => addProject()}
              >
                Add Project
              </Button>
            </div>

            <div className="space-y-6">
              {currentPortfolio.projects.items.map((project, index) => (
                <div
                  key={`${project.title}-${index}`}
                  className="rounded-xl border border-border p-4 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold">
                      Project {index + 1}
                    </p>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() =>
                        applyJsonUpdate((current) => ({
                          ...current,
                          projects: {
                            ...current.projects,
                            items: current.projects.items.filter(
                              (_, idx) => idx !== index,
                            ),
                          },
                        }))
                      }
                    >
                      Remove
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        value={project.title}
                        onChange={(event) =>
                          applyJsonUpdate((current) => {
                            const items = [...current.projects.items];
                            items[index] = {
                              ...items[index],
                              title: event.target.value,
                            };
                            return {
                              ...current,
                              projects: { ...current.projects, items },
                            };
                          })
                        }
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Tags</label>
                      <Input
                        value={project.tags.join(", ")}
                        onChange={(event) =>
                          applyJsonUpdate((current) => {
                            const items = [...current.projects.items];
                            items[index] = {
                              ...items[index],
                              tags: event.target.value
                                .split(",")
                                .map((tag) => tag.trim())
                                .filter(Boolean),
                            };
                            return {
                              ...current,
                              projects: { ...current.projects, items },
                            };
                          })
                        }
                        placeholder="React, Tailwind, Node"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={project.description}
                      onChange={(event) =>
                        applyJsonUpdate((current) => {
                          const items = [...current.projects.items];
                          items[index] = {
                            ...items[index],
                            description: event.target.value,
                          };
                          return {
                            ...current,
                            projects: { ...current.projects, items },
                          };
                        })
                      }
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Live Demo</label>
                      <Input
                        value={project.links.demo}
                        onChange={(event) =>
                          applyJsonUpdate((current) => {
                            const items = [...current.projects.items];
                            items[index] = {
                              ...items[index],
                              links: {
                                ...items[index].links,
                                demo: event.target.value,
                              },
                            };
                            return {
                              ...current,
                              projects: { ...current.projects, items },
                            };
                          })
                        }
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-medium">GitHub</label>
                      <Input
                        value={project.links.github}
                        onChange={(event) =>
                          applyJsonUpdate((current) => {
                            const items = [...current.projects.items];
                            items[index] = {
                              ...items[index],
                              links: {
                                ...items[index].links,
                                github: event.target.value,
                              },
                            };
                            return {
                              ...current,
                              projects: { ...current.projects, items },
                            };
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Project Image</label>
                    <FileDropZone
                      accept="image/*"
                      buttonLabel={
                        uploadingProjectIndex === index
                          ? "Uploading..."
                          : "Choose Image"
                      }
                      disabled={
                        uploadingProjectIndex !== null || !token
                      }
                      onFileSelected={(file) =>
                        handleProjectImageUpload(index, file)
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Current: {project.image || "Not set"}
                    </p>
                  </div>
                </div>
              ))}

              <div className="rounded-xl border border-dashed border-border p-6">
                <p className="text-sm text-muted-foreground mb-3">
                  Create a new project with an image:
                </p>
                <FileDropZone
                  accept="image/*"
                  buttonLabel={uploadingNewProject ? "Uploading..." : "Add Project Image"}
                  disabled={uploadingNewProject || !token}
                  onFileSelected={handleNewProjectImage}
                />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-sm text-muted-foreground">
              {isLoading ? "Loading content..." : "Editing live content."}
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleReset}
              >
                Reset to defaults
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={updateMutation.isPending || !parsedValue || !token}
              >
                {updateMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>

          <Textarea
            value={jsonValue}
            onChange={(event) => setJsonValue(event.target.value)}
            className="min-h-[520px] font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
}

type FileDropZoneProps = {
  accept: string;
  buttonLabel: string;
  disabled?: boolean;
  onFileSelected: (file: File) => void;
};

function FileDropZone({
  accept,
  buttonLabel,
  disabled,
  onFileSelected,
}: FileDropZoneProps) {
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
      className={`rounded-xl border border-dashed px-6 py-8 text-center transition-colors ${
        dragging ? "border-primary bg-primary/5" : "border-border"
      } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
    >
      <p className="text-sm text-muted-foreground mb-4">
        Drag & drop a file here, or click to select.
      </p>
      <label className="inline-flex cursor-pointer">
        <Input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
          disabled={disabled}
        />
        <span className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
          {buttonLabel}
        </span>
      </label>
    </div>
  );
}

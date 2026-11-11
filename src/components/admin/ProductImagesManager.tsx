"use client";

import { useRef, useState, type DragEvent, type FormEvent } from "react";
import Image from "next/image";

export type ManagedProductImage = {
  id: number;
  url: string;
  storagePath: string | null;
  isPrimary: boolean;
  sortOrder: number;
};

type UploadState = {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
};

function orderImages(images: ManagedProductImage[]) {
  return [...images].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.id - b.id
  );
}

export default function ProductImagesManager({
  productId,
  initialImages,
}: {
  productId: number;
  initialImages: ManagedProductImage[];
}) {
  const [images, setImages] = useState(() => orderImages(initialImages));
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const basePath = `/api/admin/products/${productId}/images`;

  function updateUpload(id: string, update: Partial<UploadState>) {
    setUploads((current) =>
      current.map((upload) => (upload.id === id ? { ...upload, ...update } : upload))
    );
  }

  async function uploadFiles(files: FileList | File[]) {
    const selectedFiles = Array.from(files);
    if (selectedFiles.length === 0) return;
    setError(null);

    for (const [index, file] of selectedFiles.entries()) {
      const uploadId = `${Date.now()}-${index}-${file.name}`;
      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
        setUploads((current) => [
          ...current,
          {
            id: uploadId,
            name: file.name,
            progress: 0,
            status: "error",
            error: "Formato não aceito. Use PNG, JPEG ou WebP.",
          },
        ]);
        continue;
      }
      if (file.size > 8 * 1024 * 1024) {
        setUploads((current) => [
          ...current,
          {
            id: uploadId,
            name: file.name,
            progress: 0,
            status: "error",
            error: "A imagem ultrapassa o limite de 8 MB.",
          },
        ]);
        continue;
      }

      setUploads((current) => [
        ...current,
        { id: uploadId, name: file.name, progress: 8, status: "uploading" },
      ]);
      try {
        const formData = new FormData();
        formData.append("file", file);
        updateUpload(uploadId, { progress: 35 });
        const response = await fetch(`${basePath}/upload`, {
          method: "POST",
          body: formData,
        });
        const result = (await response.json()) as {
          ok?: boolean;
          error?: string;
          image?: ManagedProductImage;
        };
        if (!response.ok || !result.image) {
          throw new Error(result.error ?? "Falha no envio da imagem.");
        }
        setImages((current) => orderImages([...current, result.image!]));
        updateUpload(uploadId, { progress: 100, status: "done" });
      } catch (uploadError) {
        updateUpload(uploadId, {
          status: "error",
          error:
            uploadError instanceof Error
              ? uploadError.message
              : "Falha no envio da imagem.",
        });
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    void uploadFiles(event.dataTransfer.files);
  }

  async function addUrl(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const response = await fetch(basePath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const result = (await response.json()) as {
      ok?: boolean;
      error?: string;
      image?: ManagedProductImage;
    };
    if (!response.ok || !result.image) {
      setError(result.error ?? "Não foi possível adicionar a URL.");
      return;
    }
    setImages((current) => orderImages([...current, result.image!]));
    setUrl("");
  }

  async function makePrimary(imageId: number) {
    setError(null);
    const response = await fetch(`${basePath}/${imageId}/primary`, { method: "POST" });
    const result = (await response.json()) as {
      ok?: boolean;
      error?: string;
      images?: ManagedProductImage[];
    };
    if (!response.ok || !result.images) {
      setError(result.error ?? "Não foi possível alterar a imagem principal.");
      return;
    }
    setImages(orderImages(result.images));
  }

  async function moveImage(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const previous = images;
    const reordered = [...images];
    [reordered[index], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[index],
    ];
    const withOrder = reordered.map((image, sortOrder) => ({ ...image, sortOrder }));
    setImages(withOrder);

    const response = await fetch(`${basePath}/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: withOrder.map((image) => image.id) }),
    });
    if (!response.ok) {
      setImages(previous);
      const result = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(result?.error ?? "Não foi possível reordenar as imagens.");
    }
  }

  async function removeImage(image: ManagedProductImage) {
    if (!window.confirm("Excluir esta imagem da peça?")) return;
    setError(null);
    const response = await fetch(`${basePath}/${image.id}`, { method: "DELETE" });
    const result = (await response.json()) as {
      ok?: boolean;
      error?: string;
      images?: ManagedProductImage[];
    };
    if (!response.ok || !result.images) {
      setError(result.error ?? "Não foi possível excluir a imagem.");
      return;
    }
    setImages(orderImages(result.images));
  }

  return (
    <section className="border border-line bg-surface p-5 sm:p-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
          Arquivos do produto
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold uppercase text-fg">Fotos</h2>
      </div>

      <div
        role="group"
        aria-label="Enviar fotos da peça"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        className="mt-5 border border-dashed border-line bg-bg p-5 text-center sm:p-7"
      >
        <p className="text-sm text-steel">Arraste imagens para esta área</p>
        <p className="mt-1 text-xs text-muted">PNG, JPEG ou WebP · até 8 MB por arquivo</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="sr-only"
          aria-label="Selecionar arquivos de imagem"
          onChange={(event) => {
            if (event.target.files) void uploadFiles(event.target.files);
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 min-h-10 border border-line px-4 text-sm text-fg transition-colors hover:border-accent/50 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Escolher arquivos
        </button>
      </div>

      {uploads.length > 0 ? (
        <ul aria-live="polite" className="mt-4 space-y-2">
          {uploads.map((upload) => (
            <li key={upload.id} className="border border-line bg-bg p-3">
              <div className="flex justify-between gap-3 text-xs">
                <span className="truncate text-steel">{upload.name}</span>
                <span className={upload.status === "error" ? "text-red-300" : "text-muted"}>
                  {upload.status === "done"
                    ? "Concluído"
                    : upload.status === "error"
                      ? "Erro"
                      : "Enviando"}
                </span>
              </div>
              <div
                role="progressbar"
                aria-label={`Progresso de ${upload.name}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={upload.progress}
                className="mt-2 h-1.5 bg-surface-2"
              >
                <div
                  className={`h-full transition-[width] duration-300 ${
                    upload.status === "error" ? "bg-red-400" : "bg-accent"
                  }`}
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
              {upload.error ? (
                <p className="mt-2 text-xs text-red-300">{upload.error}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      <form onSubmit={addUrl} className="mt-5 border-t border-line pt-5">
        <label htmlFor={`image-url-${productId}`} className="text-xs font-medium text-steel">
          Adicionar por URL
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id={`image-url-${productId}`}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="/catalog/colheitadeira/codigo.png ou https://..."
            className="min-h-11 min-w-0 flex-1 border border-line bg-bg px-3 text-sm text-fg outline-none placeholder:text-muted focus:border-accent"
          />
          <button
            type="submit"
            disabled={!url.trim()}
            className="min-h-11 border border-line px-4 text-sm text-steel transition-colors hover:border-accent/50 hover:text-accent disabled:opacity-50"
          >
            Adicionar
          </button>
        </div>
      </form>

      {error ? (
        <p role="alert" className="mt-4 border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <div className="mt-5 border-t border-line pt-5">
        <p className="text-xs text-muted">{images.length} imagens cadastradas</p>
        {images.length > 0 ? (
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((image, index) => (
              <li key={image.id} className="border border-line bg-bg p-2">
                <div className="relative aspect-square bg-[radial-gradient(circle_at_50%_60%,#2a2f36,#14171b_70%)]">
                  <Image
                    src={image.url}
                    alt={`Foto ${index + 1} da peça`}
                    fill
                    sizes="(max-width: 639px) 45vw, 180px"
                    className="object-contain p-3"
                  />
                  {image.isPrimary ? (
                    <span className="absolute left-2 top-2 border border-accent/40 bg-bg/90 px-2 py-1 font-mono text-[9px] uppercase text-accent">
                      Principal
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 truncate font-mono text-[9px] text-muted">
                  {image.storagePath ?? image.url}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Definir foto ${index + 1} como principal`}
                    disabled={image.isPrimary}
                    onClick={() => void makePrimary(image.id)}
                    className="min-h-8 border border-line px-2 text-[10px] text-steel hover:border-accent/50 hover:text-accent disabled:text-accent"
                  >
                    ★ Principal
                  </button>
                  <button
                    type="button"
                    aria-label={`Mover foto ${index + 1} para cima`}
                    disabled={index === 0}
                    onClick={() => void moveImage(index, -1)}
                    className="grid h-8 w-8 place-items-center border border-line text-steel hover:border-accent/50 hover:text-accent disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label={`Mover foto ${index + 1} para baixo`}
                    disabled={index === images.length - 1}
                    onClick={() => void moveImage(index, 1)}
                    className="grid h-8 w-8 place-items-center border border-line text-steel hover:border-accent/50 hover:text-accent disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    aria-label={`Excluir foto ${index + 1}`}
                    onClick={() => void removeImage(image)}
                    className="ml-auto grid h-8 w-8 place-items-center border border-red-400/30 text-red-200 hover:bg-red-400/10"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 border border-line bg-bg p-4 text-sm text-muted">
            Ainda não há fotos. A primeira imagem enviada será definida como principal.
          </p>
        )}
      </div>
    </section>
  );
}

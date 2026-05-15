"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useAppSettings } from "@/components/providers/settings-provider";

interface UploadResult {
  url: string;
  displayUrl: string;
  deleteUrl: string;
}

interface CreatedClient {
  id: string;
  name: string;
  avatar_url: string;
}

interface CreatedJob {
  id: string;
  title: string;
  client_id: string | null;
  sample_images: string[];
}

async function uploadViaImageApi(file: File, name?: string): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("image", file);
  if (name) {
    formData.append("name", name);
  }

  const response = await fetch("/api/upload/image", {
    method: "POST",
    body: formData
  });

  const payload = (await response.json()) as { error?: string; data?: UploadResult };
  if (!response.ok || !payload.data) {
    throw new Error(payload.error ?? "Upload failed");
  }

  return payload.data;
}

export default function ClientsPage() {
  const { settings } = useAppSettings();
  const [clientName, setClientName] = useState("");
  const [clientImage, setClientImage] = useState<File | null>(null);
  const [clientImageUrl, setClientImageUrl] = useState("");
  const [clientStatus, setClientStatus] = useState("");
  const [isUploadingClient, setIsUploadingClient] = useState(false);
  const [latestClientId, setLatestClientId] = useState("");

  const [jobTitle, setJobTitle] = useState("");
  const [jobClientId, setJobClientId] = useState("");
  const [jobFiles, setJobFiles] = useState<File[]>([]);
  const [jobImageUrls, setJobImageUrls] = useState<string[]>([]);
  const [jobStatus, setJobStatus] = useState("");
  const [isUploadingJob, setIsUploadingJob] = useState(false);

  const uploadProviderLabel = useMemo(() => settings.upload.provider.toUpperCase(), [settings.upload.provider]);

  async function onSubmitClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!clientName.trim()) {
      setClientStatus("กรุณาระบุชื่อลูกค้า");
      return;
    }

    setIsUploadingClient(true);
    setClientStatus("กำลังสร้างข้อมูลลูกค้า...");
    try {
      let avatarUrl = "";
      if (clientImage) {
        const uploaded = await uploadViaImageApi(clientImage, clientName || "client-image");
        avatarUrl = uploaded.displayUrl || uploaded.url;
        setClientImageUrl(avatarUrl);
      }

      const createResponse = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: clientName,
          avatarUrl: avatarUrl || null,
          notes: clientImage ? `Uploaded with ${uploadProviderLabel}` : ""
        })
      });

      const createPayload = (await createResponse.json()) as { error?: string; data?: CreatedClient };
      if (!createResponse.ok || !createPayload.data) {
        throw new Error(createPayload.error ?? "สร้างข้อมูลลูกค้าไม่สำเร็จ");
      }

      setLatestClientId(createPayload.data.id);
      setJobClientId(createPayload.data.id);
      setClientName("");
      setClientImage(null);
      setClientStatus("บันทึกลูกค้าสำเร็จ" + (avatarUrl ? " พร้อมรูปโปรไฟล์" : ""));
    } catch (error) {
      setClientStatus(error instanceof Error ? error.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setIsUploadingClient(false);
    }
  }

  async function onSubmitJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!jobFiles.length) {
      setJobStatus("กรุณาเลือกไฟล์งานอย่างน้อย 1 ไฟล์");
      return;
    }

    setIsUploadingJob(true);
    setJobStatus("กำลังอัปโหลดไฟล์งาน...");
    try {
      const uploaded = await Promise.all(
        jobFiles.map((file: File, index: number) => uploadViaImageApi(file, `${jobTitle || "job"}-${index + 1}`))
      );
      const urls = uploaded.map((item: UploadResult) => item.displayUrl || item.url);

      const createResponse = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: jobTitle,
          clientId: jobClientId || undefined,
          sampleImages: urls,
          notes: `Uploaded with ${uploadProviderLabel}`
        })
      });

      const createPayload = (await createResponse.json()) as { error?: string; data?: CreatedJob };
      if (!createResponse.ok || !createPayload.data) {
        throw new Error(createPayload.error ?? "สร้างงานลูกค้าไม่สำเร็จ");
      }

      setJobImageUrls(urls);
      setJobStatus("อัปโหลดและบันทึกงานสำเร็จ");
    } catch (error) {
      setJobStatus(error instanceof Error ? error.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setIsUploadingJob(false);
    }
  }

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-bold">{settings.app.name} {settings.clients.title}</h1>
      <section className="card mb-4 p-4">
        <p className="text-sm text-textSecondary">{settings.clients.hint}</p>
        <p className="mt-1 text-xs text-textSecondary">ผู้ให้บริการอัปโหลด: {uploadProviderLabel} ผ่าน /api/upload/image</p>
        {latestClientId ? <p className="mt-1 text-xs text-textSecondary">Client ID ล่าสุด: {latestClientId}</p> : null}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <form className="card space-y-3 p-4" onSubmit={onSubmitClient}>
          <h2 className="text-lg font-semibold">ฟอร์มลูกค้า (อัปโหลดรูปโปรไฟล์)</h2>
          <label className="block text-sm">
            ชื่อลูกค้า
            <input
              className="mt-1 w-full rounded-xl border border-borderSoft p-2"
              value={clientName}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setClientName(event.target.value)}
              placeholder="เช่น ร้าน ABC"
              required
            />
          </label>
          <label className="block text-sm">
            รูปลูกค้า (ไม่จำเป็น)
            <input
              className="mt-1 w-full rounded-xl border border-borderSoft p-2"
              type="file"
              accept="image/*"
              onChange={(event: ChangeEvent<HTMLInputElement>) => setClientImage(event.target.files?.[0] ?? null)}
            />
          </label>
          <button className="btn-primary font-semibold" type="submit" disabled={isUploadingClient}>
            {isUploadingClient ? "กำลังอัปโหลด..." : "อัปโหลดรูปลูกค้า"}
          </button>
          {clientStatus ? <p className="text-sm text-textSecondary">{clientStatus}</p> : null}
          {clientImageUrl ? (
            <div>
              <p className="mb-1 text-sm font-medium">URL รูปลูกค้า</p>
              <a className="text-xs text-blue-600 underline" href={clientImageUrl} target="_blank" rel="noreferrer">
                {clientImageUrl}
              </a>
            </div>
          ) : null}
        </form>

        <form className="card space-y-3 p-4" onSubmit={onSubmitJob}>
          <h2 className="text-lg font-semibold">ฟอร์มงานลูกค้า (อัปโหลดตัวอย่างงาน)</h2>
          <label className="block text-sm">
            ชื่องาน
            <input
              className="mt-1 w-full rounded-xl border border-borderSoft p-2"
              value={jobTitle}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setJobTitle(event.target.value)}
              placeholder="เช่น ออกแบบโลโก้"
              required
            />
          </label>
          <label className="block text-sm">
            Client ID (ถ้ามี)
            <input
              className="mt-1 w-full rounded-xl border border-borderSoft p-2"
              value={jobClientId}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setJobClientId(event.target.value)}
              placeholder="UUID ของลูกค้า"
            />
          </label>
          <label className="block text-sm">
            รูปตัวอย่างงาน
            <input
              className="mt-1 w-full rounded-xl border border-borderSoft p-2"
              type="file"
              accept="image/*"
              multiple
              onChange={(event: ChangeEvent<HTMLInputElement>) => setJobFiles(Array.from(event.target.files ?? []))}
            />
          </label>
          <button className="btn-primary font-semibold" type="submit" disabled={isUploadingJob}>
            {isUploadingJob ? "กำลังอัปโหลด..." : "อัปโหลดรูปงาน"}
          </button>
          {jobStatus ? <p className="text-sm text-textSecondary">{jobStatus}</p> : null}
          {jobImageUrls.length ? (
            <div className="space-y-1">
              <p className="text-sm font-medium">URL รูปงาน</p>
              {jobImageUrls.map((url: string) => (
                <a key={url} className="block text-xs text-blue-600 underline" href={url} target="_blank" rel="noreferrer">
                  {url}
                </a>
              ))}
            </div>
          ) : null}
        </form>
      </section>
    </AppShell>
  );
}
"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BuildLogs } from "@/components/build-logs";
import { ProgressBar } from "@/components/progress-bar";
import LoadingSpinner from "@/components/loading-spinner";

const TIMEOUT_MS = 4 * 60 * 1000;

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("template");
  const router = useRouter();
  const [deployment, setDeployment] = useState(null);
  const [deploymentFinished, setDeploymentFinished] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
    setSelectedTemplate(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/gzip": [".tgz"],
    },
  });

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file && !selectedTemplate) return;

    setDeploying(true);
    setDeploymentFinished(false);
    setError("");

    const formData = new FormData();

    if (file) {
      formData.append("file", file);
    } else if (selectedTemplate) {
      formData.append("template", selectedTemplate);
    }

    try {
      const response = await fetch("/api/deploy", {
        method: "POST",
        body: formData,
      });

      if (response.status === 429) {
        setError("You've reached the limit. Please try again later.");
        return;
      }

      const data = await response.json();

      if (response.ok) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        setDeployment(data.deployment);

        try {
          const response = await fetch(
            `/api/wait-for-deploy/${data.deployment.url}`,
            {
              signal: controller.signal,
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } catch (error) {
          if ((error as Error).name === "AbortError") {
            const response = await fetch(
              `/api/cancel-deployment/${data.deployment.id}`,
              {
                method: "PATCH",
              }
            );

            if (!response.ok) {
              setError("Failed to cancel deployment.");
              return;
            }

            setError("Deployment cancelled due to timeout.");
            return;
          }
        } finally {
          clearTimeout(timeoutId);
        }

        const res = await fetch("/api/start-project-transfer", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            projectId: data.deployment.projectId,
          }),
        });

        setDeploymentFinished(true);

        const dataProjectTransfer = await res.json();
        router.push(
          `/claim?code=${dataProjectTransfer.code}&previewUrl=https://${data.deployment.alias[0]}`
        );
      } else {
        setError(data.error || "Deployment failed");
      }
    } catch (error) {
      console.error("error", error);
      setError("An error occurred during deployment.");
    } finally {
      setDeploying(false);
    }
  };

  const templates = [
    {
      id: "nextjs",
      name: "Next.js",
      icon: (
        <Image
          src="images/nextjs.svg"
          width={32}
          height={32}
          alt="Next.js logo"
        />
      ),
      averageDeployTimeInSeconds: 44,
    },
    {
      id: "vue",
      name: "Vue.js",
      icon: (
        <Image src="images/vue.svg" width={32} height={32} alt="Vue.js logo" />
      ),
      averageDeployTimeInSeconds: 20,
    },
    {
      id: "svelte",
      name: "Svelte",
      icon: (
        <Image
          src="images/svelte.svg"
          width={32}
          height={32}
          alt="Svelte logo"
        />
      ),
      averageDeployTimeInSeconds: 25,
    },
  ];

  const deployButtonDisabled =
    deploying || deploymentFinished || (!file && !selectedTemplate);

  return (
    <>
      <h2 className="text-2xl font-semibold text-neutral-800">
        Deploy to Vercel
      </h2>
      <p className="text-sm text-neutral-500 mt-2">
        Choose a template or upload your own project.
      </p>
      <div className="mt-6">
        <div className="w-full">
          <div className="flex rounded-md p-1 border border-neutral-200">
            <button
              type="button"
              onClick={() => setActiveTab("template")}
              className={`flex-1 text-sm py-2 ${
                activeTab === "template"
                  ? "bg-neutral-100 text-neutral-900 font-medium"
                  : "text-neutral-600"
              }`}
            >
              Choose Template
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`flex-1 text-sm py-2 ${
                activeTab === "upload"
                  ? "bg-neutral-100 text-neutral-900 font-medium"
                  : "text-neutral-600"
              }`}
            >
              Upload File
            </button>
          </div>
          <div className="mt-6">
            {activeTab === "template" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`cursor-pointer transition-all p-6 rounded-lg border ${
                      selectedTemplate === template.id
                        ? "bg-neutral-100 border"
                        : "hover:border-neutral-300"
                    }`}
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setFile(null);
                    }}
                  >
                    <div className="flex flex-col items-center justify-center">
                      {template.icon}
                      <h3 className="font-medium text-sm text-neutral-900 mt-2">
                        {template.name}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "upload" && (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-7 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-black bg-gray-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input {...getInputProps()} />
                <Image
                  alt="Upload"
                  src="/icons/upload.svg"
                  className="mx-auto mb-2"
                  width={24}
                  height={24}
                />
                <p className="text-sm text-gray-500">
                  Drag & drop a .tgz file of a Next.js project here, or click to
                  select
                </p>
                {file && (
                  <p className="mt-2 text-sm font-medium text-gray-800">
                    Selected file: {file.name}
                  </p>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center bg-red-100 rounded-md p-2 mt-6 text-sm text-red-600">
              <Image
                src="/icons/error.svg"
                alt="Error icon"
                width={16}
                height={16}
                className="mr-2"
              />
              {error}
            </div>
          )}

          <div className="mt-6">
            <button
              type="submit"
              disabled={deployButtonDisabled}
              className={`w-full py-2 px-4 rounded-md font-medium text-sm ${
                deployButtonDisabled
                  ? "bg-neutral-100 text-gray-400  cursor-not-allowed border"
                  : "bg-black hover:opacity-80 text-white"
              }`}
              onClick={handleDeploy}
            >
              {deploymentFinished ? (
                "Deployment successful"
              ) : deploying && !deploymentFinished ? (
                <>
                  <LoadingSpinner text="Deploying..." />
                </>
              ) : (
                "Deploy"
              )}
            </button>
          </div>

          {(deploying || deploymentFinished) && (
            <>
              <ProgressBar
                disabled={deploymentFinished}
                totalTimeInSeconds={
                  templates.find((template) => template.id === selectedTemplate)
                    ?.averageDeployTimeInSeconds || 60
                }
              />
              <BuildLogs deployment={deployment} />
            </>
          )}
        </div>
      </div>
    </>
  );
}

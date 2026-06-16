"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  deleteG254G255,
  scanForG54,
  preCallNextTool,
  preCallNextToolV2,
  preCallNextToolV3,
  g187Swap,
} from "../lib/processGcode";

export default function Home() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [dragging, setDragging] = useState(false);

  const [removeG254G255, setRemoveG254G255] = useState(false);
  const [checkG54, setCheckG54] = useState(false);
  const [preCallTools, setPreCallTools] = useState(false);
  const [preCallToolsV2, setPreCallToolsV2] = useState(false);
  const [preCallToolsV3, setPreCallToolsV3] = useState(false);
  const [g187SwapEnabled, setG187SwapEnabled] = useState(false);

  const [result, setResult] = useState<string>("");
  const [g54Result, setG54Result] = useState<string>("");
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedName, setProcessedName] = useState<string | null>(null);
  const [showGif, setShowGif] = useState(false);

  const handleFile = async (file: File) => {
    setFileName(file.name);
    const text = await file.text();
    setFileContent(text);
    setResult("");
    setG54Result("");

    if (processedUrl) {
      URL.revokeObjectURL(processedUrl);
      setProcessedUrl(null);
      setProcessedName(null);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);

    if (e.dataTransfer.files.length > 0) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = () => {
    if (!fileContent || !fileName) {
      alert("Upload a file first");
      return;
    }

    if (!removeG254G255 && !checkG54 && !preCallTools && !preCallToolsV2 && !g187SwapEnabled && !preCallToolsV3) {
      alert("Select at least one option");
      return;
    }

    setShowGif(true);

    setTimeout(() => {
      setShowGif(false);
    }, 60000);

    let currentContent = fileContent;
    let didCreateEditedFile = false;

    setResult("");
    setG54Result("");

    if (processedUrl) {
      URL.revokeObjectURL(processedUrl);
      setProcessedUrl(null);
      setProcessedName(null);
    }

    if (checkG54) {
      const scan = scanForG54(fileContent);

      if (scan.found) {
        setG54Result(
          `G54 found ${scan.count} time(s) on line(s): ${scan.lines.join(", ")}`
        );
      } else {
        setG54Result("No G54 found.");
      }
    }

    if (removeG254G255) {
      currentContent = deleteG254G255(currentContent);
      didCreateEditedFile = true;
    }

    if (preCallTools) {
      currentContent = preCallNextTool(currentContent);
      didCreateEditedFile = true;
    }

    if (preCallToolsV2) {
      currentContent = preCallNextToolV2(currentContent);
      didCreateEditedFile = true;
    }

    if (preCallToolsV3) {
      currentContent = preCallNextToolV3(currentContent);
      didCreateEditedFile = true;
    }
    if (g187SwapEnabled) {
      currentContent = g187Swap(currentContent);
      didCreateEditedFile = true; 
    }

    if (didCreateEditedFile) {
      const blob = new Blob([currentContent], {
        type: "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);

      const baseName = fileName.replace(/\.[^/.]+$/, "");
      const extensionMatch = fileName.match(/(\.[^/.]+)$/);
      const extension = extensionMatch ? extensionMatch[1] : ".nc";
      const newFileName = `${baseName}_edited${extension}`;

      setProcessedUrl(url);
      setProcessedName(newFileName);
      setResult("Edited file ready below.");
    } else if (checkG54) {
      setResult("Scan complete.");
    }
  };

  useEffect(() => {
    return () => {
      if (processedUrl) {
        URL.revokeObjectURL(processedUrl);
      }
    };
  }, [processedUrl]);

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10 text-ghost-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(154,216,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(154,216,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(circle_at_center,black,transparent_76%)]" />
      <div className="pointer-events-none absolute left-1/2 top-8 h-72 w-72 -translate-x-1/2 rounded-full bg-neon-violet/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-4xl flex-col justify-center">
        <div className="mb-9 text-center sm:mb-12">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-comet/20 bg-slate-dew/35 px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-whisper-blue shadow-subtle-4 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-celestial-light shadow-[0_0_16px_rgba(100,216,255,0.8)]" />
            CNC workflow utility
          </div>
          <h1 className="mx-auto max-w-3xl font-aeonikpro text-4xl font-semibold leading-[1.02] tracking-tight text-ghost-white sm:text-5xl lg:text-6xl">
            Hey Roy, your brother Tyler vibecoded you a GCode Fixer
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-whisper-blue sm:text-lg">
            Upload a G-code file and choose what you want to do
          </p>
        </div>

        <section className="rounded-3xl border border-comet/15 bg-slate-dew/40 p-3 shadow-subtle-6 ring-1 ring-white/5 backdrop-blur-xl">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`group relative overflow-hidden rounded-2xl border border-dashed p-8 text-center transition duration-300 sm:p-11 ${
              dragging
                ? "border-celestial-light bg-celestial-light/10 shadow-[0_0_42px_rgba(100,216,255,0.2)]"
                : "border-comet/25 bg-midnight-abyss/60 hover:border-comet/45 hover:bg-slate-dew/35"
            }`}
          >
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-arctic-mist/50 to-transparent" />
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-comet/20 bg-slate-dew/55 text-sm font-semibold text-arctic-mist shadow-subtle-4 transition group-hover:border-celestial-light/40 group-hover:text-ghost-white">
              G
            </div>

            <p className="text-lg font-medium text-ghost-white sm:text-xl">
              {fileName ? (
                <span className="break-all text-celestial-light">{fileName}</span>
              ) : (
                "Drag and drop G-code here"
              )}
            </p>

            <p className="mt-2 text-sm text-interstellar-gray">
              Supports .nc, .txt, and .gcode files
            </p>

            <input
              type="file"
              accept=".nc,.txt,.gcode"
              onChange={async (e) => {
                if (e.target.files?.[0]) {
                  await handleFile(e.target.files[0]);
                }
              }}
              className="sr-only"
              id="fileUpload"
            />

            <label
              htmlFor="fileUpload"
              className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-full border border-comet/30 bg-ghost-white/8 px-5 py-2.5 text-sm font-semibold text-arctic-mist shadow-subtle-4 transition duration-200 hover:border-celestial-light/60 hover:bg-celestial-light/12 hover:text-ghost-white hover:shadow-[0_0_28px_rgba(100,216,255,0.16)] focus:outline-none focus-visible:ring-2 focus-visible:ring-celestial-light/70 focus-visible:ring-offset-2 focus-visible:ring-offset-midnight-abyss active:scale-[0.98]"
            >
              Browse Files
            </label>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-comet/12 bg-midnight-abyss/58 p-4 text-sm text-whisper-blue transition hover:border-comet/30 hover:bg-slate-dew/35 has-[:checked]:border-neon-violet/35 has-[:checked]:bg-neon-violet/10">
              <input
                type="checkbox"
                checked={removeG254G255}
                onChange={(e) => setRemoveG254G255(e.target.checked)}
                className="h-4 w-4 rounded border-comet/30 bg-midnight-abyss text-neon-violet accent-neon-violet focus:ring-2 focus:ring-neon-violet/50 focus:ring-offset-2 focus:ring-offset-midnight-abyss"
              />
              <span>Delete G254 / G255 lines</span>
            </label>

            <label className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-comet/12 bg-midnight-abyss/58 p-4 text-sm text-whisper-blue transition hover:border-comet/30 hover:bg-slate-dew/35 has-[:checked]:border-neon-violet/35 has-[:checked]:bg-neon-violet/10">
              <input
                type="checkbox"
                checked={checkG54}
                onChange={(e) => setCheckG54(e.target.checked)}
                className="h-4 w-4 rounded border-comet/30 bg-midnight-abyss text-neon-violet accent-neon-violet focus:ring-2 focus:ring-neon-violet/50 focus:ring-offset-2 focus:ring-offset-midnight-abyss"
              />
              <span>Scan for G54</span>
            </label>

            <label className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-comet/12 bg-midnight-abyss/58 p-4 text-sm text-whisper-blue transition hover:border-comet/30 hover:bg-slate-dew/35 has-[:checked]:border-neon-violet/35 has-[:checked]:bg-neon-violet/10">
              <input
                type="checkbox"
                checked={preCallTools}
                onChange={(e) => setPreCallTools(e.target.checked)}
                className="h-4 w-4 rounded border-comet/30 bg-midnight-abyss text-neon-violet accent-neon-violet focus:ring-2 focus:ring-neon-violet/50 focus:ring-offset-2 focus:ring-offset-midnight-abyss"
              />
              <span>Pre-call next tool after each tool change</span>
            </label>
            
            <label className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-comet/12 bg-midnight-abyss/58 p-4 text-sm text-whisper-blue transition hover:border-comet/30 hover:bg-slate-dew/35 has-[:checked]:border-neon-violet/35 has-[:checked]:bg-neon-violet/10">
              <input
                type="checkbox"
                checked={g187SwapEnabled}
                onChange={(e) => setG187SwapEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-comet/30 bg-midnight-abyss text-neon-violet accent-neon-violet focus:ring-2 focus:ring-neon-violet/50 focus:ring-offset-2 focus:ring-offset-midnight-abyss"
              />
              <span>G187 swap P3 to P1</span>
            </label>
            
            <label className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-comet/12 bg-midnight-abyss/58 p-4 text-sm text-whisper-blue transition hover:border-comet/30 hover:bg-slate-dew/35 has-[:checked]:border-neon-violet/35 has-[:checked]:bg-neon-violet/10">
              <input
                type="checkbox"
                checked={preCallToolsV2}
                onChange={(e) => setPreCallToolsV2(e.target.checked)}
                className="h-4 w-4 rounded border-comet/30 bg-midnight-abyss text-neon-violet accent-neon-violet focus:ring-2 focus:ring-neon-violet/50 focus:ring-offset-2 focus:ring-offset-midnight-abyss"
              />
              <span>Pre-call next tool V2 after each tool change</span>
            </label>

            <label className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-comet/12 bg-midnight-abyss/58 p-4 text-sm text-whisper-blue transition hover:border-comet/30 hover:bg-slate-dew/35 has-[:checked]:border-neon-violet/35 has-[:checked]:bg-neon-violet/10">
              <input
                type="checkbox"
                checked={preCallToolsV3}
                onChange={(e) => setPreCallToolsV3(e.target.checked)}
                className="h-4 w-4 rounded border-comet/30 bg-midnight-abyss text-neon-violet accent-neon-violet focus:ring-2 focus:ring-neon-violet/50 focus:ring-offset-2 focus:ring-offset-midnight-abyss"
              />
              <span>Pre-call next tool V3 after each tool change (halfway point index) </span>
            </label>
          </div>
        </section>

        <button
          onClick={processFile}
          className="mt-5 w-full rounded-2xl border border-neon-violet/35 bg-gradient-to-r from-neon-violet to-celestial-light px-6 py-4 font-semibold text-midnight-abyss shadow-[0_16px_46px_rgba(140,92,255,0.24)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_58px_rgba(100,216,255,0.24)] focus:outline-none focus-visible:ring-2 focus-visible:ring-celestial-light/80 focus-visible:ring-offset-2 focus-visible:ring-offset-midnight-abyss active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Process G-Code
        </button>

        {showGif && (
          <div className="mt-6 flex justify-center">
            <Image
              src="/pengy.gif"
              alt="Processing G-Code"
              width={320}
              height={240}
              unoptimized
              className="w-full max-w-80 rounded-2xl border border-comet/20 shadow-subtle-4"
            />
          </div>
        )}

        {result && (
          <div className="mt-6 rounded-2xl border border-celestial-light/20 bg-celestial-light/10 p-4 text-center text-base font-medium text-arctic-mist shadow-subtle-4">
            {result}
          </div>
        )}

        {g54Result && (
          <div className="mt-4 rounded-2xl border border-comet/15 bg-slate-dew/45 p-5 text-sm leading-6 text-whisper-blue shadow-subtle-4 backdrop-blur">
            {g54Result}
          </div>
        )}

        {processedUrl && processedName && (
          <div className="mt-8 rounded-3xl border border-comet/15 bg-slate-dew/45 p-6 shadow-subtle-6 backdrop-blur-xl">
            <p className="mb-3 text-sm font-medium text-whisper-blue">
              Your processed file is ready:
            </p>

            <a
              href={processedUrl}
              download={processedName}
              className="group flex w-full items-center gap-4 rounded-2xl border border-comet/20 bg-midnight-abyss/60 px-5 py-4 shadow-subtle-4 transition duration-200 hover:-translate-y-0.5 hover:border-celestial-light/45 hover:bg-celestial-light/10 hover:shadow-[0_18px_52px_rgba(100,216,255,0.16)] focus:outline-none focus-visible:ring-2 focus-visible:ring-celestial-light/80 focus-visible:ring-offset-2 focus-visible:ring-offset-midnight-abyss active:translate-y-0"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-neon-violet/25 bg-neon-violet/12 text-xs font-bold tracking-[0.18em] text-arctic-mist transition group-hover:border-celestial-light/45 group-hover:text-ghost-white">
                NC
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold text-ghost-white">
                  {processedName}
                </div>
                <div className="mt-1 text-sm text-interstellar-gray">
                  Download edited G-code
                </div>
              </div>
            </a>

            <p className="mt-3 text-sm text-interstellar-gray">
              Click the file tile to save it.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

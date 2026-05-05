"use client";

import { useEffect, useState } from "react";
import {
  deleteG254G255,
  scanForG54,
  preCallNextTool,
  preCallNextToolV2,
} from "../lib/processGcode";

export default function Home() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [dragging, setDragging] = useState(false);

  const [removeG254G255, setRemoveG254G255] = useState(true);
  const [checkG54, setCheckG54] = useState(true);
  const [preCallTools, setPreCallTools] = useState(true);
  const [preCallToolsV2, setPreCallToolsV2] = useState(false);

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

    if (!removeG254G255 && !checkG54 && !preCallTools && !preCallToolsV2) {
      alert("Select at least one option");
      return;
    }

    setShowGif(true);

    setTimeout(() => {
      setShowGif(false);
    }, 100000);

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
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold">
            Hey Roy, your brother Tyler vibecoded you a GCode Fixer
          </h1>
          <p className="mt-3 text-zinc-400">
            Upload a G-code file and choose what you want to do
          </p>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition ${
            dragging ? "border-white bg-zinc-800" : "border-zinc-700 bg-zinc-900"
          }`}
        >
          <p className="text-lg">
            {fileName ? (
              <span className="text-green-400">{fileName}</span>
            ) : (
              "Drag & drop G-code here"
            )}
          </p>

          <p className="text-sm text-zinc-500 mt-2">or</p>

          <input
            type="file"
            accept=".nc,.txt,.gcode"
            onChange={async (e) => {
              if (e.target.files?.[0]) {
                await handleFile(e.target.files[0]);
              }
            }}
            className="hidden"
            id="fileUpload"
          />

          <label
            htmlFor="fileUpload"
            className="inline-block mt-4 px-5 py-2 bg-white text-black rounded-lg cursor-pointer hover:bg-zinc-200 transition"
          >
            Browse Files
          </label>
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-700 bg-zinc-900 p-5 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={removeG254G255}
              onChange={(e) => setRemoveG254G255(e.target.checked)}
              className="h-4 w-4"
            />
            <span>Delete G254 / G255 lines</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checkG54}
              onChange={(e) => setCheckG54(e.target.checked)}
              className="h-4 w-4"
            />
            <span>Scan for G54</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preCallTools}
              onChange={(e) => setPreCallTools(e.target.checked)}
              className="h-4 w-4"
            />
            <span>Pre-call next tool after each tool change</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preCallToolsV2}
              onChange={(e) => setPreCallToolsV2(e.target.checked)}
              className="h-4 w-4"
            />
            <span>Pre-call next tool V2 after each tool change</span>
          </label>
        </div>

        <button
          onClick={processFile}
          className="mt-8 w-full py-3 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition"
        >
          Process G-Code
        </button>

        {showGif && (
          <div className="mt-6 flex justify-center">
            <img
              src="/joker.gif"
              alt="Processing G-Code"
              className="w-80 rounded-xl"
            />
          </div>
        )}



        {result && (
          <div className="mt-6 text-center text-lg text-zinc-200">
            {result}
          </div>
        )}

        {g54Result && (
          <div className="mt-4 rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-zinc-200">
            {g54Result}
          </div>
        )}

        {processedUrl && processedName && (
          <div className="mt-8 border border-zinc-700 bg-zinc-900 rounded-2xl p-6">
            <p className="text-sm text-zinc-400 mb-3">
              Your processed file is ready:
            </p>

            <a
              href={processedUrl}
              download={processedName}
              className="flex items-center gap-4 w-full rounded-xl border border-zinc-600 bg-zinc-800 px-5 py-4 hover:bg-zinc-700 transition"
            >
              <div className="text-2xl">📄</div>
              <div className="font-semibold text-green-400">{processedName}</div>
            </a>

            <p className="text-sm text-zinc-500 mt-3">
              Click the file tile to save it.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
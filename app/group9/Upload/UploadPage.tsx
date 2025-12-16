// UploadPage.js
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function UploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file.type === "text/csv" || file.name.endsWith(".csv")) {
      setSelectedFile(file);
    } else {
      alert("Please select a CSV file");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }
    if (!datasetName.trim()) {
      alert("Please enter a name for the dataset");
      return;
    }
    if (datasetName.trim().length < 3) {
      alert("Dataset name must be at least 3 characters");
      return;
    }
    if (datasetName.trim().length > 25) {
      alert("Dataset name must not exceed 25 characters");
      return;
    }

    setIsUploading(true);

    try {
      // Read the file as text
      const csvText = await selectedFile.text();
      console.log(
        `http://127.0.0.1:8001/datasets?name=${encodeURIComponent(datasetName.trim())}&start_date=${new Date().toISOString()}`,
      );

      // Send name as query parameter and CSV as raw body
      const response = await fetch(
        `http://127.0.0.1:8001/datasets?name=${encodeURIComponent(datasetName.trim())}&start_date=${new Date().toISOString()}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
          },
          body: csvText,
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `Upload failed: ${response.statusText}`,
        );
      }

      const data = await response.json();
      console.log("Upload successful:", data);

      setSelectedFile(null);
      setDatasetName("");
      setIsUploading(false);
      router.push("/group9/MyDataset");
    } catch (error) {
      console.error("Upload failed:", error);
      alert(
        `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Upload Data</h1>
          <p className="text-muted-foreground">
            Upload time series data for analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Upload Data Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Upload CSV File</CardTitle>
                <CardDescription>Select a file to upload</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-3 space-y-4">
                {/* Dataset Name Input - shows when file is selected */}
                {selectedFile && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium block mb-3">
                      Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter a name for your dataset"
                      value={datasetName}
                      onChange={(e) =>
                        setDatasetName(e.target.value.slice(0, 25))
                      }
                      minLength={3}
                      maxLength={25}
                      disabled={isUploading}
                    />
                  </div>
                )}

                {/* Selected File Display */}
                {selectedFile && (
                  <div className="bg-primary/5 border border-primary rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Upload size={20} className="text-primary" />
                      <div>
                        <p className="font-medium text-foreground">
                          {selectedFile.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFile}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X size={20} />
                    </Button>
                  </div>
                )}

                {/* Drag & Drop Area */}
                {!selectedFile && (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`h-64 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors duration-200 cursor-pointer ${
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    <Upload size={48} className="text-muted-foreground mb-3" />
                    <p className="text-lg font-medium text-foreground mb-2">
                      Drag & Drop your CSV file here
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">or</p>
                    <input
                      type="file"
                      id="file-input"
                      accept=".csv"
                      className="hidden"
                      onChange={handleFileInputChange}
                    />
                    <Button asChild>
                      <label htmlFor="file-input" className="cursor-pointer">
                        Browse Files
                      </label>
                    </Button>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Supports: CSV (Comma Separated Values)
                    </p>
                  </div>
                )}

                {/* Upload Button */}
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="w-full"
                >
                  {isUploading
                    ? "Uploading..."
                    : selectedFile
                      ? "Upload"
                      : "Select a file to upload"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Upload Guidelines Card (Sidebar) */}
          <div className="hidden lg:block">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Data Guidelines</CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>
                    File format{" "}
                    <span className="font-semibold text-foreground">must</span>{" "}
                    be CSV.
                  </li>
                  <li>Data should be structured as a time series.</li>
                  <li>The first column should contain date/time stamps.</li>
                  <li>Maximum file size is 50MB.</li>
                  <li>
                    All values should be numerical (except the timestamp).
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

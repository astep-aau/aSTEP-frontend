"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type AnalysisRequestPayload } from '../../types';

export default function AnalysisPage() {
  const { id } = useParams();
  const idStr = Array.isArray(id) ? id[0] : id ?? '';
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState('');
  const [datasetName, setDatasetName] = useState<string>('');
  const [analysisId, setAnalysisId] = useState<number>(0);
  const [analysisName, setAnalysisName] = useState<string>('');
  const [analysisDescription, setAnalysisDescription] = useState<string>('');
  const [sequenceLength, setSequenceLength] = useState<number>(32);
  const [stride, setStride] = useState<number>(1);
  const [batchSize, setBatchSize] = useState<number>(32);
  const [hidden_size, setHiddenSize] = useState<number>(32);
  const [epochs, setEpochs] = useState<number>(100);
  const [learningRate, setLearningRate] = useState<number>(0.001);
  const [internal_size, setInternalSize] = useState<number>(16);
  const [testSize, setTestSize] = useState<number>(0.2);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [normalize, setNormalize] = useState<string | null>('robust');
  const [seed, setSeed] = useState<string>('');
  const handleStartAnalysis = async () => {
    setNameError('');
    setOptionError('');
    if (!analysisName.trim()) {
      setNameError('Name is required');
      return;
    }
    if (!selectedOption) {  
      setOptionError('Please select a detection method');
      return;
    }

    try {
      const params = new URLSearchParams({
        name: analysisName,
        description: analysisDescription,
      });

      const datasetPayload: AnalysisRequestPayload = {
        sequence_length: sequenceLength,
        stride: stride,
        test_size: testSize,
        shuffle: shuffle,
        detection_method: selectedOption, 
      };
      if (normalize != null && normalize !== '') {
        datasetPayload.normalize = normalize;
      }

      const res = await fetch(`http://127.0.0.1:8000/analyses/${id}/analyses?${params.toString()}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          seed: seed ? parseInt(seed) : null,
          dataset: datasetPayload,
          hyperparameters: {
            batch_size: batchSize,
            hidden_size: hidden_size,
            internal_size: internal_size,
            learning_rate: learningRate,
          },
          training: {
            epochs: epochs,
          }
        })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to create analysis: ${res.status} ${text}`);
      }

      router.push(`/time-series/datasets`);

    } catch (err) {
      console.error('Error starting analysis:', err);
    }
  };

  const [nameError, setNameError] = useState<string>('');
  const [optionError, setOptionError] = useState<string>('');

  useEffect(() => {
    const response = async () => {
      const res = await fetch(`http://127.0.0.1:8000/datasets/${idStr}`);
      const data = await res.json();
      setDatasetName(data.name);
      setAnalysisId(Number(id));
    };
    response();
  });
  
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-semibold mb-2">Analysis for {datasetName}</h1>

        <div className="flex gap-6">
          <div className="w-2/3">
          {/* Outlier Detection Card */}
          <Card>
            <CardContent className="space-y-6">
            <CardTitle>Outlier Detection</CardTitle>
              {/* Analysis metadata inputs (stacked rows) */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground block">Name</label>
                  <input
                    type="text"
                    required
                    value={analysisName}
                    onChange={(e) => setAnalysisName(e.target.value)}
                    placeholder="Analysis name"
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm mt-1"
                  />
                  {nameError && <p className="text-sm text-destructive mt-1">{nameError}</p>}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block">Description</label>
                  <input
                    type="text"
                    value={analysisDescription}
                    onChange={(e) => setAnalysisDescription(e.target.value)}
                    placeholder="Description"
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm mt-1"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <CardDescription>Select a detection method</CardDescription>
                {/* Option 1 */}
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="LSTM-AutoEncoder"
                    name="outlier-method"
                    value="LSTM"
                    required
                    checked={selectedOption === 'LSTM'}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="LSTM-AutoEncoder" className="cursor-pointer font-normal">
                    LSTM AutoEncoder
                  </label>
                </div>
                {optionError && <p className="text-sm text-destructive mt-1">{optionError}</p>}
              </div>
              {/* Start Button */}
              <Button onClick={handleStartAnalysis} className="w-full">
                Start Outlier Detection
              </Button>
            </CardContent>
          </Card>
          </div>

          {/* Model Options Card (right) */}
          <div className="w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>Model Options (optional)</CardTitle>
                <CardDescription>These will be sent as query params</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Dataset</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-muted-foreground block">Sequence Length</label>
                        <input type="number" min={1} value={sequenceLength} onChange={(e) => setSequenceLength(parseInt(e.target.value || '0'))} className="w-full px-2 py-1 border rounded mt-1" />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground block">Stride</label>
                        <input type="number" min={1} value={stride} onChange={(e) => setStride(parseInt(e.target.value || '0'))} className="w-full px-2 py-1 border rounded mt-1" />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground block">Test Size</label>
                        <input type="number" min={0} max={1} step={0.01} value={testSize} onChange={(e) => setTestSize(parseFloat(e.target.value || '0'))} className="w-full px-2 py-1 border rounded mt-1" />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground block">Seed (optional)</label>
                        <input type="number" min={1} value={seed} onChange={(e) => setSeed(e.target.value)} className="w-full px-2 py-1 border rounded mt-1" />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground block">Shuffle</label>
                        <div className="flex items-center mt-1">
                          <input type="checkbox" checked={shuffle} onChange={(e) => setShuffle(e.target.checked)} className="mr-2" />
                          <span className="text-sm">Shuffle data</span>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm text-muted-foreground block">Normalize</label>
                        <select
                          value={normalize ?? ''}
                          onChange={(e) => setNormalize(e.target.value || null)}
                          className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring mt-1"
                        >
                          <option value="robust">robust</option>
                          <option value="zscore">zscore</option>
                          <option value="">None</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Hyperparameters</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-muted-foreground block">Batch Size</label>
                        <input type="number" min={1} value={batchSize} onChange={(e) => setBatchSize(parseInt(e.target.value || '0'))} className="w-full px-2 py-1 border rounded mt-1" />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground block">Hidden size</label>
                        <input type="number" min={1} value={hidden_size} onChange={(e) => setHiddenSize(parseInt(e.target.value || '0'))} className="w-full px-2 py-1 border rounded mt-1" />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground block">Internal size</label>
                        <input type="number" min={1} value={internal_size} onChange={(e) => setInternalSize(parseInt(e.target.value || '0'))} className="w-full px-2 py-1 border rounded mt-1" />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground block">Learning Rate</label>
                        <input type="number" min={0} max={1} step={0.0001} value={learningRate} onChange={(e) => setLearningRate(parseFloat(e.target.value || '0'))} className="w-full px-2 py-1 border rounded mt-1" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Training</p>
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <label className="text-sm text-muted-foreground block">Epochs</label>
                        <input type="number" min={1} value={epochs} onChange={(e) => setEpochs(parseInt(e.target.value || '0'))} className="w-full px-2 py-1 border rounded mt-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
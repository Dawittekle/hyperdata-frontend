"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import WaveSurfer from "wavesurfer.js";

import { Button } from "@/components/ui/button";

interface AudioWaveformPreviewProps {
  url: string;
  wrapperClassName?: string;
}

export function AudioWaveformPreview({
  url,
  wrapperClassName = "flex items-center gap-2 min-w-[200px] mt-3 mb-3",
}: AudioWaveformPreviewProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeWaveSurfer = async () => {
      try {
        const ws = WaveSurfer.create({
          container: waveformRef.current!,
          waveColor: "#73a4d1",
          progressColor: "#095FAF",
          cursorColor: "#383351",
          barWidth: 1,
          barRadius: 2,
          cursorWidth: 0.01,
          height: 30,
          barGap: 2,
          url,
          renderFunction: (peaks, ctx) => {
            const height = ctx.canvas.height;
            const width = ctx.canvas.width;
            const halfHeight = height / 2;
            const channel = peaks[0];
            const pixelsPerSample = width / channel.length;

            ctx.beginPath();
            ctx.moveTo(0, halfHeight);

            for (let i = 0; i < channel.length; i++) {
              const x = i * pixelsPerSample;
              const y = halfHeight - channel[i] * halfHeight;
              ctx.lineTo(x, y);
            }

            ctx.strokeStyle = "#73a4d1";
            ctx.lineWidth = 1;
            ctx.stroke();
          },
        });

        ws.on("ready", () => {
          if (isMounted) {
            setIsReady(true);
          }
        });
        ws.on("play", () => isMounted && setIsPlaying(true));
        ws.on("pause", () => isMounted && setIsPlaying(false));
        ws.on("finish", () => isMounted && setIsPlaying(false));
        ws.on("error", (err) => {
          console.error("WaveSurfer error:", err);
          isMounted && setError("Failed to load audio");
        });

        wavesurferRef.current = ws;
      } catch (err) {
        console.error("WaveSurfer initialization error:", err);
        isMounted && setError("Failed to initialize player");
      }
    };

    initializeWaveSurfer();

    return () => {
      isMounted = false;
      wavesurferRef.current?.destroy();
      wavesurferRef.current = null;
    };
  }, [url]);

  const handlePlayPause = () => {
    if (!wavesurferRef.current) return;
    wavesurferRef.current.playPause();
  };

  return (
    <div className={wrapperClassName}>
      <div className="flex-1">
        <div ref={waveformRef} className="w-full h-[40px]" />
        {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePlayPause}
        disabled={!isReady}
        className="flex-shrink-0 text-primary border-primary hover:bg-primary hover:text-white"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </Button>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "~/trpc/react";

interface AudioRecorderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess?: (data: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError?: (error: any) => void;
  className?: string;
}

export default function AudioRecorder({
  onSuccess,
  onError,
  className = "",
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [duration, setDuration] = useState(0);
  const [sending, setSending] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const sendAudio = api.groq.sendAudio.useMutation({
    onMutate: () => {
      setSending(true);
    },
    onSuccess: (data) => {
      console.log("Audio sent successfully:", data);
      resetRecording();
      onSuccess?.(data);
    },
    onError: (error) => {
      console.error("Error sending audio:", error);
      onError?.(error);
    },
    onSettled: () => {
      setSending(false);
    },
  });

  useEffect(() => {
    void checkPermissions();
    return () => {
      stopStream();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const checkPermissions = async () => {
    try {
      const permissionStatus = await navigator.permissions.query({
        name: "microphone" as PermissionName,
      });
      if (permissionStatus.state === "granted") {
        setHasPermission(true);
      } else if (permissionStatus.state === "denied") {
        setHasPermission(false);
      } else {
        setHasPermission(null);
      }
    } catch (error) {
      setHasPermission(null);
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
        setAudioBlob(blob);
        stopStream();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      intervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      setHasPermission(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setDuration(0);
  };

  const handleSend = async () => {
    if (audioBlob) {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      sendAudio.mutate({
        audio: base64,
        mimeType: audioBlob.type,
      });
    }
  };

  const handleCancel = () => {
    resetRecording();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (hasPermission === false) {
    return (
      <div className={className}>
        <p className="text-sm text-red-600">Microphone not authorized</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Recording indicator */}
      {isRecording && (
        <div className="mb-3 flex items-center justify-center">
          <div className="flex items-center space-x-2 rounded-lg bg-red-50 px-3 py-1">
            <div className="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
            <span className="font-mono text-xs text-red-700">
              {formatDuration(duration)}
            </span>
          </div>
        </div>
      )}

      {/* Buttons */}
      {!audioBlob && !isRecording && (
        <button
          onClick={startRecording}
          className="ml-4 rounded-xl bg-red-600 px-8 py-3 font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-red-700"
        >
          🎤 Record
        </button>
      )}

      {isRecording && (
        <button
          onClick={stopRecording}
          className="ml-4 rounded-xl bg-slate-800 px-8 py-3 font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-slate-700"
        >
          ⏹️ Stop
        </button>
      )}

      {audioBlob && !isRecording && (
        <div className="ml-4 flex space-x-3">
          <button
            onClick={handleSend}
            disabled={sending}
            className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400"
          >
            {sending ? "Sending..." : "📤 Send"}
          </button>

          <button
            onClick={handleCancel}
            disabled={sending}
            className="rounded-xl bg-gray-500 px-6 py-3 font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-gray-600 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            ❌ Cancel
          </button>
        </div>
      )}
    </div>
  );
}

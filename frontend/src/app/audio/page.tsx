"use client";

import { useState, useRef, useEffect } from "react";
import { MessageHistory } from "../_components/message-history";
import { api } from "~/trpc/react";

export default function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
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
			console.log("Message sent successfully:", data);
      resetRecording(); // Clear the audio after sending
		},
		onError: (error) => {
			console.error("Error sending message:", error);
		},
		onSettled: () => {
			setSending(false);
		},
	});
  // Vérifier si les permissions sont disponibles au chargement
  useEffect(() => {
    void checkPermissions();
    return () => {
      // Cleanup
      stopStream();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const checkPermissions = async () => {
    try {
      // Vérifier les permissions sans demander l'accès
      const permissionStatus = await navigator.permissions.query({
        name: "microphone" as PermissionName,
      });
      if (permissionStatus.state === "granted") {
        setHasPermission(true);
      } else if (permissionStatus.state === "denied") {
        setHasPermission(false);
      } else {
        setHasPermission(null); // Permission pas encore demandée
      }
    } catch (error) {
      // Fallback si navigator.permissions n'est pas supporté
      setHasPermission(null);
    }
  };

  const requestMicrophoneAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      // Arrêter immédiatement le stream après vérification
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.error("Erreur d'accès au microphone:", error);
      setHasPermission(false);
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
      // Demander l'accès au micro uniquement au moment de l'enregistrement
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
        setAudioUrl(URL.createObjectURL(blob));
        // Arrêter le stream après l'enregistrement
        stopStream();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Démarrer le compteur de durée
      intervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Erreur lors du démarrage de l'enregistrement:", error);
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
    setAudioUrl("");
    setDuration(0);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (audioBlob) {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      sendAudio.mutate({
        audio: base64,
        mimeType: audioBlob.type, // optionnel: garder le type MIME
      });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-slate-800">
              Enregistrement Audio
            </h1>
            <p className="text-lg text-slate-600">
              Enregistrez votre message vocal
            </p>
          </div>

          {/* Audio Recorder */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
            {hasPermission === null && (
              <div className="text-center">
                <p className="mb-4 text-slate-600">
                  Cliquez sur enregistrer pour autoriser l&apos;accès au
                  microphone
                </p>
                {/* <button
                  onClick={requestMicrophoneAccess}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  Tester le microphone
                </button> */}
              </div>
            )}

            {hasPermission === false && (
              <div className="text-center">
                <p className="mb-4 text-red-600">
                  Accès au microphone refusé. Veuillez autoriser l&apos;accès
                  dans les paramètres de votre navigateur.
                </p>
                <button
                  onClick={requestMicrophoneAccess}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  Réessayer
                </button>
              </div>
            )}

            {(hasPermission === true || hasPermission === null) && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Recording Controls */}
                <div className="text-center">
                  <div className="mb-6">
                    {isRecording && (
                      <div className="mb-4">
                        <div className="inline-flex items-center space-x-2 rounded-lg bg-red-100 px-4 py-2">
                          <div className="h-3 w-3 animate-pulse rounded-full bg-red-500"></div>
                          <span className="font-mono text-red-700">
                            {formatDuration(duration)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-red-600">
                          🎤 Microphone actif
                        </p>
                      </div>
                    )}

                    <div className="flex justify-center space-x-4">
                      {!isRecording ? (
                        <button
                          type="button"
                          onClick={startRecording}
                          className="flex items-center space-x-2 rounded-xl bg-red-600 px-8 py-4 font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-red-700"
                        >
                          <svg
                            className="h-6 w-6"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Commencer l&apos;enregistrement</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="flex items-center space-x-2 rounded-xl bg-slate-800 px-8 py-4 font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-slate-700"
                        >
                          <svg
                            className="h-6 w-6"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 000 2h4a1 1 0 100-2H8z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Arrêter l&apos;enregistrement</span>
                        </button>
                      )}

                      {audioBlob && !isRecording && (
                        <button
                          type="button"
                          onClick={resetRecording}
                          className="flex items-center space-x-2 rounded-xl bg-gray-600 px-6 py-4 font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-gray-700"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Reset</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Audio Preview */}
                  {audioUrl && !isRecording && (
                    <div className="mb-6">
                      <h3 className="mb-3 text-lg font-semibold text-slate-700">
                        Aperçu de l&apos;enregistrement
                      </h3>
                      <audio src={audioUrl} controls className="mx-auto" />
                    </div>
                  )}

                  {/* Submit Button */}
                  {audioBlob && !isRecording && (
                    <div className="flex justify-center">
                      <button
                        type="submit"
                        className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-blue-700"
                      >
                        Envoyer l&apos;audio
                      </button>
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Le microphone ne sera activé que pendant l&apos;enregistrement
            </p>
          </div>
          {/* Message History */}
          <div className="mt-12">
            <MessageHistory />
          </div>
        </div>
      </div>
    </main>
  );
}

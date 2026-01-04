import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

const CubeControls = ({ onRotationChange }) => {
    const videoRef = useRef(null);
    const [webcamRunning, setWebcamRunning] = useState(false);
    const handLandmarkerRef = useRef(null);
    const lastVideoTimeRef = useRef(-1);
    const requestRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        const initHandLandmarker = async () => {
            try {
                if (handLandmarkerRef.current) return;

                const vision = await FilesetResolver.forVisionTasks(
                    "/wasm"
                );

                if (!isMounted) return;

                handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numHands: 1
                });

                if (isMounted) {
                    startWebcam();
                }
            } catch (error) {
                console.error("Error initializing HandLandmarker:", error);
            }
        };

        if (isMounted) {
            initHandLandmarker();
        }

        return () => {
            isMounted = false;
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => {
                    track.stop();
                    videoRef.current.srcObject.removeTrack(track);
                });
                videoRef.current.srcObject = null;
            }
            // Optional: clean up handLandmarker if it has a close method (it usually doesn't need explicit close, but good to be safe if API changes)
            if (handLandmarkerRef.current) {
                handLandmarkerRef.current.close();
                handLandmarkerRef.current = null;
            }
            setWebcamRunning(false);
        };
    }, []);

    const startWebcam = () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.addEventListener("loadeddata", predictWebcam);
                    setWebcamRunning(true);
                }
            }).catch(err => {
                console.error("Error accessing webcam:", err);
            });
        }
    };

    const predictWebcam = () => {
        if (handLandmarkerRef.current && videoRef.current) {
            let startTimeMs = performance.now();
            if (lastVideoTimeRef.current !== videoRef.current.currentTime) {
                lastVideoTimeRef.current = videoRef.current.currentTime;
                try {
                    const results = handLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
                    if (results.landmarks && results.landmarks.length > 0) {
                        const landmarks = results.landmarks[0];

                        const x = landmarks[9].x;
                        const y = landmarks[9].y;

                        const rotationY = (x - 0.5) * Math.PI * 4;
                        const rotationX = (y - 0.5) * Math.PI * 4;

                        onRotationChange({ x: rotationX, y: rotationY });
                    }
                } catch (e) {
                    console.error("Detection error:", e);
                }
            }
            requestRef.current = requestAnimationFrame(predictWebcam);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 w-48 h-36 border-2 border-white/20 rounded-lg overflow-hidden z-50 bg-black">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover opacity-80 transform scale-x-[-1]" // Mirror effect
            />
            {!webcamRunning && (
                <div className="absolute inset-0 flex items-center justify-center text-white/50 text-xs">
                    Loading Camera...
                </div>
            )}
        </div>
    );
};

export default CubeControls;

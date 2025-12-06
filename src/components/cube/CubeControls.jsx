import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

const CubeControls = ({ onRotationChange }) => {
    const videoRef = useRef(null);
    const [webcamRunning, setWebcamRunning] = useState(false);
    const handLandmarkerRef = useRef(null);
    const lastVideoTimeRef = useRef(-1);
    const requestRef = useRef(null);

    useEffect(() => {
        const initHandLandmarker = async () => {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
            );
            handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numHands: 1
            });
            startWebcam();
        };

        initHandLandmarker();

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
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
            });
        }
    };

    const predictWebcam = () => {
        if (handLandmarkerRef.current && videoRef.current) {
            let startTimeMs = performance.now();
            if (lastVideoTimeRef.current !== videoRef.current.currentTime) {
                lastVideoTimeRef.current = videoRef.current.currentTime;
                const results = handLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

                if (results.landmarks && results.landmarks.length > 0) {
                    const landmarks = results.landmarks[0];
                    // Use wrist (0) or index finger tip (8) or center of palm to control rotation
                    // Let's use the wrist or a calculated center

                    // Landmarks are normalized [0, 1]
                    // x: 0 (left) -> 1 (right)
                    // y: 0 (top) -> 1 (bottom)

                    const x = landmarks[9].x; // Middle finger mcp (center-ish)
                    const y = landmarks[9].y;

                    // Map to rotation angles
                    // Center is 0.5, 0.5
                    // Range: -PI to PI

                    const rotationY = (x - 0.5) * Math.PI * 4; // Horizontal movement rotates around Y axis
                    const rotationX = (y - 0.5) * Math.PI * 4; // Vertical movement rotates around X axis

                    onRotationChange({ x: rotationX, y: rotationY });
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

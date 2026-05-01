import * as faceapi from '@vladmandic/face-api';

let modelsLoaded = false;

export async function loadFaceModels() {
  if (modelsLoaded) return;
  // Use public CDN for the model weights
  const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
  ]);
  modelsLoaded = true;
}

export async function extractFaceDescriptor(imageElement: HTMLImageElement): Promise<Float32Array | null> {
  await loadFaceModels();
  const detection = await faceapi.detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();
  
  return detection ? detection.descriptor : null;
}

export async function checkLivenessAndMatch(
  videoElement: HTMLVideoElement, 
  idDescriptor: Float32Array, 
  onInstruction: (instr: string) => void
): Promise<boolean> {
  await loadFaceModels();
  
  return new Promise((resolve) => {
    let hasLookedLeft = false;
    let hasLookedRight = false;
    let isProcessing = false;
    
    onInstruction('Veuillez tourner la tête légèrement à GAUCHE');

    const interval = setInterval(async () => {
      if (isProcessing) return;
      isProcessing = true;

      try {
        const detection = await faceapi.detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) {
          const landmarks = detection.landmarks;
          const nose = landmarks.getNose()[0];
          const leftCheek = landmarks.getJawOutline()[0];
          const rightCheek = landmarks.getJawOutline()[16];

          const leftDist = nose.x - leftCheek.x;
          const rightDist = rightCheek.x - nose.x;

          // Check Left Turn (yaw)
          if (!hasLookedLeft && leftDist < rightDist * 0.75) {
            hasLookedLeft = true;
            onInstruction('Parfait. Maintenant, tournez la tête à DROITE');
          }

          // Check Right Turn (yaw)
          if (hasLookedLeft && !hasLookedRight && rightDist < leftDist * 0.75) {
            hasLookedRight = true;
            onInstruction('Parfait. Regardez DROIT devant vous pour vérifier');
          }

          // Face Forward and Match
          if (hasLookedLeft && hasLookedRight && leftDist > rightDist * 0.6 && rightDist > leftDist * 0.6) {
            const distance = faceapi.euclideanDistance(idDescriptor, detection.descriptor);
            clearInterval(interval);
            
            // distance < 0.6 is strict, 0.75 is very forgiving (roughly 80% tolerance)
            if (distance < 0.75) {
               resolve(true);
            } else {
               resolve(false);
            }
            return;
          }
        }
      } catch (err) {
        console.error(err);
      }

      isProcessing = false;
    }, 300);

    // Timeout after 45 seconds to prevent infinite loops
    setTimeout(() => {
      clearInterval(interval);
      resolve(false);
    }, 45000);
  });
}

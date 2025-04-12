import React, { useRef, useEffect } from "react";

export default function HydraSynth({ source }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const aspectRatio = 16/9;
  
  useEffect(() => {
    if (!canvasRef.current) return;

    // Dynamically import hydra-synth (client-side only)
    import('hydra-synth').then((HydraModule) => {
      const canvas = canvasRef.current;
      
      // Adjust canvas size to maintain 16:9 aspect ratio based on container width
      const containerWidth = containerRef.current.clientWidth;
      const width = Math.min(containerWidth, 1280); // Cap at 1280px max width
      const height = width / aspectRatio;
      
      canvas.width = width;
      canvas.height = height;
      
      // Initialize hydra
      const hydra = new HydraModule.default({
        canvas: canvas,
        detectAudio: false,
        width: width,
        height: height
      });
      
      // Sanitize and prepare the source code
      const sanitizeHydraCode = (code) => {
        // Remove any HTML-like tags
        const sanitizedCode = code.replace(/<[^>]*>/g, '');
        
        // Trim whitespace and remove any leading/trailing backticks
        return sanitizedCode.trim().replace(/^`+|`+$/g, '');
      };

      // Validate and run the hydra code
      const runHydraCode = (code) => {
        try {
          // Sanitize the code
          const cleanCode = sanitizeHydraCode(code);
          
          // Check if the code is empty after sanitization
          if (!cleanCode) {
            console.warn("Hydra source code is empty after sanitization.");
            return;
          }
          
          // Attempt to evaluate the code
          hydra.eval(cleanCode);
        } catch (error) {
          console.error("Error running Hydra code:", error);
          
          // Attempt to provide more context
          console.log("Original source code:", code);
          console.log("Sanitized code:", sanitizeHydraCode(code));
        }
      };

      // Run the hydra code
      runHydraCode(source);
      
      // Clean up function
      return () => {
        // Any cleanup needed for hydra
        if (hydra && typeof hydra.close === 'function') {
          hydra.close();
        }
      };
    }).catch(importError => {
      console.error("Failed to import Hydra module:", importError);
    });
  }, [source]);

  return (
    <div ref={containerRef} style={{ width: '100%', marginBottom: '1.5rem' }}>
      <canvas 
        ref={canvasRef}
        style={{ 
          width: '100%', 
          height: 'auto',
          aspectRatio: `${aspectRatio}`,
          border: '1px solid #ccc',
          backgroundColor: 'black'
        }}
      />
    </div>
  );
}

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
        let sanitizedCode = code.replace(/<[^>]*>/g, '');
        
        // Replace local file paths with Git URLs - careful to preserve s0.initImage
        sanitizedCode = sanitizedCode.replace(
          /initImage\("file:\/\/\/home\/pln\/Work\/Hydra\/(.+?)\/(.+?)"\)/g, 
          'initImage("https://git.nech.pl/pln/Hydra/raw/master/$1/$2")'
        );
        
        // Replace old domain with new domain
        sanitizedCode = sanitizedCode.replace(/git\.plnech\.fr/g, 'git.nech.pl');
        
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
          
          // Log the transformed code for debugging
          console.log("Running Hydra code with transformed paths");
          
          // Attempt to evaluate the code
          hydra.eval(cleanCode);
        } catch (error) {
          console.error("Error running Hydra code:", error);
          
          // Attempt to provide more context
          console.log("Sanitized code error location:", error.lineNumber);
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

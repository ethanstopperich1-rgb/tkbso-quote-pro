/**
 * Extracts dominant colors from an image
 */

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface ExtractedColors {
  primary: string;
  accent: string;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function getColorLuminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function getColorSaturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
}

function colorDistance(c1: RGB, c2: RGB): number {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

/**
 * Simple k-means clustering for color quantization
 */
function kMeansClustering(colors: RGB[], k: number, iterations: number = 10): RGB[] {
  if (colors.length === 0) return [];
  if (colors.length <= k) return colors;

  // Initialize centroids randomly from the colors
  let centroids: RGB[] = [];
  const step = Math.floor(colors.length / k);
  for (let i = 0; i < k; i++) {
    centroids.push({ ...colors[i * step] });
  }

  for (let iter = 0; iter < iterations; iter++) {
    // Assign colors to nearest centroid
    const clusters: RGB[][] = Array.from({ length: k }, () => []);
    
    for (const color of colors) {
      let minDist = Infinity;
      let closestIdx = 0;
      
      for (let i = 0; i < centroids.length; i++) {
        const dist = colorDistance(color, centroids[i]);
        if (dist < minDist) {
          minDist = dist;
          closestIdx = i;
        }
      }
      
      clusters[closestIdx].push(color);
    }

    // Update centroids
    for (let i = 0; i < k; i++) {
      if (clusters[i].length > 0) {
        centroids[i] = {
          r: clusters[i].reduce((sum, c) => sum + c.r, 0) / clusters[i].length,
          g: clusters[i].reduce((sum, c) => sum + c.g, 0) / clusters[i].length,
          b: clusters[i].reduce((sum, c) => sum + c.b, 0) / clusters[i].length,
        };
      }
    }
  }

  return centroids;
}

/**
 * Extract colors from an image URL
 */
export async function extractColorsFromImage(imageUrl: string): Promise<ExtractedColors> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Scale down for performance
        const maxSize = 100;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        
        // Collect non-transparent, non-white, non-black pixels
        const colors: RGB[] = [];
        
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];
          
          // Skip transparent pixels
          if (a < 128) continue;
          
          // Skip near-white pixels
          if (r > 240 && g > 240 && b > 240) continue;
          
          // Skip near-black pixels
          if (r < 15 && g < 15 && b < 15) continue;
          
          // Skip very low saturation (grays)
          const saturation = getColorSaturation(r, g, b);
          if (saturation < 0.1) continue;
          
          colors.push({ r, g, b });
        }

        if (colors.length === 0) {
          // Fallback to defaults if no suitable colors found
          resolve({
            primary: '#0B1C3E',
            accent: '#00E5FF'
          });
          return;
        }

        // Cluster colors to find dominant ones
        const clusters = kMeansClustering(colors, 5);
        
        // Sort by saturation and pick the most vibrant colors
        const sortedColors = clusters
          .map(c => ({
            ...c,
            hex: rgbToHex(c.r, c.g, c.b),
            luminance: getColorLuminance(c.r, c.g, c.b),
            saturation: getColorSaturation(c.r, c.g, c.b)
          }))
          .filter(c => c.saturation > 0.15) // Filter out grays
          .sort((a, b) => b.saturation - a.saturation);

        if (sortedColors.length === 0) {
          resolve({
            primary: '#0B1C3E',
            accent: '#00E5FF'
          });
          return;
        }

        // Pick primary as the most saturated darker color
        // Pick accent as the most saturated brighter color
        const darkColors = sortedColors.filter(c => c.luminance < 0.5);
        const brightColors = sortedColors.filter(c => c.luminance >= 0.3);

        const primary = darkColors.length > 0 
          ? darkColors[0].hex 
          : sortedColors[0].hex;
        
        const accent = brightColors.length > 0 && brightColors[0].hex !== primary
          ? brightColors[0].hex
          : sortedColors.length > 1 
            ? sortedColors[1].hex 
            : sortedColors[0].hex;

        resolve({ primary, accent });
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
}

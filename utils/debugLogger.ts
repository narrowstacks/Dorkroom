const DEBUG_ENABLED = __DEV__ || false;

export const debugLog = (...args: any[]) => {
  if (DEBUG_ENABLED) {
    console.log(...args);
  }
};

export const debugWarn = (...args: any[]) => {
  if (DEBUG_ENABLED) {
    console.warn(...args);
  }
};

export const debugError = (...args: any[]) => {
  if (DEBUG_ENABLED) {
    console.error(...args);
  }
};

// Performance timing utilities
const performanceTimers = new Map<string, number>();

export const debugLogTiming = (label: string, startTime?: number) => {
  if (!DEBUG_ENABLED) return;
  
  if (startTime === undefined) {
    // Start timing
    const now = performance.now();
    performanceTimers.set(label, now);
    debugLog(`⏱️ [TIMING START] ${label}`);
    return now;
  } else {
    // End timing
    const endTime = performance.now();
    const duration = endTime - startTime;
    debugLog(`⏱️ [TIMING END] ${label}: ${duration.toFixed(2)}ms`);
    performanceTimers.delete(label);
    return duration;
  }
};

// Continuous FPS monitoring
let fpsMonitoringState = {
  isActive: false,
  frameCount: 0,
  lastFrameTime: 0,
  startTime: 0,
  frameTimes: [] as number[],
  animationFrameId: null as number | null,
  logInterval: null as NodeJS.Timeout | null,
};

const measureFrame = () => {
  if (!DEBUG_ENABLED) return;
  if (!fpsMonitoringState.isActive) return;
  
  const now = performance.now();
  
  if (fpsMonitoringState.lastFrameTime > 0) {
    const frameTime = now - fpsMonitoringState.lastFrameTime;
    fpsMonitoringState.frameTimes.push(frameTime);
    fpsMonitoringState.frameCount++;
    
    // Keep only last 120 frames (about 2 seconds at 60fps)
    if (fpsMonitoringState.frameTimes.length > 120) {
      fpsMonitoringState.frameTimes.shift();
    }
  }
  
  fpsMonitoringState.lastFrameTime = now;
  fpsMonitoringState.animationFrameId = requestAnimationFrame(measureFrame);
};

export const startContinuousFPSMonitoring = (label: string = 'Page') => {
  if (!DEBUG_ENABLED || fpsMonitoringState.isActive) return;
  
  debugLog(`📊 [FPS MONITOR] Starting continuous monitoring for ${label}`);
  
  fpsMonitoringState.isActive = true;
  fpsMonitoringState.frameCount = 0;
  fpsMonitoringState.startTime = performance.now();
  fpsMonitoringState.frameTimes = [];
  fpsMonitoringState.lastFrameTime = 0;
  
  // Start frame measurement
  fpsMonitoringState.animationFrameId = requestAnimationFrame(measureFrame);
  
  // Log averages every 5 seconds
  fpsMonitoringState.logInterval = setInterval(() => {
    if (fpsMonitoringState.frameTimes.length > 0) {
      const frameTimes = fpsMonitoringState.frameTimes;
      const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      const minFrameTime = Math.min(...frameTimes);
      const maxFrameTime = Math.max(...frameTimes);
      const avgFPS = 1000 / avgFrameTime;
      const minFPS = 1000 / maxFrameTime;
      const maxFPS = 1000 / minFrameTime;
      
      const quality = avgFPS >= 55 ? 'excellent' : avgFPS >= 45 ? 'good' : avgFPS >= 30 ? 'fair' : 'poor';
      const qualityColor = avgFPS >= 55 ? '🟢' : avgFPS >= 45 ? '🟡' : avgFPS >= 30 ? '🟠' : '🔴';
      
      debugLog(`${qualityColor} [FPS MONITOR] ${label} - Avg: ${avgFPS.toFixed(1)}fps | Min: ${minFPS.toFixed(1)}fps | Max: ${maxFPS.toFixed(1)}fps | Quality: ${quality}`);
      
      debugLogPerformance(`Continuous FPS - ${label}`, {
        avgFPS: parseFloat(avgFPS.toFixed(1)),
        minFPS: parseFloat(minFPS.toFixed(1)),
        maxFPS: parseFloat(maxFPS.toFixed(1)),
        avgFrameTime: parseFloat(avgFrameTime.toFixed(2)),
        quality,
        sampleSize: frameTimes.length,
        timestamp: new Date().toISOString()
      });
    }
  }, 5000);
};

export const stopContinuousFPSMonitoring = () => {
  if (!DEBUG_ENABLED || !fpsMonitoringState.isActive) return;
  
  debugLog(`📊 [FPS MONITOR] Stopping continuous monitoring`);
  
  fpsMonitoringState.isActive = false;
  
  if (fpsMonitoringState.animationFrameId !== null) {
    cancelAnimationFrame(fpsMonitoringState.animationFrameId);
    fpsMonitoringState.animationFrameId = null;
  }
  
  if (fpsMonitoringState.logInterval !== null) {
    clearInterval(fpsMonitoringState.logInterval);
    fpsMonitoringState.logInterval = null;
  }
  
  // Final summary
  if (fpsMonitoringState.frameTimes.length > 0) {
    const totalTime = performance.now() - fpsMonitoringState.startTime;
    const avgFPS = (fpsMonitoringState.frameCount / totalTime) * 1000;
    debugLog(`📊 [FPS MONITOR] Final Summary - Total time: ${(totalTime / 1000).toFixed(1)}s | Avg FPS: ${avgFPS.toFixed(1)}fps | Total frames: ${fpsMonitoringState.frameCount}`);
  }
};

export const debugLogPerformance = (label: string, data: Record<string, any>) => {
  if (DEBUG_ENABLED) {
    console.log(`🚀 [PERFORMANCE] ${label}:`, data);
  }
};

export const debugLogAnimationFrame = (label: string, frameTime: number) => {
  if (DEBUG_ENABLED) {
    // Only log if frameTime is reasonable (avoid division by zero or tiny values)
    if (frameTime > 0 && frameTime < 1000) {
      const fps = 1000 / frameTime;
      const fpsColor = fps >= 55 ? '🟢' : fps >= 45 ? '🟡' : '🔴';
      debugLog(`${fpsColor} [ANIMATION] ${label}: ${fps.toFixed(1)}fps (${frameTime.toFixed(2)}ms)`);
      
      // Also log detailed FPS data
      debugLogPerformance(`FPS - ${label}`, {
        fps: parseFloat(fps.toFixed(1)),
        frameTime: parseFloat(frameTime.toFixed(2)),
        quality: fps >= 55 ? 'excellent' : fps >= 45 ? 'good' : 'poor',
        timestamp: new Date().toISOString()
      });
    } else {
      debugWarn(`[ANIMATION] ${label}: Invalid frameTime: ${frameTime}ms`);
    }
  }
};

export const debugLogMemory = (label: string) => {
  if (DEBUG_ENABLED && (performance as any).memory) {
    const memory = (performance as any).memory;
    debugLogPerformance(`${label} - Memory`, {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
    });
  }
};
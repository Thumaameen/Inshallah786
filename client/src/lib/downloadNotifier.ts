
export function notifyDownload(fileName: string, fileType: string) {
  // Detect mobile device
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // Show toast notification
  const event = new CustomEvent('download-notification', {
    detail: {
      fileName,
      fileType,
      timestamp: new Date().toISOString(),
      location: isMobile ? 'Your device Downloads folder' : 'Browser Downloads folder',
      isMobile
    }
  });
  window.dispatchEvent(event);
  
  // Mobile-specific alert
  if (isMobile) {
    setTimeout(() => {
      alert(`📱 Download Ready!\n\nFile: ${fileName}\n\nYour document will open in a new tab. Tap and hold the document to save it to your iPhone/Android Downloads folder.`);
    }, 500);
  }
  
  // Console log for clarity
  console.log(`
╔════════════════════════════════════════════════════════╗
║          👑 DOWNLOAD COMPLETE 👑                       ║
╠════════════════════════════════════════════════════════╣
║ File: ${fileName.padEnd(44)} ║
║ Type: ${fileType.padEnd(44)} ║
║ Device: ${(isMobile ? 'Mobile' : 'Desktop').padEnd(44)} ║
║ Location: ${(isMobile ? 'Device Downloads' : 'Browser Downloads').padEnd(33)} ║
║ Time: ${new Date().toLocaleTimeString().padEnd(44)} ║
╚════════════════════════════════════════════════════════╝
  `);
}

export function setupDownloadListener() {
  window.addEventListener('download-notification', ((e: CustomEvent) => {
    const { fileName, location } = e.detail;
    
    // Create visual notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-yellow-500 to-cyan-500 text-teal-950 px-6 py-4 rounded-lg shadow-2xl z-50 animate-bounce';
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="text-2xl">💎</span>
        <div>
          <div class="font-bold">Download Complete!</div>
          <div class="text-sm">${fileName}</div>
          <div class="text-xs mt-1">📁 ${location}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }) as EventListener);
}

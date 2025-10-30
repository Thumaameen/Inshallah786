
export function notifyDownload(fileName: string, fileType: string) {
  // Show toast notification
  const event = new CustomEvent('download-notification', {
    detail: {
      fileName,
      fileType,
      timestamp: new Date().toISOString(),
      location: 'Browser Downloads folder'
    }
  });
  window.dispatchEvent(event);
  
  // Console log for clarity
  console.log(`
╔════════════════════════════════════════════════════════╗
║          👑 DOWNLOAD COMPLETE 👑                       ║
╠════════════════════════════════════════════════════════╣
║ File: ${fileName.padEnd(44)} ║
║ Type: ${fileType.padEnd(44)} ║
║ Location: Browser Downloads folder                    ║
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

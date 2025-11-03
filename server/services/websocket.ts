import WebSocket, { WebSocketServer } from 'ws';
import { EventEmitter } from 'events';
import { Server as HttpServer } from 'http'; // Assuming HttpServer is needed for type safety

export class WebSocketService extends EventEmitter {
  private static instance: WebSocketService;
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();
  private connectedUsers: Map<string, WebSocket> = new Map();
  private server: HttpServer | null = null; // Added to store the http server instance

  private constructor() {
    super();
  }

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  initialize(server: HttpServer): void {
    if (this.wss) {
      console.log('WebSocket service already initialized');
      return;
    }
    this.server = server; // Store the server instance
    this.wss = new WebSocketServer({ server: this.server });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer(): void {
    if (!this.wss) return;

    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(ws, data);
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        // Remove user from connectedUsers map when connection is closed
        this.connectedUsers.forEach((clientWs, userId) => {
          if (clientWs === ws) {
            this.connectedUsers.delete(userId);
          }
        });
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
        // Remove user from connectedUsers map when an error occurs
        this.connectedUsers.forEach((clientWs, userId) => {
          if (clientWs === ws) {
            this.connectedUsers.delete(userId);
          }
        });
      });
    });
  }

  private handleMessage(ws: WebSocket, data: any): void {
    if (data.type === 'user_connected' && data.userId) {
      this.connectedUsers.set(data.userId, ws);
    } else {
      // Handle other message types if necessary
      this.emit('message', { ws, data });
    }
  }

  broadcastMessage(message: any): void {
    const messageStr = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  sendToUser(userId: string, message: any): boolean {
    const ws = this.connectedUsers.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  getConnectedUserCount(): number {
    return this.connectedUsers.size;
  }

  closeAllConnections(): void {
    this.clients.forEach(client => {
      client.close();
    });
    this.clients.clear();
    this.connectedUsers.clear();
  }
}

export const webSocketService = WebSocketService.getInstance();
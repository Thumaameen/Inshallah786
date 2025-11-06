// storage.d.ts
export interface IStorage {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<void>;
  delete: (key: string) => Promise<void>;
  checkConnection: () => Promise<boolean>;
  // Extended database functionality
  db?: {
    select: () => any;
    from: (table: string) => any;
  };
  users?: {
    name: string;
  };
  getUsers?: () => Promise<any[]>;
}
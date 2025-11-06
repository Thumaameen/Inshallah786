interface Database {
  select(): any;
  from(table: string): any;
}

interface Table {
  name: string;
}

export interface Storage {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
  checkConnection?(): Promise<boolean>;
  db?: Database;
  users?: Table;
  getUsers?(): Promise<any[]>;
}
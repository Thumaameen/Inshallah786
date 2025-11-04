declare module '*.ts' {
  const content: any;
  export default content;
}

declare module '*.tsx' {
  const content: any;
  export default content;
}

declare module '@tanstack/react-query' {
  export interface QueryFunctionContext {
    queryKey: string[];
  }
  
  export type QueryFunction<T = unknown> = (context: QueryFunctionContext) => Promise<T>;
  
  export interface MutationFunction<TData = unknown, TVariables = unknown> {
    (variables: TVariables): Promise<TData>;
  }
}

interface Window {
  speechSynthesis: SpeechSynthesis;
}
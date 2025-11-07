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

  export function useQuery<T>(key: string[], fn: QueryFunction<T>): { data: T | undefined, isLoading: boolean, error: Error | null };
  export function useMutation<TData, TVariables>(fn: MutationFunction<TData, TVariables>): { 
    mutate: (variables: TVariables) => Promise<TData>,
    isLoading: boolean,
    error: Error | null
  };
}

interface Window {
  speechSynthesis: SpeechSynthesis;
}
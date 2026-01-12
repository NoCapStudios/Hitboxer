export {};

declare global {
  interface Window {
    electronAPI: {
      openImageDialog: () => Promise<string | null>;
      loadImage: (filePath: string) => string;
      onAddImage: (cb: (event: unknown, ...args: unknown[]) => void) => void;
      offAddImage: (cb: (event: unknown, ...args: unknown[]) => void) => void;
      
      onRemoveImage: (cb: (event: unknown, ...args: unknown[]) => void) => void;
      offRemoveImage: (cb: (event: unknown, ...args: unknown[]) => void) => void;
      
      onOpenFolder: (cb: (event: unknown, ...args: unknown[]) => void) => void;
      offOpenFolder: (cb: (event: unknown, ...args: unknown[]) => void) => void;
    };
  }
}
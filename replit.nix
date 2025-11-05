{ pkgs }: {
    deps = [
        # Node.js and core development tools
        pkgs.nodejs-20_x
        pkgs.nodePackages.typescript-language-server
        pkgs.nodePackages.typescript
        pkgs.nodePackages.npm
        
        # Build tools and utilities
        pkgs.yarn
        pkgs.esbuild
        pkgs.vite
        
        # Testing and development tools
        pkgs.replitPackages.jest
        pkgs.nodePackages.tsx
        
        # System utilities
        pkgs.netcat
        pkgs.curl
        pkgs.jq
        pkgs.git
        
        # Development environment
        pkgs.nixpkgs-fmt
        pkgs.nodePackages.prettier
        
        # Database tools
        pkgs.sqlite
        
        # Monitoring and debugging
        pkgs.htop
        pkgs.lsof
    ];
}
# /home/jim/Dev/NGOL-CG/flake.nix
{
  description = "NGOL-CG — Reflex, GHC-WASM, MariaDB";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.05";
    ghc-wasm-meta.url = "git+file:///home/jim/Dev/ghc-wasm-meta";
  };

  outputs = { self, nixpkgs, ghc-wasm-meta }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
      # In flake.nix → outputs
      start-servers = pkgs.writeShellScriptBin "start-servers" (builtins.readFile ./scripts/start-servers.sh);
    in {
      devShells.default = pkgs.mkShell {
        name = "ngol-cg";
        inputsFrom = [ ghc-wasm-meta.devShells.${system}.default ];
        packages = with pkgs; [
          reflex
          reflex-dom
          mariadb-client
          git
          tree
          ripgrep
        ];
        shellHook = ''
          echo "🚀 NGOL-CG: Reflex + GHC-WASM"
          ghc --version 2>/dev/null | head -1
        '';
      };

      # Build WASM app
      packages.wasm = pkgs.stdenv.mkDerivation {
        name = "ngol-cg-wasm";
        src = ./.;
        nativeBuildInputs = [ (ghc-wasm-meta.devShells.${system}.default.env.ghc) ];
        buildPhase = ''
          HOME=$TMPDIR cabal update
          HOME=$TMPDIR cabal build --wasm
        '';
        installPhase = ''
          mkdir -p $out/static
          find dist-newstyle -name "*.wasm" -exec cp {} $out/static/app.wasm \;
          cp app.js $out/static/ 2>/dev/null || true
        '';
      };
    };
}

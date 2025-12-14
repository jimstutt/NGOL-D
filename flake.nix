{
  description = "NGO Logistics Dashboard (Node.js + SQLite + Vue)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};

      # Backend (Nixified)
      backend = pkgs.callPackage ./Backend/default.nix { inherit pkgs; };

      # Frontend (App/)
      frontend = pkgs.callPackage ./App { inherit pkgs; };

    in {
      # nix build .#Backend
      packages.Backend = backend;

      # nix build .#frontend → static site
      packages.frontend = frontend.default;

      # nix run .#Backend
      apps.Backend = {
        type = "app";
        program = "${backend}/bin/ngol-backend";
      };

      # nix run .#frontend-prod
      apps.frontend-prod = {
        type = "app";
        program = "${frontend.serve}/bin/serve-prod";
      };

      # nix develop → full stack dev
      devShells.default = pkgs.mkShell {
        packages = [ pkgs.nodejs_20 pkgs.yarn pkgs.sqlite pkgs.curl ];
        shellHook = ''
          echo "✅ NGO Logistics Dev Shell"
          echo "   Backend: cd Backend && node server.js"
          echo "   Frontend: cd App && npm run dev"
          echo "   Full stack: ./scripts/start-servers.sh"
        '';
      };

      # nix develop .#frontend
      devShells.frontend = frontend.devShell;
    });
}

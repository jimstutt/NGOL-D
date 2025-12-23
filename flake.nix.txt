{
  description = "NGO Logistics Dashboard (Node.js + MariaDB + Vue)";
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
      backend = pkgs.callPackage ./Backend/default.nix { inherit pkgs; };
      app = pkgs.callPackage ./App { inherit pkgs; };
    in {
      # nix build .#App .#Backend
      packages.App = app.default;
      packages.Backend = backend;

      # nix run .#App-prod
      apps.App-prod = {
        type = "app";
        program = "${app.serve}/bin/serve-prod";
      };

      # nix run .#Backend
      apps.Backend = {
        type = "app";
        program = "${backend}/bin/ngol-d-backend";
      };

      # nix run .#check (integration tests)
      apps.check = {
        type = "app";
        program = toString ./scripts/check.js;
      };

      # nix develop
      devShells.default = pkgs.mkShell {
        packages = [ pkgs.nodejs_20 pkgs.mariadb pkgs.curl ];
        shellHook = ''
          echo "✅ NGOL-D Dev Shell"
          echo "   Backend: cd Backend && node server.js"
          echo "   Frontend: cd App && npm run dev"
          echo "   Full stack: ./scripts/start-servers.sh"
        '';
      };
    });
}

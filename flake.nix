{
  description = "NGOL-D — NGO Logistics System (MariaDB, Vue, Node)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
    systems.url = "github:nix-systems/default-linux";
  };

  outputs = { self, nixpkgs, systems }:
    let
      forEachSystem = f: nixpkgs.lib.genAttrs (import systems) (system: f nixpkgs.legacyPackages.${system});
    in
    {
      packages = forEachSystem (pkgs:
        rec {
          ngol-d-backend = pkgs.callPackage ./Backend/default.nix { };
          ngol-d-frontend = pkgs.callPackage ./App/default.nix { };
        });
      devShells = forEachSystem (pkgs: {
        default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_20
            mariadb-client
            git
          ];
        };
      });
    };
}

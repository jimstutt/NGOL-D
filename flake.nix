{
  description = "NGO Logistics Development Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    home-manager.url = "github:nix-community/home-manager";
    home-manager.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = { self, nixpkgs, home-manager, ... }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      homeConfigurations.jim = home-manager.lib.homeManagerConfiguration {
        inherit pkgs;
        modules = [ ./home.nix ];
      };
      
      # Development shell with SQLite
      devShells.${system}.default = pkgs.mkShell {
        packages = with pkgs; [
          sqlite    # Only sqlite, not sqlite-interactive
          nodejs_20
          git
        ];
        
        shellHook = ''
          echo "NGO Logistics Development Environment"
          echo "SQLite database tools available"
          export DATABASE_DIR="/home/jim/persist"
          mkdir -p $DATABASE_DIR
          echo "Database will be stored at: $DATABASE_DIR/ngo_logistics.db"
        '';
      };
    };
}

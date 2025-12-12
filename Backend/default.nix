# Backend/default.nix
{ pkgs ? import <nixpkgs> { } }:

let
  nodeEnv = import ./node-env.nix {
    inherit pkgs;
    # Use nodejs 20 LTS (or match your engine version in package.json)
    nodejs = pkgs.nodejs_20;
  };
in
pkgs.stdenv.mkDerivation {
  pname = "ngol-backend";
  version = "1.0.0";

  src = pkgs.lib.cleanSource ./.;

  # Build the Node.js environment + copy sources
  buildInputs = [ pkgs.makeWrapper ];

  buildPhase = ''
    runHook preBuild

    # Copy app source into derivation
    mkdir -p $out/lib
    cp -r . $out/lib/app
    cp -r ${nodeEnv}/lib/node_modules $out/lib/

    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall

    mkdir -p $out/bin
    # Wrapper script to set NODE_PATH and run server.js
    makeWrapper ${pkgs.nodejs_20}/bin/node $out/bin/ngol-backend \
      --add-flags "$out/lib/app/server.js" \
      --set NODE_PATH "$out/lib/node_modules" \
      --chdir "$out/lib/app"

    runHook postInstall
  '';

  # Optional: expose dev shell (for `nix develop`)
  passthru.shell = pkgs.mkShell {
    packages = [ pkgs.nodejs_20 pkgs.sqlite ];
    shellHook = ''
      export NODE_PATH=${nodeEnv}/lib/node_modules
      echo "Backend dev shell ready. Run: node server.js"
    '';
  };

  meta = {
    description = "NGO Logistics Backend (Node.js + SQLite)";
    platforms = pkgs.lib.platforms.linux ++ pkgs.lib.platforms.darwin;
  };
}

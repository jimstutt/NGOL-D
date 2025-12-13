{ pkgs ? import <nixpkgs> { } }:

let
  # Import nodeEnv, but override nodejs to 20 (fully supported by Nix)
  nodeEnv = import ./node-env.nix {
    inherit pkgs;
    # ✅ This overrides the Node.js version used at runtime — regardless of node2nix build version
    nodejs = pkgs.nodejs_20;
  };
in
pkgs.stdenv.mkDerivation {
  pname = "ngol-backend";
  version = "1.0.0";
  src = ./.;

  nativeBuildInputs = [ pkgs.makeWrapper ];

  buildPhase = ''
    mkdir -p $out/lib
    cp -r --no-preserve=mode,ownership . $out/lib/app
    cp -r ${nodeEnv}/lib/node_modules $out/lib/
  '';

  installPhase = ''
    mkdir -p $out/bin
    makeWrapper ${pkgs.nodejs_20}/bin/node $out/bin/ngol-backend \
      --add-flags "$out/lib/app/server.js" \
      --set NODE_PATH "$out/lib/node_modules" \
      --chdir "$out/lib/app"
  '';
}

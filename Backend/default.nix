{ pkgs ? import <nixpkgs> { } }:

let
  node = pkgs.nodejs_20;
  esbuild = pkgs.esbuild;
in
pkgs.stdenv.mkDerivation {
  pname = "ngol-d-backend";
  version = "1.0.0";
  src = ./.;
  nativeBuildInputs = [ node esbuild pkgs.makeWrapper ];

  buildPhase = ''
    # Compile server.ts → server.js (ESM output, no JSX)
    $ESBUILD server.ts --bundle --platform=node --format=esm --outfile=dist/server.js

    mkdir -p $out/lib
    cp -r --no-preserve=mode,ownership . $out/lib/app
    cp -r dist/* $out/lib/app/
  '';

  installPhase = ''
    mkdir -p $out/bin
    makeWrapper ${node}/bin/node $out/bin/ngol-d-backend \
      --add-flags "$out/lib/app/server.js" \
      --chdir "$out/lib/app"
  '';
}

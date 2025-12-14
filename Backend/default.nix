{ pkgs ? import <nixpkgs> { } }:

let
  node = pkgs.nodejs_20;
in
pkgs.stdenv.mkDerivation {
  pname = "ngol-d-backend";
  version = "1.0.0";
  src = ./.;
  nativeBuildInputs = [ pkgs.makeWrapper node ];

  buildPhase = ''
    mkdir -p $out/lib
    cp -r --no-preserve=mode,ownership . $out/lib/app
  '';

  installPhase = ''
    mkdir -p $out/bin
    makeWrapper ${node}/bin/node $out/bin/ngol-d-backend \
      --add-flags "$out/lib/app/server.js" \
      --chdir "$out/lib/app"
  '';
}

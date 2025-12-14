{ pkgs ? import <nixpkgs> { } }:

let
  node = pkgs.nodejs_20;
in
pkgs.stdenv.mkDerivation {
  pname = "ngol-d-backend";
  version = "1.0.0";
  src = ./.;
  nativeBuildInputs = [ pkgs.makeWrapper pkgs.gnutar pkgs.nodejs_20 pkgs.makeWrapper pkgs.typescript ];

  buildPhase = ''
    mkdir -p $out/lib
    cp -r --no-preserve=mode,ownership . $out/lib/app
    tar -xzf ${./node_modules.tar.gz} -C $out/lib/app/
    # Optional: type-check during build
    npx tsc --noEmit
  '';

  installPhase = ''
    mkdir -p $out/bin
    makeWrapper ${node}/bin/node $out/bin/ngol-d-backend \
      --add-flags "$out/lib/app/server.js" \
      --set NODE_PATH "$out/lib/app/node_modules" \
      --chdir "$out/lib/app"
  '';
}

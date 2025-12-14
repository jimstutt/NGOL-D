{ pkgs ? import <nixpkgs> { } }:

let
  node = pkgs.nodejs_20;
in
pkgs.stdenv.mkDerivation {
  pname = "ngol-backend";
  version = "1.0.0";
  src = ./.;

  nativeBuildInputs = [ pkgs.makeWrapper pkgs.gnutar ];

  buildPhase = ''
    mkdir -p $out/lib
    cp -r --no-preserve=mode,ownership . $out/lib/app

    # Extract cached node_modules (offline, reproducible)
    tar -xzf ${./node_modules.tar.gz} -C $out/lib/app/
  '';

  installPhase = ''
    mkdir -p $out/bin
    makeWrapper ${node}/bin/node $out/bin/ngol-backend \
      --add-flags "$out/lib/app/server.js" \
      --set NODE_PATH "$out/lib/app/node_modules" \
      --chdir "$out/lib/app"
  '';
}

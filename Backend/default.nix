{ pkgs }:
let
  env = pkgs.callPackage ./node-env.nix { nodejs = pkgs.nodejs_20; };
  nodeDependencies = env.buildNodeDependencies {
    name = "ngol-backend-deps";
    packageName = "ngologistics-backend";
    src = ./.;
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
    cp -r ${nodeDependencies}/* $out/lib/
  '';
  installPhase = ''
    mkdir -p $out/bin
    makeWrapper ${pkgs.nodejs_20}/bin/node $out/bin/ngol-backend \
      --add-flags "$out/lib/app/server.js" \
      --set NODE_PATH "$out/lib" \
      --chdir "$out/lib/app"
  '';
}

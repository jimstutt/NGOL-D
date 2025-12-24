{ pkgs ? import <nixpkgs> {} }:

pkgs.stdenv.mkDerivation {
  name = "ngol-d-frontend";
  version = "1.0.0";
  src = ./.;

  buildInputs = [
    pkgs.nodejs_20
    pkgs.yarn
  ];

  buildPhase = ''
    runHook preBuild
    yarn install --frozen-lockfile --offline
    VITE_GOOGLE_MAPS_API_KEY="AIzaSyBTmKzNwMM1OIruKtneSGHYUYbJHMUL6j0" \
    VITE_API_URL="http://localhost:5000" \
      yarn run build
    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall
    mkdir -p $out
    cp -r dist/* $out/
    runHook postInstall
  '';

  dontPatchELF = true;
  dontStrip = true;
}

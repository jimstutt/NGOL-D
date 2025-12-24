{ pkgs ? import <nixpkgs> {} }:

pkgs.stdenv.mkDerivation {
  name = "ngol-d-backend";
  version = "1.0.0";
  src = ./.;

  buildInputs = [
    pkgs.nodejs_20
    pkgs.mariadb-client
  ];

  buildPhase = ''
    runHook preBuild
    HOME=$TMPDIR npm ci --offline --no-audit --no-fund
    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall
    mkdir -p $out/{bin,lib}
    cp -r . $out/lib/
    chmod +x $out/lib/server.js

    cat > $out/bin/ngol-d-backend <<SCRIPT
#!/usr/bin/env bash
cd \$out/lib
exec node server.js
SCRIPT
    chmod +x $out/bin/ngol-d-backend
    runHook postInstall
  '';

  dontPatchELF = true;
  dontStrip = true;
}

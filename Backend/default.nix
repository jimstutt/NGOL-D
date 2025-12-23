{ pkgs, stdenv, lib }:
stdenv.mkDerivation {
  name = "ngol-d-backend";
  src = ./server.js ./socket.js ./package.json ./package-lock.json;
  buildInputs = [ pkgs.nodejs_20 pkgs.mariadb ];
  installPhase = ''
    mkdir -p $out/bin
    cp server.js socket.js package.json package-lock.json $out/
    cat > $out/bin/ngol-d-backend <<'SCRIPT'
#!/usr/bin/env bash
cd "$out"
exec ${pkgs.nodejs_20}/bin/node server.js "$@"
SCRIPT
    chmod +x $out/bin/ngol-d-backend
  '';
}

{ pkgs, stdenv, lib }:
stdenv.mkDerivation {
  name = "ngol-d-backend";
  src = ./.;  # project root
  buildInputs = [ pkgs.nodejs_20 ];
  installPhase = ''
    mkdir -p $out/bin $out/lib
    # Inside builder: source root is 'Backend' (project root copy)
    # Files are at: server.js, socket.js, etc. (no 'Backend/' prefix)
    cp server.js socket.js package.json $out/lib/
    cp schema.sql $out/lib/ 2>/dev/null || true
    cp package-lock.json $out/lib/ 2>/dev/null || true
    cat > $out/bin/ngol-d-backend <<'SCRIPT'
#!/usr/bin/env bash
cd "$out/lib"
exec ${pkgs.nodejs_20}/bin/node server.js "$@"
SCRIPT
    chmod +x $out/bin/ngol-d-backend
  '';
}

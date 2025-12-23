{ pkgs, stdenv, lib }:
stdenv.mkDerivation {
  name = "ngol-d-backend";
  src = ./.;
  buildInputs = [ pkgs.nodejs_20 ];
  installPhase = ''
    mkdir -p $out/bin $out/lib

    # Try both layouts
    if [ -f server.js ] && [ -f socket.js ] && [ -f package.json ]; then
      cp server.js socket.js package.json $out/lib/
    elif [ -f Backend/server.js ] && [ -f Backend/socket.js ] && [ -f Backend/package.json ]; then
      cp Backend/server.js Backend/socket.js Backend/package.json $out/lib/
    else
      echo "❌ Required files not found. Layout unknown."
      exit 1
    fi

    cp schema.sql seed.js package-lock.json $out/lib/ 2>/dev/null || true

    cat > $out/bin/ngol-d-backend <<'SCRIPT'
#!/usr/bin/env bash
cd "$out/lib"
exec ${pkgs.nodejs_20}/bin/node server.js "$@"
SCRIPT
    chmod +x $out/bin/ngol-d-backend
  '';
}

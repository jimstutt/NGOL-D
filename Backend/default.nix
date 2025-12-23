{ pkgs, stdenv, lib }:
stdenv.mkDerivation {
  name = "ngol-d-backend";
  src = ./.;
  buildInputs = [ pkgs.nodejs_20 ];
  installPhase = ''
    mkdir -p $out/bin $out/lib

    # Find files robustly (works whether source root is 'Backend' or hash)
    SERVER_JS=$(find . -name server.js -path '*/Backend/*' -print -quit)
    SOCKET_JS=$(find . -name socket.js -path '*/Backend/*' -print -quit)
    PACKAGE_JSON=$(find . -name package.json -path '*/Backend/*' -print -quit)

    test -n "$SERVER_JS" || { echo "❌ server.js not found"; exit 1; }
    test -n "$SOCKET_JS" || { echo "❌ socket.js not found"; exit 1; }
    test -n "$PACKAGE_JSON" || { echo "❌ package.json not found"; exit 1; }

    cp "$SERVER_JS" "$SOCKET_JS" "$PACKAGE_JSON" $out/lib/
    cp schema.sql seed.js package-lock.json $out/lib/ 2>/dev/null || true

    cat > $out/bin/ngol-d-backend <<'SCRIPT'
#!/usr/bin/env bash
cd "$out/lib"
exec ${pkgs.nodejs_20}/bin/node server.js "$@"
SCRIPT
    chmod +x $out/bin/ngol-d-backend
  '';
}

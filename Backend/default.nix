{ pkgs, stdenv, lib }:
stdenv.mkDerivation {
  name = "ngol-d-backend";
  src = ./Backend;  # ← source is Backend/ directory
  buildInputs = [ pkgs.nodejs_20 ];
  installPhase = ''
    mkdir -p $out/bin $out/lib
    cp -v server.js socket.js package.json $out/lib/
    cp -v schema.sql seed.js $out/lib/ 2>/dev/null || true
    cp -v package-lock.json $out/lib/ 2>/dev/null || true
    cat > $out/bin/ngol-d-backend <<'SCRIPT'
#!/usr/bin/env bash
cd "$out/lib"
exec ${pkgs.nodejs_20}/bin/node server.js "$@"
SCRIPT
    chmod +x $out/bin/ngol-d-backend
    # Verify files exist
    test -f "$out/lib/server.js" || { echo "❌ server.js missing in $out/lib"; exit 1; }
    test -x "$out/bin/ngol-d-backend" || { echo "❌ launcher not executable"; exit 1; }
  '';
}

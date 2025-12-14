{ pkgs }:

let
  nodejs = pkgs.nodejs_20;

  static = pkgs.stdenv.mkDerivation {
    pname = "ngol-frontend";
    version = "1.0.0";
    src = ./.;

    nativeBuildInputs = [ nodejs ];

    buildPhase = ''
      export HOME=$TMPDIR
      # Allow network — Nix builds are sandboxed but can fetch
      npm ci --no-audit --no-fund --ignore-scripts --no-bin-links
      npm run build
    '';

    installPhase = ''
      mkdir -p $out
      cp -r dist/* $out/
    '';
  };

  serve = pkgs.writeShellScriptBin "serve-prod" ''
    exec ${pkgs.caddy}/bin/caddy file-server --root ${static} --listen :5173
  '';

in {
  default = static;
  serve = serve;
}

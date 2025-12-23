# ~/Dev/NGOL-D/nix/ngol-d.nix
# Production NixOS module for NGOL-D (systemd + MariaDB)

{ config, pkgs, lib, ... }:

let
  cfg = config.services.ngol-d;
  appName = "ngol-d";
  dataDir = "/var/lib/${appName}";
  logDir = "/var/log/${appName}";
  tlsDir = "${dataDir}/tls";
  runDir = "/run/${appName}";

  # TLS certs (replace with real ones in prod)
  caCert = builtins.toFile "ca.pem" ''
    -----BEGIN CERTIFICATE-----
    MIIDhzCCAm+gAwIBAgIUJZ...
    -----END CERTIFICATE-----
  '';
  serverCert = builtins.toFile "server-cert.pem" ''
    -----BEGIN CERTIFICATE-----
    MIIDfTCCAmWgAwIBAgIUJZ...
    -----END CERTIFICATE-----
  '';
  serverKey = builtins.toFile "server-key.pem" ''
    -----BEGIN PRIVATE KEY-----
    MIIEvQIBADANBgkqhkiG9w0...
    -----END PRIVATE KEY-----
  '';

  # MariaDB config
  mariadbConfig = pkgs.writeText "mariadb-config.cnf" ''
    [mysqld]
    datadir = ${dataDir}/mysql
    socket = ${runDir}/mariadb.sock
    pid-file = ${runDir}/mariadb.pid
    log-error = ${logDir}/mariadb.log
    ssl-cert = ${tlsDir}/server-cert.pem
    ssl-key = ${tlsDir}/server-key.pem
    ssl-ca = ${tlsDir}/ca.pem
    require-secure-transport = ON
    bind-address = 127.0.0.1
    default-authentication-plugin = mysql_native_password
  '';

  # NGOL-D backend
  backend = (import ../. {}).packages.${pkgs.system}.Backend;

in {
  options.services.ngol-d = {
    enable = lib.mkEnableOption "NGOL-D (Backend + MariaDB)";
    listenAddress = lib.mkOption {
      type = lib.types.str;
      default = "127.0.0.1";
      description = "Backend listen address";
    };
    port = lib.mkOption {
      type = lib.types.int;
      default = 3000;
      description = "Backend port";
    };
  };

  config = lib.mkIf cfg.enable {
    # Directories
    systemd.tmpfiles.rules = [
      "d ${dataDir} 0750 ngol-d ngol-d - -"
      "d ${logDir} 0755 ngol-d ngol-d - -"
      "d ${tlsDir} 0700 ngol-d ngol-d - -"
      "d ${runDir} 0755 ngol-d ngol-d - -"
    ];

    # TLS certs
    systemd.services.ngol-d-tls = {
      description = "NGOL-D TLS cert provisioning";
      wantedBy = [ "multi-user.target" ];
      script = ''
        install -m 0600 ${caCert} ${tlsDir}/ca.pem
        install -m 0600 ${serverCert} ${tlsDir}/server-cert.pem
        install -m 0600 ${serverKey} ${tlsDir}/server-key.pem
      '';
      serviceConfig = {
        Type = "oneshot";
        RemainAfterExit = true;
        User = "ngol-d";
      };
    };

    # MariaDB service
    services.mysql = {
      enable = true;
      package = pkgs.mariadb;
      ensureDatabases = [ "NGOL_D" ];
      ensureUsers = [
        {
          name = "ngol";
          ensurePermissions = { "NGOL_D.*" = "ALL PRIVILEGES"; };
          password = "ngol";  # ← rotate in prod!
        }
      ];
      initialScript = pkgs.writeText "init.sql" ''
        CREATE DATABASE IF NOT EXISTS NGOL_D;
      '';
      extraConfig = builtins.readFile mariadbConfig;
    };

    # NGOL-D backend service
    systemd.services.ngol-d-backend = {
      description = "NGOL-D Backend";
      wantedBy = [ "multi-user.target" ];
      after = [ "mysql.service" ];
      path = [ pkgs.curl ];
      script = ''
        cd ${backend}
        # Auto-migrate
        ${pkgs.nodejs_20}/bin/node ${../Backend/migrate.js}
        # Start
        exec ${backend}/bin/ngol-d-backend
      '';
      serviceConfig = {
        Type = "simple";
        User = "ngol-d";
        Restart = "always";
        Environment = [
          "MARIADB_HOST=127.0.0.1"
          "MARIADB_PORT=3306"
          "MARIADB_USER=ngol"
          "MARIADB_PASSWORD=ngol"
          "MARIADB_DATABASE=NGOL_D"
          "NODE_ENV=production"
        ];
        WorkingDirectory = dataDir;
      };
    };

    # User
    users.users.ngol-d = {
      group = "ngol-d";
      isSystemUser = true;
      home = dataDir;
    };
    users.groups.ngol-d = { };
  };
}

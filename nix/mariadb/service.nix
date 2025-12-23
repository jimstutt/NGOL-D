# Nix-managed MariaDB service for NGOL-D
# Data dir: /tmp/ngol-d-mariadb-data (dev-only)
{ pkgs, lib, ... }:

let
  dataDir = "/tmp/ngol-d-mariadb-data";
  configFile = pkgs.writeText "my.cnf" ''
    [mysqld]
    datadir=${dataDir}
    socket=${dataDir}/mysql.sock
    log-error=${dataDir}/mysqld.log
    pid-file=${dataDir}/mysqld.pid
    bind-address = 127.0.0.1
    port = 3306
    skip-networking = 0
    default-storage-engine = InnoDB
  '';
in
pkgs.runCommand "ngol-d-mariadb" {
  nativeBuildInputs = [ pkgs.mariadb ];
  preferLocalBuild = true;
} ''
  mkdir -p ${dataDir}
  chmod 700 ${dataDir}

  # Initialize if empty
  if [ ! -f ${dataDir}/mysql/user.frm ]; then
    mysqld --initialize-insecure --datadir=${dataDir}
  fi

  # Start server
  mysqld --defaults-file=${configFile} &
  MYSQLD_PID=$!

  # Wait for socket
  for i in {1..30}; do
    if [ -S ${dataDir}/mysql.sock ]; then break; fi
    sleep 1
  done

  # Apply init.sql
  mysql -S ${dataDir}/mysql.sock -u root < ${./init.sql}

  echo "✅ NGOL-D MariaDB ready on localhost:3306"
  echo "$MYSQLD_PID" > $out.pid
  wait $MYSQLD_PID
''

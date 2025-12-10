{ pkgs ? import <nixpkgs> {} }:

pkgs.stdenv.mkDerivation rec {
  name = "ngo-logistics-backend";
  version = "1.0.0";
  
  src = ./.;
  
  buildInputs = with pkgs; [
    nodejs_20
    nodePackages.npm
    nodePackages.yarn
    mongodb
  ];
  
  buildPhase = ''
    if [ -f package.json ]; then
      npm install
    fi
  '';
  
  installPhase = ''
    mkdir -p $out/bin
    mkdir -p $out/lib/backend
    
    # Copy the entire backend to the output
    cp -r . $out/lib/backend/
    
    # Create a startup script
    cat > $out/bin/start-ngo-backend << 'EOF'
    #!/bin/sh
    echo "Starting NGO Logistics Backend..."
    
    # Start MongoDB if not running
    if ! pgrep -x "mongod" > /dev/null; then
      echo "Starting MongoDB..."
      mongod --dbpath ~/mongodb-data/db --fork --logpath ~/mongodb-data/mongodb.log
      sleep 2
    fi
    
    # Navigate to backend directory and start the server
    cd $out/lib/backend
    if [ -f package.json ]; then
      npm start
    else
      echo "Error: package.json not found in $out/lib/backend"
      exit 1
    fi
    EOF
    
    chmod +x $out/bin/start-ngo-backend
    
    # Create a development script
    cat > $out/bin/dev-ngo-backend << 'EOF'
    #!/bin/sh
    echo "Starting NGO Logistics Backend in development mode..."
    cd $out/lib/backend
    if [ -f package.json ]; then
      npm run dev
    else
      echo "Error: package.json not found in $out/lib/backend"
      exit 1
    fi
    EOF
    
    chmod +x $out/bin/dev-ngo-backend
  '';
  
  meta = with pkgs.lib; {
    description = "NGO Logistics Management System Backend";
    license = licenses.mit;
    maintainers = [ maintainers.jim ];
    platforms = platforms.linux;
  };
}

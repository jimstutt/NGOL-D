{ pkgs, ... }:

{
  home.packages = with pkgs; [
    # NGO Logistics Backend Dependencies
    nodejs_20
    mongodb
    nodePackages.nodemon
    nodePackages.pm2
    nodePackages.typescript
    nodePackages.typescript-language-server
  ];
  
  home.sessionVariables = {
    NGOLOGISTICS_PATH = "/home/jim/Dev/NGOLogisticsD";
    NODE_ENV = "development";
  };
  
  programs.bash.shellAliases = {
    ngo-dev = "cd /home/jim/Dev/NGOLogisticsD && ./start-servers.sh";
    ngo-backend = "cd /home/jim/Dev/NGOLogisticsD/Backend && npm run dev";
    ngo-frontend = "cd /home/jim/Dev/NGOLogisticsD/App && npm run dev";
    ngo-mongo-start = "/home/jim/Dev/NGOLogisticsD/Backend/scripts/start-mongodb-nix.sh";
    ngo-mongo-stop = "/home/jim/Dev/NGOLogisticsD/Backend/scripts/stop-mongodb-nix.sh";
    ngo-seed = "cd /home/jim/Dev/NGOLogisticsD/Backend && npm run seed";
    ngo-test = "cd /home/jim/Dev/NGOLogisticsD/Backend && npm test";
  };
}

-- NGOL-D MariaDB init script (run on first start)
-- DB: ngol_dev | User: ngol | Pass: ngol
CREATE DATABASE IF NOT EXISTS ngol_dev;
CREATE USER IF NOT EXISTS 'ngol'@'%' IDENTIFIED BY 'ngol';
GRANT ALL PRIVILEGES ON ngol_dev.* TO 'ngol'@'%';
FLUSH PRIVILEGES;

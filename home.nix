{ config, pkgs, lib, ... }:

{
  home.username = "jim";
  home.homeDirectory = "/home/jim";
  
  # SQLite and development packages - REMOVED sqlite-interactive to avoid conflict
  home.packages = with pkgs; [
    sqlite  # This provides sqlite3 command
    nodejs_20
    git
  ];

  # Shell configuration
  programs.bash = {
    enable = true;
    initExtra = ''
      # SQLite environment variables
      export DATABASE_DIR="/home/jim/persist"
      export DATABASE_PATH="$DATABASE_DIR/ngo_logistics.db"
      
      # Create database directory
      mkdir -p "$DATABASE_DIR"
      
      # SQLite management functions
      sqlite-manage() {
        case "$1" in
          init)
            echo "Initializing NGO Logistics database..."
            mkdir -p "$DATABASE_DIR"
            if [ ! -f "$DATABASE_PATH" ]; then
              # Create the database schema
              sqlite3 "$DATABASE_PATH" "
                CREATE TABLE IF NOT EXISTS organizations (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL,
                  contact_email TEXT,
                  phone TEXT,
                  address TEXT,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS inventory (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  item_name TEXT NOT NULL,
                  category TEXT,
                  quantity INTEGER NOT NULL,
                  unit TEXT,
                  min_stock_level INTEGER,
                  organization_id INTEGER,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (organization_id) REFERENCES organizations (id)
                );
                
                CREATE TABLE IF NOT EXISTS shipments (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  from_organization_id INTEGER,
                  to_organization_id INTEGER,
                  status TEXT DEFAULT 'pending',
                  shipment_date DATETIME,
                  estimated_delivery DATETIME,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (from_organization_id) REFERENCES organizations (id),
                  FOREIGN KEY (to_organization_id) REFERENCES organizations (id)
                );
                
                CREATE TABLE IF NOT EXISTS shipment_items (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  shipment_id INTEGER,
                  inventory_id INTEGER,
                  quantity INTEGER NOT NULL,
                  FOREIGN KEY (shipment_id) REFERENCES shipments (id),
                  FOREIGN KEY (inventory_id) REFERENCES inventory (id)
                );
                
                CREATE TABLE IF NOT EXISTS donations (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  donor_name TEXT NOT NULL,
                  donor_email TEXT,
                  item_name TEXT NOT NULL,
                  quantity INTEGER NOT NULL,
                  unit TEXT,
                  donation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                  status TEXT DEFAULT 'received',
                  organization_id INTEGER,
                  FOREIGN KEY (organization_id) REFERENCES organizations (id)
                );
                
                CREATE TABLE IF NOT EXISTS users (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  username TEXT UNIQUE NOT NULL,
                  email TEXT UNIQUE NOT NULL,
                  password_hash TEXT NOT NULL,
                  role TEXT DEFAULT 'user',
                  organization_id INTEGER,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (organization_id) REFERENCES organizations (id)
                );
              "
              
              # Insert sample data
              sqlite3 "$DATABASE_PATH" "
                INSERT INTO organizations (name, contact_email, phone, address) VALUES 
                  ('Red Cross', 'contact@redcross.org', '+1-555-0101', '123 Main St, City, Country'),
                  ('Food Bank', 'info@foodbank.org', '+1-555-0102', '456 Oak Ave, City, Country');
                  
                INSERT INTO inventory (item_name, category, quantity, unit, min_stock_level, organization_id) VALUES
                  ('Rice', 'Food', 1000, 'kg', 100, 1),
                  ('Blankets', 'Shelter', 500, 'units', 50, 1),
                  ('Medical Kits', 'Medical', 200, 'units', 20, 2),
                  ('Water Bottles', 'Water', 2000, 'units', 200, 2);
                  
                INSERT INTO users (username, email, password_hash, role, organization_id) VALUES
                  ('admin', 'admin@ngologistics.org', 'hashed_password_here', 'admin', 1),
                  ('manager1', 'manager@redcross.org', 'hashed_password_here', 'manager', 1);
              "
              
              echo "✓ Database initialized at $DATABASE_PATH"
              echo "✓ Sample data loaded: 2 organizations, 4 inventory items, 2 users"
            else
              echo "Database already exists at $DATABASE_PATH"
            fi
            ;;
          connect)
            if [ -f "$DATABASE_PATH" ]; then
              sqlite3 "$DATABASE_PATH"
            else
              echo "Database not found. Run 'sqlite-manage init' first."
            fi
            ;;
          backup)
            if [ -f "$DATABASE_PATH" ]; then
              backup_file="$DATABASE_DIR/ngo_logistics_backup_$(date +%Y%m%d_%H%M%S).db"
              cp "$DATABASE_PATH" "$backup_file"
              echo "✓ Database backed up to: $backup_file"
            else
              echo "Database not found. Run 'sqlite-manage init' first."
            fi
            ;;
          reset)
            if [ -f "$DATABASE_PATH" ]; then
              rm "$DATABASE_PATH"
              echo "✓ Database reset. Run 'sqlite-manage init' to recreate."
            else
              echo "Database not found."
            fi
            ;;
          info)
            if [ -f "$DATABASE_PATH" ]; then
              echo "Database Information:"
              echo "Location: $DATABASE_PATH"
              echo "Size: $(du -h "$DATABASE_PATH" | cut -f1)"
              echo ""
              echo "Table row counts:"
              sqlite3 "$DATABASE_PATH" "
                SELECT 'organizations' as table_name, COUNT(*) as row_count FROM organizations
                UNION ALL SELECT 'inventory', COUNT(*) FROM inventory
                UNION ALL SELECT 'shipments', COUNT(*) FROM shipments
                UNION ALL SELECT 'shipment_items', COUNT(*) FROM shipment_items
                UNION ALL SELECT 'donations', COUNT(*) FROM donations
                UNION ALL SELECT 'users', COUNT(*) FROM users;
              "
            else
              echo "Database not found. Run 'sqlite-manage init' first."
            fi
            ;;
          *)
            echo "SQLite Database Management"
            echo "Usage: sqlite-manage {init|connect|backup|reset|info}"
            echo ""
            echo "Commands:"
            echo "  init     - Initialize database with schema and sample data"
            echo "  connect  - Connect to the database with SQLite shell"
            echo "  backup   - Create a backup of the database"
            echo "  reset    - Delete the database (careful!)"
            echo "  info     - Show database information and statistics"
            ;;
        esac
      }

      # Aliases for quick access
      alias sqlite-init='sqlite-manage init'
      alias sqlite-connect='sqlite-manage connect'
      alias sqlite-backup='sqlite-manage backup'
      alias sqlite-info='sqlite-manage info'
      
      echo "SQLite environment loaded. Use 'sqlite-manage' to manage the database."
    '';
  };

  # Create database directory on activation
  home.activation.setupDatabaseDir = lib.hm.dag.entryAfter ["writeBoundary"] ''
    echo "Setting up database directory..."
    mkdir -p /home/jim/persist
    chmod 755 /home/jim/persist
    echo "✓ Database directory ready at /home/jim/persist"
  '';

  home.stateVersion = "23.11";
}

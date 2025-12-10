# NGO Logistics Database Schema

## Tables

### Organizations
- `id` - Primary key
- `name` - Organization name
- `contact_email` - Contact email
- `phone` - Phone number
- `address` - Physical address
- `created_at` - Timestamp

### Inventory
- `id` - Primary key
- `item_name` - Name of the item
- `category` - Item category (Food, Shelter, Medical, etc.)
- `quantity` - Current stock quantity
- `unit` - Measurement unit (kg, units, liters, etc.)
- `min_stock_level` - Minimum stock level for alerts
- `organization_id` - Foreign key to organizations
- `created_at`, `updated_at` - Timestamps

### Shipments
- `id` - Primary key
- `from_organization_id` - Sender organization
- `to_organization_id` - Receiver organization
- `status` - Shipment status (pending, in-transit, delivered)
- `shipment_date` - When shipment was sent
- `estimated_delivery` - Expected delivery date
- `created_at` - Timestamp

### Shipment Items
- `id` - Primary key
- `shipment_id` - Foreign key to shipments
- `inventory_id` - Foreign key to inventory
- `quantity` - Quantity shipped

### Donations
- `id` - Primary key
- `donor_name` - Donor's name
- `donor_email` - Donor's email
- `item_name` - Donated item name
- `quantity` - Donated quantity
- `unit` - Measurement unit
- `donation_date` - When donation was received
- `status` - Donation status
- `organization_id` - Receiving organization

### Users
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email
- `password_hash` - Hashed password
- `role` - User role (admin, manager, user)
- `organization_id` - Associated organization
- `created_at` - Timestamp

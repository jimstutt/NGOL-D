#!/bin/bash
# /home/jim/Dev/NGOLogisticsD/scripts/insert-modals.sh
set -euo pipefail

VIEWS_DIR="/home/jim/Dev/NGOLogisticsD/App/src/views"

# Fix ShipmentsInventory.vue
sed -i '/<script>/a import ShipmentModal from '\''@\/components\/ShipmentModal.vue'\'';\nimport InventoryModal from '\''@\/components\/InventoryModal.vue'\'';\nimport ConfirmModal from '\''@\/components\/ConfirmModal.vue'\'';' "$VIEWS_DIR/ShipmentsInventory.vue"
sed -i '/components: {/a     ShipmentModal,\n    InventoryModal,\n    ConfirmModal,' "$VIEWS_DIR/ShipmentsInventory.vue"

# Fix Admin.vue
sed -i '/<script>/a import UserModal from '\''@\/components\/UserModal.vue'\'';\nimport WarehouseModal from '\''@\/components\/WarehouseModal.vue'\'';\nimport TransportModal from '\''@\/components\/TransportModal.vue'\'';\nimport ConfirmModal from '\''@\/components\/ConfirmModal.vue'\'';' "$VIEWS_DIR/Admin.vue"
sed -i '/components: {/a     UserModal,\n    WarehouseModal,\n    TransportModal,\n    ConfirmModal,' "$VIEWS_DIR/Admin.vue"

# Fix Dashboard.vue (for map interactions)
sed -i '/<script>/a import ConfirmModal from '\''@\/components\/ConfirmModal.vue'\'';' "$VIEWS_DIR/Dashboard.vue"
sed -i '/components: {/a     ConfirmModal,' "$VIEWS_DIR/Dashboard.vue"

# Add modal usage templates (minimal placeholders)
cat >> "$VIEWS_DIR/ShipmentsInventory.vue" <<'EOF'

          <!-- Modals -->
          <ShipmentModal 
            v-if="showShipmentModal" 
            :mode="modalMode" 
            :shipment="editingShipment"
            @save="saveShipment"
            @close="closeShipmentModal"
          />
          <InventoryModal 
            v-if="showInventoryModal" 
            :mode="modalMode" 
            :inventory="editingInventory"
            @save="saveInventory"
            @close="closeInventoryModal"
          />
          <ConfirmModal 
            v-if="showConfirmModal"
            :title="confirmTitle"
            :message="confirmMessage"
            @confirm="confirmAction"
            @cancel="cancelConfirm"
          />
EOF

echo "✅ Modals inserted into views."
echo "➡️ Next: Verify modal usage in <template> sections"

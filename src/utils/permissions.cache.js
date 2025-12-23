const { logger } = require('./logger');

class PermissionsCache {
    constructor() {
        this.cache = new Map();
        // Optional: Simple cleanup interval to prevent memory leaks if many unique combinations exist
        // Not strictly required by prompt but good practice.
        // For now, I'll stick to simple Map per requirements "Keep TTL optional".
    }

    /**
     * Generate a deterministic cache key
     * @param {string|number} tenantId 
     * @param {string[]} roles 
     */
    generateKey(tenantId, roles) {
        const sortedRoles = (roles || []).slice().sort().join(',');
        return `permissions:${tenantId}:${sortedRoles}`;
    }

    get(key) {
        return this.cache.get(key);
    }

    set(key, value) {
        this.cache.set(key, value);
    }

    invalidateByTenant(tenantId) {
        const prefix = `permissions:${tenantId}:`;
        let count = 0;
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                this.cache.delete(key);
                count++;
            }
        }
        if (count > 0) {
            logger.info(`🧹 Cache: Invalidated ${count} permission keys for tenant ${tenantId}`);
        }
    }

    clear() {
        this.cache.clear();
    }
}

module.exports = new PermissionsCache();

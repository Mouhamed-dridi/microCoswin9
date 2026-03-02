/**
 * Mobile App Authentication "Database"
 * This file handles user data and password management for the mobile app.
 */

const MobileAuth = {
    // This will be populated from maintenanceTeam.json
    users: [],

    /**
     * Initialize the user database with generated passwords
     */
    async init() {
        try {
            const response = await fetch('../databases/maintenanceTeam.json');
            const data = await response.json();

            this.users = data.map(user => {
                const u = {
                    name: user.name,
                    staffId: user.id,
                    password: this.generatePassword(user.id),
                    profileImage: 'https://i.pravatar.cc/150?u=' + user.id // Default
                };

                // Specific image for Bilel
                if (user.name.toLowerCase().includes('bilel')) {
                    u.profileImage = 'assets/user-image.png';
                }

                return u;
            });

            console.log('Mobile Auth Database Initialized');
            // For development: log the credentials so the user knows what they are
            console.table(this.users);

            return this.users;
        } catch (error) {
            console.error('Failed to initialize mobile auth:', error);
            return [];
        }
    },

    /**
     * Generates a 6-character alphanumeric password
     * For demonstration, it derives it from the user's unique ID
     */
    generatePassword(id) {
        // Simple deterministic generator for demo purposes
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let pass = '';
        let seed = parseInt(id.substring(id.length - 6)) || 123456;

        for (let i = 0; i < 6; i++) {
            seed = (seed * 9301 + 49297) % 233280;
            pass += chars[Math.floor((seed / 233280) * chars.length)];
        }
        return pass;
    },

    /**
     * Validate credentials
     */
    async login(username, password) {
        if (this.users.length === 0) await this.init();

        // DEV BYPASS: Allow 'team' / 'team123' for easy testing
        if (username.toLowerCase() === 'team' && password === 'team123') {
            console.log('Dev Login Successful');
            // Return the first user by default so the dashboard has data
            return this.users[0];
        }

        return this.users.find(u =>
            (u.name.toLowerCase() === username.toLowerCase() || u.staffId === username) &&
            u.password === password
        );
    }
};

// Export for use in auth.js
// If using modules
// export default MobileAuth;



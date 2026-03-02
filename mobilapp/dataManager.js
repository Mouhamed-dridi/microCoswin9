/**
 * Data Manager for Mobile App
 * Handles fetching and filtering tickets, machines, and team data.
 */

const DataManager = {
    /**
     * Fetch all data needed for the dashboard
     */
    async getDashboardData(userId) {
        try {
            const [ticketsRes, machinesRes] = await Promise.all([
                fetch('../databases/maintenanceRequests.json'),
                fetch('../databases/machines.json')
            ]);

            const tickets = await ticketsRes.json();
            const machinesRaw = await machinesRes.json();

            // Flatten machine data (handling the nested array in machines.json)
            const machines = machinesRaw.flat().filter(m => m && m.id);

            // Filter tickets assigned to this user (or show all if userId is null/undefined)
            const filteredTickets = userId
                ? tickets.filter(ticket => ticket.assignedTechnicians && ticket.assignedTechnicians.includes(userId))
                : tickets;

            // Enrich tickets with machine information
            const enrichedTickets = filteredTickets.map(ticket => {
                const machine = machines.find(m => m.id === ticket.machineId);
                return {
                    ...ticket,
                    machine: machine || { nameOrCode: 'Unknown Machine', type: 'General' }
                };
            });

            return enrichedTickets;
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            return [];
        }
    },

    /**
     * Get user profile info
     */
    getUserProfile() {
        const user = sessionStorage.getItem('mobileUser');
        return user ? JSON.parse(user) : null;
    },

    /**
     * Update user profile in session
     */
    updateUserProfile(updatedData) {
        const user = this.getUserProfile();
        if (user) {
            const newUser = { ...user, ...updatedData };
            sessionStorage.setItem('mobileUser', JSON.stringify(newUser));
            return newUser;
        }
        return null;
    }
};

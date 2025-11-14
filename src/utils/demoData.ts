/**
 * Demo data utilities for Maasin Go! Real-time Commute Tracker
 * These functions help populate the app with sample data for demonstration purposes
 */

export const demoRoutes = [
  'Poblacion to Combado',
  'Terminal to Maasin City College',
  'Public Market to City Hall',
  'Ibarra to Poblacion',
  'Guadalupe to Terminal',
  'Poblacion to Bato',
  'Maasin to Macrohon',
  'Terminal to Guadalupe',
  'City Hall to Terminal',
  'Maasin City College to Public Market',
];

export const demoVehicleTypes = ['tricycle', 'multicab'] as const;

export const demoCapacities = [
  'Full',
  '1 seat available',
  '2 seats available',
  '3 seats available',
  'Plenty of space',
];

export const demoDriverNames = [
  'Juan Dela Cruz',
  'Maria Santos',
  'Pedro Reyes',
  'Rosa Garcia',
  'Jose Mendoza',
  'Ana Rodriguez',
  'Carlos Fernandez',
  'Lisa Martinez',
];

/**
 * Generate a random demo driver for testing
 */
export function generateDemoDriver() {
  const randomName = demoDriverNames[Math.floor(Math.random() * demoDriverNames.length)];
  const randomRoute = demoRoutes[Math.floor(Math.random() * demoRoutes.length)];
  const randomVehicleType = demoVehicleTypes[Math.floor(Math.random() * demoVehicleTypes.length)];
  const randomCapacity = demoCapacities[Math.floor(Math.random() * demoCapacities.length)];
  const status = Math.random() > 0.3 ? 'available' : 'occupied';
  
  // Generate random coordinates around Maasin City (10.1328, 124.8422)
  const baseLat = 10.1328;
  const baseLon = 124.8422;
  const randomLat = baseLat + (Math.random() - 0.5) * 0.05; // ~2.5km radius
  const randomLon = baseLon + (Math.random() - 0.5) * 0.05;
  
  return {
    userId: `demo_${Math.random().toString(36).substr(2, 9)}`,
    name: randomName,
    status,
    route: randomRoute,
    capacity: randomCapacity,
    location: {
      latitude: randomLat,
      longitude: randomLon,
    },
    vehicleType: randomVehicleType,
    plateNumber: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(1000 + Math.random() * 9000)}`,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Generate multiple demo drivers
 */
export function generateMultipleDemoDrivers(count: number = 10) {
  return Array.from({ length: count }, () => generateDemoDriver());
}

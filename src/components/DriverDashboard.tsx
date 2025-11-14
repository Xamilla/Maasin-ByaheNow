import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Car, MapPin, Users, Navigation, Power, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { createClient } from '@supabase/supabase-js';

interface DriverDashboardProps {
  user: any;
  onNavigate: (page: string) => void;
}

export function DriverDashboard({ user, onNavigate }: DriverDashboardProps) {
  const [status, setStatus] = useState<'available' | 'occupied' | 'offline'>('offline');
  const [route, setRoute] = useState('');
  const [capacity, setCapacity] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<'tricycle' | 'multicab'>('tricycle');
  const [location, setLocation] = useState({ latitude: 10.1328, longitude: 124.8422 }); // Default Maasin City coordinates

  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey
  );

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }

    // Fetch user profile
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-48e0b4cd/profile`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok && data.profile) {
        setPlateNumber(data.profile.plateNumber || '');
        setVehicleType(data.profile.vehicleType || 'tricycle');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const updateDriverStatus = async () => {
    setIsUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please login again');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-48e0b4cd/driver/update`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            status,
            route,
            capacity,
            latitude: location.latitude,
            longitude: location.longitude,
            vehicleType,
            plateNumber,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert('Status updated successfully!');
      } else {
        throw new Error(data.error || 'Update failed');
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert(`Failed to update status: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'occupied': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
    }
  };

  const commonRoutes = [
    'Poblacion to Combado',
    'Terminal to Maasin City College',
    'Public Market to City Hall',
    'Ibarra to Poblacion',
    'Guadalupe to Terminal',
    'Poblacion to Bato',
    'Maasin to Macrohon',
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-1">Driver Dashboard</h1>
              <p className="text-blue-100 text-sm">Manage your availability and route</p>
            </div>
            <div className={`w-4 h-4 rounded-full ${getStatusColor()} animate-pulse`}></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Status Toggle Card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
            <CardDescription>Update your availability for passengers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStatus('available')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  status === 'available'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CheckCircle className={`w-6 h-6 mx-auto mb-2 ${
                  status === 'available' ? 'text-green-600' : 'text-gray-400'
                }`} />
                <div className="text-sm">Available</div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStatus('occupied')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  status === 'occupied'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Users className={`w-6 h-6 mx-auto mb-2 ${
                  status === 'occupied' ? 'text-yellow-600' : 'text-gray-400'
                }`} />
                <div className="text-sm">Occupied</div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStatus('offline')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  status === 'offline'
                    ? 'border-gray-500 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Power className={`w-6 h-6 mx-auto mb-2 ${
                  status === 'offline' ? 'text-gray-600' : 'text-gray-400'
                }`} />
                <div className="text-sm">Offline</div>
              </motion.button>
            </div>
          </CardContent>
        </Card>

        {/* Route Information */}
        <Card>
          <CardHeader>
            <CardTitle>Route Information</CardTitle>
            <CardDescription>Let passengers know where you're heading</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="route">Current Route</Label>
              <Input
                id="route"
                placeholder="e.g., Poblacion to Combado"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                list="routes"
              />
              <datalist id="routes">
                {commonRoutes.map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Seat Capacity</Label>
              <select
                id="capacity"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select capacity</option>
                <option value="Full">Full</option>
                <option value="1 seat available">1 seat available</option>
                <option value="2 seats available">2 seats available</option>
                <option value="3 seats available">3 seats available</option>
                <option value="Plenty of space">Plenty of space</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Information */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Vehicle Type:</span>
              <Badge className="capitalize">{vehicleType}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Plate Number:</span>
              <Badge variant="outline">{plateNumber || 'Not set'}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="text-sm text-gray-500">
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Update Button */}
        <Button
          onClick={updateDriverStatus}
          disabled={isUpdating}
          className="w-full"
          size="lg"
        >
          <Navigation className="w-5 h-5 mr-2" />
          {isUpdating ? 'Updating...' : 'Update Status & Broadcast'}
        </Button>

        <div className="text-center text-sm text-gray-500">
          Your location and status will be visible to passengers
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-around">
          <Button variant="ghost" onClick={() => onNavigate('driver')}>
            <Car className="w-5 h-5 mr-2" />
            Dashboard
          </Button>
          <Button variant="ghost" onClick={() => onNavigate('fare')}>
            <Navigation className="w-5 h-5 mr-2" />
            Fare Guide
          </Button>
          <Button variant="ghost" onClick={() => onNavigate('profile')}>
            <Users className="w-5 h-5 mr-2" />
            Profile
          </Button>
        </div>
      </div>
    </div>
  );
}

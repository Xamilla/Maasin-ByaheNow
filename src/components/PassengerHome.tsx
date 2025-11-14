import { useState, useEffect } from 'react';
import { MapPin, Car, Users, Navigation, Filter, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Driver {
  userId: string;
  name: string;
  status: 'available' | 'occupied' | 'offline';
  route: string;
  capacity: string;
  location: { latitude: number; longitude: number };
  vehicleType: 'tricycle' | 'multicab';
  plateNumber: string;
  lastUpdated: string;
}

interface PassengerHomeProps {
  onNavigate: (page: string) => void;
}

export function PassengerHome({ onNavigate }: PassengerHomeProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-48e0b4cd/drivers`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      
      if (response.ok && data.drivers) {
        const activeDrivers = data.drivers.filter((d: Driver) => 
          d.status !== 'offline' && d.status
        );
        setDrivers(activeDrivers);
        setFilteredDrivers(activeDrivers);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
    const interval = setInterval(fetchDrivers, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedVehicleType === 'all') {
      setFilteredDrivers(drivers);
    } else {
      setFilteredDrivers(drivers.filter(d => d.vehicleType === selectedVehicleType));
    }
  }, [selectedVehicleType, drivers]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'occupied': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "outline" => {
    switch (status) {
      case 'available': return 'default';
      case 'occupied': return 'secondary';
      default: return 'outline';
    }
  };

  const getVehicleIcon = (type: string) => {
    return <Car className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="mb-2">Find a Ride</h1>
          <p className="text-blue-100">Real-time vehicle availability in Maasin City</p>
        </div>
      </div>

      {/* Map View */}
      <div className="relative h-64 bg-gray-200">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125660.34705221749!2d124.76892023784485!3d10.189925001946598!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3307479105f890c9%3A0xd714e890a556846f!2sMaasin%2C%20Southern%20Leyte!5e0!3m2!1sen!2sph!4v1761632893893!5m2!1sen!2sph" 
          className="absolute inset-0 w-full h-full"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
        />
        
        {/* Refresh Button */}
        <Button
          onClick={fetchDrivers}
          disabled={isLoading}
          className="absolute top-4 right-4 shadow-lg"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto">
          {['all', 'tricycle', 'multicab'].map((type) => (
            <Button
              key={type}
              variant={selectedVehicleType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedVehicleType(type)}
              className="whitespace-nowrap"
            >
              <Filter className="w-4 h-4 mr-2" />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Vehicle List */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-gray-900">Available Vehicles</h2>
          <span className="text-sm text-gray-500">{filteredDrivers.length} found</span>
        </div>

        {filteredDrivers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No vehicles available at the moment</p>
              <p className="text-sm text-gray-500 mt-2">Try refreshing or check back soon</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredDrivers.map((driver) => (
              <Card key={driver.userId} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Vehicle Icon */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full ${getStatusColor(driver.status)} bg-opacity-10 flex items-center justify-center relative`}>
                        {getVehicleIcon(driver.vehicleType)}
                        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${getStatusColor(driver.status)} border-2 border-white`}></div>
                      </div>
                    </div>

                    {/* Driver Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-gray-900">{driver.name}</h3>
                        <Badge variant={getStatusBadgeVariant(driver.status)}>
                          {driver.status}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {driver.vehicleType}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1 text-gray-600 mb-1">
                        <Navigation className="w-4 h-4" />
                        <span className="text-sm">{driver.route || 'No route specified'}</span>
                      </div>

                      <div className="flex items-center gap-1 text-gray-600 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{driver.capacity || 'Capacity not specified'}</span>
                      </div>

                      <div className="text-xs text-gray-500">
                        Plate: {driver.plateNumber} • Updated {new Date(driver.lastUpdated).toLocaleTimeString()}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0">
                      <Button size="sm" onClick={() => onNavigate('feedback')}>
                        Rate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-around">
          <Button variant="ghost" onClick={() => onNavigate('passenger')}>
            <MapPin className="w-5 h-5 mr-2" />
            Home
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

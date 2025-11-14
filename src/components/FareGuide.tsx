import { useState, useEffect } from 'react';
import { Navigation, MapPin, DollarSign, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface FareRoute {
  route: string;
  fare: string;
  distance: string;
}

interface FareData {
  tricycle: FareRoute[];
  multicab: FareRoute[];
}

interface FareGuideProps {
  onNavigate: (page: string) => void;
  userRole?: string;
}

export function FareGuide({ onNavigate, userRole }: FareGuideProps) {
  const [fares, setFares] = useState<FareData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFares();
  }, []);

  const fetchFares = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-48e0b4cd/fares`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setFares(data.fares);
      }
    } catch (error) {
      console.error('Error fetching fares:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getVehicleIcon = (type: string) => {
    return <Navigation className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => onNavigate(userRole === 'driver' ? 'driver' : 'passenger')}
            className="text-white hover:bg-blue-700 mb-2"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="mb-2">Fare Guide</h1>
          <p className="text-blue-100">Standard fares for common routes in Maasin City</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-gray-600">Loading fare information...</p>
            </CardContent>
          </Card>
        ) : fares ? (
          <>
            {/* Info Card */}
            <Card className="mb-4 bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700">
                      Fares are estimates and may vary based on exact distance, time of day, and vehicle condition.
                      Always confirm with the driver before starting your trip.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fare Tables */}
            <Tabs defaultValue="tricycle" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tricycle">Tricycle</TabsTrigger>
                <TabsTrigger value="multicab">Multicab</TabsTrigger>
              </TabsList>

              <TabsContent value="tricycle" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getVehicleIcon('tricycle')}
                      Tricycle Fares
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {fares.tricycle.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-900">{item.route}</span>
                            </div>
                            <span className="text-xs text-gray-500">{item.distance}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-blue-600">₱{item.fare}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="multicab" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getVehicleIcon('multicab')}
                      Multicab Fares
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {fares.multicab.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-900">{item.route}</span>
                            </div>
                            <span className="text-xs text-gray-500">{item.distance}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-blue-600">₱{item.fare}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Additional Info */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Fare Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Base fare for tricycles typically starts at ₱10 for short distances</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Multicabs have fixed routes with standard pricing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Late night trips (after 10 PM) may have additional charges</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Always ask for the fare before starting your journey</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">Failed to load fare information</p>
              <Button onClick={fetchFares} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

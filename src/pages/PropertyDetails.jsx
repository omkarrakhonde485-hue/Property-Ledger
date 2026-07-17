import api from '@/api/client';

import { useQuery } from '@tanstack/react-query';

import { useI18n } from '@/lib/i18n';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MapPin, DoorOpen, BedDouble, Users, IndianRupee } from 'lucide-react';
import FloorManager from '@/components/properties/FloorManager';
import RoomManager from '@/components/properties/RoomManager';

export default function PropertyDetails() {
  const { t } = useI18n();
  const propId = new URLSearchParams(window.location.search).get('id') || window.location.pathname.split('/').pop();

  const { data: property } = useQuery({
    queryKey: ['property', propId],
    queryFn: () => api.get('/properties/' + propId),
    enabled: !!propId,
  });

  const { data: floors = [] } = useQuery({
    queryKey: ['floors', propId],
    queryFn: () => api.get('/floors?property_id=' + propId),
    enabled: !!propId,
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms', propId],
    queryFn: () => api.get('/rooms?property_id=' + propId),
    enabled: !!propId,
  });

  const { data: beds = [] } = useQuery({
    queryKey: ['beds'],
    queryFn: () => api.get('/beds'),
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants', propId],
    queryFn: () => api.get('/tenants?property_id=' + propId),
    enabled: !!propId,
  });

  if (!property) return <div className="flex justify-center py-20 text-muted-foreground">{t('loading')}</div>;

  const roomIds = rooms.map(r => r.id);
  const propBeds = beds.filter(b => roomIds.includes(b.room_id));
  const activeTenants = tenants.filter(t => t.status === 'Active');
  const expectedRent = activeTenants.reduce((s, t) => s + (t.monthly_rent || 0), 0);

  const stats = [
    { icon: DoorOpen, label: t('rooms'), value: rooms.length },
    { icon: BedDouble, label: t('beds'), value: propBeds.length },
    { icon: Users, label: t('activeTenants'), value: activeTenants.length },
    { icon: IndianRupee, label: t('expectedRent'), value: `₹${expectedRent.toLocaleString('en-IN')}` },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <Link to="/properties">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h2 className="text-2xl font-heading font-bold">{property.name}</h2>
          {property.address && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />{property.address}{property.city ? `, ${property.city}` : ''}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-bold">{value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="floors" className="space-y-4">
        <TabsList className="bg-muted/60">
          <TabsTrigger value="floors">{t('floors')}</TabsTrigger>
          <TabsTrigger value="rooms">{t('rooms')}</TabsTrigger>
          <TabsTrigger value="tenants">{t('tenants')}</TabsTrigger>
        </TabsList>

        <TabsContent value="floors">
          <FloorManager propertyId={propId} floors={floors} rooms={rooms} />
        </TabsContent>

        <TabsContent value="rooms">
          <RoomManager propertyId={propId} floors={floors} rooms={rooms} beds={propBeds} />
        </TabsContent>

        <TabsContent value="tenants">
          <div className="space-y-2">
            {activeTenants.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">{t('noData')}</div>
            ) : activeTenants.map(tenant => (
              <Link key={tenant.id} to={`/tenants/${tenant.id}`}>
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{tenant.full_name}</p>
                      <p className="text-xs text-muted-foreground">{tenant.mobile_number}</p>
                    </div>
                    <p className="font-semibold">₹{(tenant.monthly_rent || 0).toLocaleString('en-IN')}/mo</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Nurse {
  assignment_id: number;
  nurse_id: number;
  nurse_name: string;
  nurse_department: string;
  assigned_department: 'opd' | 'ward';
}

const AssignedNursesPage = () => {
  const [opdNurses, setOpdNurses] = useState<Nurse[]>([]);
  const [wardNurses, setWardNurses] = useState<Nurse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNurses = async () => {
      try {
        const response = await fetch('/api/doctor/nurses');
        if (response.ok) {
          const nurses: Nurse[] = await response.json();
          setOpdNurses(nurses.filter(n => n.assigned_department.toLowerCase() === 'opd'));
          setWardNurses(nurses.filter(n => n.assigned_department.toLowerCase() === 'ward'));
        } else {
          console.error('Failed to fetch nurses');
        }
      } catch (error) {
        console.error('Error fetching nurses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNurses();
  }, []);

  const renderNurseList = (nurses: Nurse[], title: string) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{title}</span>
          <Badge variant="secondary">{nurses.length} nurses</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {nurses.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No {title.toLowerCase()} assigned</p>
          </div>
        ) : (
          <div className="space-y-4">
            {nurses.map(nurse => (
              <div key={nurse.assignment_id} className="flex items-center p-2 rounded-md hover:bg-gray-100">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{nurse.nurse_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">{nurse.nurse_name}</p>
                  <p className="text-sm text-muted-foreground">{nurse.nurse_department}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Available Nurses</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {renderNurseList(opdNurses, 'OPD Nurses')}
        {renderNurseList(wardNurses, 'Ward Nurses')}
      </div>
    </div>
  );
};

export default AssignedNursesPage;

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/database.types';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { showError } from '@/utils/toast';

type AdminUserView = Pick<User, 'id' | 'full_name' | 'email' | 'credits_remaining' | 'last_seen_at'>;

const AdminDashboard = () => {
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, full_name, email, credits_remaining, last_seen_at')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUsers(data || []);
      } catch (error: any) {
        showError('Failed to fetch users.');
        console.error('Error fetching users:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold self-start sm:self-center">Admin Dashboard</h1>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search users..."
            className="w-full bg-transparent border-white/20 pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <Card className="glass-effect border-white/10 text-white">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Credits</TableHead>
                <TableHead>Last Seen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-white/5">
                    <TableCell className="font-medium">
                      <Link to={`/admin/user/${user.id}`} className="hover:text-cyan-400">
                        {user.full_name || 'N/A'}
                      </Link>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="text-center">{user.credits_remaining}</TableCell>
                    <TableCell>
                      {user.last_seen_at ? new Date(user.last_seen_at).toLocaleString() : 'Never'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
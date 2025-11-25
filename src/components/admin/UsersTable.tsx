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
import { useTranslation } from 'react-i18next';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type AdminUserView = Pick<User, 'id' | 'full_name' | 'email' | 'credits_remaining' | 'plan_type'>;

const planVariants: { [key: string]: "default" | "secondary" | "outline" | "destructive" } = {
  free: 'secondary',
  basic: 'default',
  standard: 'default',
  premium: 'default',
};

const planStyles: { [key: string]: string } = {
    basic: 'bg-green-500/20 border-green-500 text-green-200',    
    standard: 'bg-blue-500/20 border-blue-500 text-blue-200',  
    premium: 'bg-purple-500/20 border-purple-500 text-purple-200',
}

const UsersTable = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, full_name, email, credits_remaining, plan_type')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUsers(data || []);
      } catch (error: any) {
        showError('toasts.admin.fetchUsersFailed');
        console.error('Error fetching users:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === 'all' || user.plan_type === planFilter;
    return matchesSearch && matchesPlan;
  });

  return (
    <Card className="glass-effect border-border text-card-foreground">
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <CardTitle>{t('admin.dashboard.allUsers')}</CardTitle>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-transparent border-border text-foreground"> {/* Adicionado text-foreground aqui */}
              <SelectValue placeholder={t('admin.dashboard.filterByPlan')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.dashboard.allPlans')}</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('admin.dashboard.search')}
              className="w-full bg-transparent border-border pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.dashboard.fullName')}</TableHead>
              <TableHead>{t('admin.dashboard.email')}</TableHead>
              <TableHead className="text-center">{t('admin.dashboard.plan')}</TableHead>
              <TableHead className="text-center">{t('admin.dashboard.credits')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-accent">
                  <TableCell className="font-medium">
                    <Link to={`/admin/user/${user.id}`} className="hover:text-cyan-400">
                      {user.full_name || t('admin.dashboard.notApplicable')}
                    </Link>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={planVariants[user.plan_type || 'free']}
                      className={planStyles[user.plan_type || '']}
                    >
                      {user.plan_type || 'free'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{user.credits_remaining}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  {t('admin.dashboard.noUsersFound')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UsersTable;
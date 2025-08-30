'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Package, 
  AlertTriangle, 
  DollarSign,
  Calendar,
  Download,
  RefreshCw,
  FileText,
  PieChart as PieChartIcon,
  BarChart3,
  Users,
  Pill
} from 'lucide-react';
import { toast } from 'sonner';

interface ReportData {
  overview?: any;
  prescriptions?: any;
  dispensing?: any;
  inventory?: any;
  financial?: any;
  alerts?: any;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [reportData, setReportData] = useState<ReportData>({});
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchReportData(activeTab);
  }, [activeTab, dateRange, period]);

  const fetchReportData = async (reportType: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: reportType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        period: period
      });

      const response = await fetch(`/api/pharmacy/reports?${params}`);
      const data = await response.json();

      if (data.success) {
        setReportData(prev => ({
          ...prev,
          [reportType]: data.data
        }));
      } else {
        toast.error(`Failed to fetch ${reportType} report`);
      }
    } catch (error) {
      console.error(`Error fetching ${reportType} report:`, error);
      toast.error(`Error loading ${reportType} report`);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (reportType: string) => {
    // Implementation for exporting reports
    toast.success(`Exporting ${reportType} report...`);
  };

  const StatCard = ({ title, value, change, icon: Icon, color = "blue" }: any) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
            {change && (
              <div className="flex items-center mt-1">
                {change > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(change)}%
                </span>
              </div>
            )}
          </div>
          <Icon className={`w-8 h-8 text-${color}-600`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pharmacy Reports</h1>
          <p className="text-gray-600 mt-1">Analytics and insights for pharmacy operations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchReportData(activeTab)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => exportReport(activeTab)}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex gap-4">
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="year">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="dispensing">Dispensing</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {reportData.overview && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                  title="Total Prescriptions"
                  value={reportData.overview.prescription_statistics?.total_prescriptions || 0}
                  icon={FileText}
                  color="blue"
                />
                <StatCard
                  title="Total Revenue"
                  value={`₹${reportData.overview.dispensing_statistics?.total_dispensed_value || '0.00'}`}
                  icon={DollarSign}
                  color="green"
                />
                <StatCard
                  title="Medicines Dispensed"
                  value={reportData.overview.dispensing_statistics?.total_dispensed || 0}
                  icon={Pill}
                  color="purple"
                />
                <StatCard
                  title="Stock Value"
                  value={`₹${reportData.overview.stock_statistics?.total_stock_value || '0.00'}`}
                  icon={Package}
                  color="orange"
                />
              </div>

              {/* Top Dispensed Medicines */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Dispensed Medicines</CardTitle>
                  <CardDescription>Most frequently dispensed medications</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicine</TableHead>
                        <TableHead>Total Dispensed</TableHead>
                        <TableHead>Total Value</TableHead>
                        <TableHead>Prescriptions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.overview.top_dispensed_medicines?.slice(0, 10).map((medicine: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{medicine.medicine_name}</p>
                              <p className="text-sm text-gray-500">{medicine.generic_name}</p>
                            </div>
                          </TableCell>
                          <TableCell>{medicine.total_dispensed}</TableCell>
                          <TableCell>₹{medicine.total_value}</TableCell>
                          <TableCell>{medicine.prescription_count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions" className="space-y-6">
          {reportData.prescriptions && (
            <>
              {/* Prescription Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                  title="Total Prescriptions"
                  value={reportData.prescriptions.summary?.total_prescriptions || 0}
                  icon={FileText}
                  color="blue"
                />
                <StatCard
                  title="Total Value"
                  value={`₹${reportData.prescriptions.summary?.total_value || '0.00'}`}
                  icon={DollarSign}
                  color="green"
                />
                <StatCard
                  title="Unique Patients"
                  value={reportData.prescriptions.summary?.unique_patients || 0}
                  icon={Users}
                  color="purple"
                />
                <StatCard
                  title="Average Value"
                  value={`₹${reportData.prescriptions.summary?.average_value || '0.00'}`}
                  icon={TrendingUp}
                  color="orange"
                />
              </div>

              {/* Prescriptions List */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Prescriptions</CardTitle>
                  <CardDescription>Detailed prescription report</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Prescription ID</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.prescriptions.prescriptions?.slice(0, 20).map((prescription: any) => (
                        <TableRow key={prescription.prescription_id}>
                          <TableCell className="font-medium">{prescription.prescription_id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{prescription.patient_name}</p>
                              <p className="text-sm text-gray-500">{prescription.patient_code}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{prescription.doctor_name}</p>
                              <p className="text-sm text-gray-500">{prescription.specialization}</p>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(prescription.prescription_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge className={
                              prescription.dispensing_status === 'fully_dispensed' ? 'bg-green-100 text-green-800' :
                              prescription.dispensing_status === 'partially_dispensed' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {prescription.dispensing_status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>₹{prescription.total_amount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Dispensing Tab */}
        <TabsContent value="dispensing" className="space-y-6">
          {reportData.dispensing && (
            <>
              {/* Dispensing Records */}
              <Card>
                <CardHeader>
                  <CardTitle>Dispensing Records</CardTitle>
                  <CardDescription>Recent medication dispensing activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Prescription</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Medicine</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Pharmacist</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.dispensing.dispensing_records?.slice(0, 20).map((record: any) => (
                        <TableRow key={record.log_id}>
                          <TableCell>{new Date(record.dispensed_at).toLocaleDateString()}</TableCell>
                          <TableCell className="font-medium">{record.prescription_id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{record.patient_name}</p>
                              <p className="text-sm text-gray-500">{record.patient_code}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{record.medicine_name}</p>
                              <p className="text-sm text-gray-500">{record.strength} {record.dosage_form}</p>
                            </div>
                          </TableCell>
                          <TableCell>{record.quantity}</TableCell>
                          <TableCell>{record.pharmacist_name}</TableCell>
                          <TableCell>₹{record.total_amount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Pharmacist Performance */}
              {reportData.dispensing.pharmacist_summary && (
                <Card>
                  <CardHeader>
                    <CardTitle>Pharmacist Performance</CardTitle>
                    <CardDescription>Dispensing activity by pharmacist</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pharmacist</TableHead>
                          <TableHead>Total Dispensings</TableHead>
                          <TableHead>Total Quantity</TableHead>
                          <TableHead>Total Value</TableHead>
                          <TableHead>Unique Prescriptions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.dispensing.pharmacist_summary.map((pharmacist: any) => (
                          <TableRow key={pharmacist.pharmacist_name}>
                            <TableCell className="font-medium">{pharmacist.pharmacist_name}</TableCell>
                            <TableCell>{pharmacist.total_dispensings}</TableCell>
                            <TableCell>{pharmacist.total_quantity}</TableCell>
                            <TableCell>₹{pharmacist.total_value}</TableCell>
                            <TableCell>{pharmacist.unique_prescriptions}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          {reportData.inventory && (
            <>
              {/* Inventory Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                  title="Total Medicines"
                  value={reportData.inventory.summary?.total_medicines || 0}
                  icon={Package}
                  color="blue"
                />
                <StatCard
                  title="Stock Value"
                  value={`₹${Number(reportData.inventory.summary?.total_stock_value || 0).toFixed(2)}`}
                  icon={DollarSign}
                  color="green"
                />
                <StatCard
                  title="Low Stock Items"
                  value={reportData.inventory.summary?.low_stock_count || 0}
                  icon={AlertTriangle}
                  color="red"
                />
                <StatCard
                  title="Expired Items"
                  value={reportData.inventory.summary?.expired_count || 0}
                  icon={AlertTriangle}
                  color="orange"
                />
              </div>

              {/* Stock Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Stock Status</CardTitle>
                  <CardDescription>Overview of medicine inventory</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicine</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Min Stock</TableHead>
                        <TableHead>Stock Value</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Expiry</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.inventory.stock_status?.slice(0, 20).map((item: any) => (
                        <TableRow key={item.medicine_id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-500">{item.generic_name}</p>
                            </div>
                          </TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.current_stock}</TableCell>
                          <TableCell>{item.minimum_stock}</TableCell>
                          <TableCell>₹{item.stock_value}</TableCell>
                          <TableCell>
                            <Badge className={
                              item.stock_status === 'good' ? 'bg-green-100 text-green-800' :
                              item.stock_status === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {item.stock_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              item.expiry_status === 'good' ? 'bg-green-100 text-green-800' :
                              item.expiry_status === 'expiring_soon' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {item.expiry_status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          {reportData.financial && (
            <>
              {/* Financial Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                  title="Total Revenue"
                  value={`₹${Number(reportData.financial.summary?.total_revenue || 0).toFixed(2)}`}
                  icon={DollarSign}
                  color="green"
                />
                <StatCard
                  title="Total Transactions"
                  value={reportData.financial.summary?.total_transactions || 0}
                  icon={Activity}
                  color="blue"
                />
                <StatCard
                  title="Average Transaction"
                  value={`₹${Number(reportData.financial.summary?.average_transaction || 0).toFixed(2)}`}
                  icon={TrendingUp}
                  color="purple"
                />
                <StatCard
                  title="Period"
                  value={period.charAt(0).toUpperCase() + period.slice(1)}
                  icon={Calendar}
                  color="orange"
                />
              </div>

              {/* Revenue Trend Chart */}
              {reportData.financial.revenue_by_period && (
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                    <CardDescription>Revenue over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={reportData.financial.revenue_by_period}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Revenue by Category */}
              {reportData.financial.revenue_by_category && (
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Category</CardTitle>
                    <CardDescription>Revenue breakdown by medicine category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={reportData.financial.revenue_by_category}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="revenue"
                          >
                            {reportData.financial.revenue_by_category.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                        </PieChart>
                      </ResponsiveContainer>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead>Revenue</TableHead>
                            <TableHead>Quantity</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reportData.financial.revenue_by_category.map((category: any, index: number) => (
                            <TableRow key={category.category}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                  />
                                  {category.category}
                                </div>
                              </TableCell>
                              <TableCell>₹{category.revenue}</TableCell>
                              <TableCell>{category.quantity_sold}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          {reportData.alerts && (
            <>
              {/* Alert Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                  title="Total Alerts"
                  value={reportData.alerts.summary?.total_alerts || 0}
                  icon={AlertTriangle}
                  color="red"
                />
                <StatCard
                  title="Critical Alerts"
                  value={reportData.alerts.summary?.critical_alerts || 0}
                  icon={AlertTriangle}
                  color="red"
                />
                <StatCard
                  title="Low Stock"
                  value={reportData.alerts.categories?.low_stock || 0}
                  icon={Package}
                  color="orange"
                />
                <StatCard
                  title="Expiring Medicines"
                  value={reportData.alerts.categories?.expiring_medicines || 0}
                  icon={Calendar}
                  color="yellow"
                />
              </div>

              {/* Alerts List */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Alerts</CardTitle>
                  <CardDescription>Current system alerts requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.alerts.alerts?.map((alert: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Badge className={
                              alert.alert_type === 'low_stock' ? 'bg-orange-100 text-orange-800' :
                              alert.alert_type === 'expiring_soon' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }>
                              {alert.alert_type.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {alert.medicine_name || alert.prescription_id || alert.patient_name}
                          </TableCell>
                          <TableCell>{alert.message}</TableCell>
                          <TableCell>
                            <Badge className={
                              alert.priority === 'critical' ? 'bg-red-100 text-red-800' :
                              alert.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {alert.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {alert.current_stock && (
                              <span className="text-sm text-gray-600">
                                Stock: {alert.current_stock}/{alert.minimum_stock}
                              </span>
                            )}
                            {alert.days_to_expiry !== undefined && (
                              <span className="text-sm text-gray-600">
                                {alert.days_to_expiry} days to expiry
                              </span>
                            )}
                            {alert.days_pending && (
                              <span className="text-sm text-gray-600">
                                Pending for {alert.days_pending} days
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span>Loading report data...</span>
          </div>
        </div>
      )}
    </div>
  );
}

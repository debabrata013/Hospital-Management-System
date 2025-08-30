"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Eye,
  Lock,
  Key,
  Activity,
  Clock,
  MapPin,
  Smartphone,
  RefreshCw,
  Download
} from 'lucide-react'

// Mock security data
const securityAlerts = [
  { id: 1, type: "failed_login", severity: "high", message: "Multiple failed login attempts detected", user: "unknown@suspicious.com", ip: "192.168.1.100", timestamp: "2 minutes ago", status: "active" },
  { id: 2, type: "unusual_access", severity: "medium", message: "Login from new device detected", user: "dr.sharma@hospital.com", ip: "203.192.12.45", timestamp: "15 minutes ago", status: "resolved" },
  { id: 3, type: "permission_change", severity: "low", message: "User permissions modified", user: "admin@hospital.com", ip: "192.168.1.50", timestamp: "1 hour ago", status: "resolved" }
]

const activeSessions = [
  { id: 1, user: "Dr. Rajesh Kumar", email: "rajesh@hospital.com", role: "Doctor", device: "Chrome on Windows", location: "Mumbai, India", ip: "192.168.1.25", loginTime: "2 hours ago", lastActivity: "5 minutes ago", status: "active" },
  { id: 2, user: "Nurse Priya", email: "priya@hospital.com", role: "Nurse", device: "Safari on iPhone", location: "Mumbai, India", ip: "192.168.1.30", loginTime: "4 hours ago", lastActivity: "10 minutes ago", status: "active" }
]

export default function SecurityPage() {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high': return <Badge className="bg-red-100 text-red-700">High</Badge>
      case 'medium': return <Badge className="bg-yellow-100 text-yellow-700">Medium</Badge>
      case 'low': return <Badge className="bg-blue-100 text-blue-700">Low</Badge>
      default: return <Badge className="bg-gray-100 text-gray-700">{severity}</Badge>
    }
  }

  const getStatusBadge = (status: string) => status === 'active' 
    ? <Badge className="bg-red-100 text-red-700">Active</Badge>
    : <Badge className="bg-green-100 text-green-700">Resolved</Badge>

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'failed_login': return <XCircle className="h-5 w-5 text-red-500" />
      case 'unusual_access': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'permission_change': return <Key className="h-5 w-5 text-blue-500" />
      default: return <Shield className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="h-6 sm:h-8 w-6 sm:w-8 mr-2 sm:mr-3 text-pink-500" />
            Security Center
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Monitor system security, alerts, and user activities</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 flex-1 sm:flex-none">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 flex-1 sm:flex-none">
            <Download className="h-4 w-4 mr-2" />
            Security Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {[
          { title: "Security Score", value: "94%", icon: <Shield className="h-8 w-8 text-green-500" />, color: "text-green-600" },
          { title: "Active Alerts", value: "3", icon: <AlertTriangle className="h-8 w-8 text-red-500" />, color: "text-red-600" },
          { title: "Active Sessions", value: "24", icon: <Activity className="h-8 w-8 text-blue-500" />, color: "text-blue-600" },
          { title: "Failed Logins", value: "12", icon: <XCircle className="h-8 w-8 text-yellow-500" />, color: "text-yellow-600" }
        ].map((card, idx) => (
          <Card key={idx} className="border-pink-100">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                </div>
                {card.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
        {/* Security Alerts */}
        <Card className="border-pink-100">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Security Alerts
            </CardTitle>
            <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">View All</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {securityAlerts.map(alert => (
              <div key={alert.id} className="p-3 sm:p-4 border border-pink-100 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <div className="flex items-start sm:items-center space-x-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{alert.message}</h4>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-1 text-xs sm:text-sm text-gray-600">
                      <span>User: {alert.user}</span>
                      <span>IP: {alert.ip}</span>
                      <span>{alert.timestamp}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                  {getSeverityBadge(alert.severity)}
                  {getStatusBadge(alert.status)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Firewall Status", icon: <CheckCircle className="h-5 w-5 text-green-500" />, badge: "Active", bg: "bg-green-50", color: "bg-green-100 text-green-700" },
              { label: "SSL Certificate", icon: <CheckCircle className="h-5 w-5 text-green-500" />, badge: "Valid", bg: "bg-green-50", color: "bg-green-100 text-green-700" },
              { label: "Antivirus Scan", icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />, badge: "Pending", bg: "bg-yellow-50", color: "bg-yellow-100 text-yellow-700" },
              { label: "Database Encryption", icon: <CheckCircle className="h-5 w-5 text-green-500" />, badge: "Enabled", bg: "bg-green-50", color: "bg-green-100 text-green-700" },
              { label: "Backup Status", icon: <CheckCircle className="h-5 w-5 text-green-500" />, badge: "Up to Date", bg: "bg-green-50", color: "bg-green-100 text-green-700" }
            ].map((item, idx) => (
              <div key={idx} className={`flex items-center justify-between p-3 sm:p-4 ${item.bg} rounded-lg`}>
                <div className="flex items-center space-x-3">{item.icon}<span className="font-medium">{item.label}</span></div>
                <Badge className={item.color}>{item.badge}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions */}
      <Card className="border-pink-100 mb-6">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-500" />
            Active User Sessions
          </CardTitle>
          <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">View All Sessions</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeSessions.map(session => (
            <div key={session.id} className="p-3 sm:p-4 border border-pink-100 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-start sm:items-center space-x-3">
                <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-full h-12 w-12 flex items-center justify-center font-bold">{session.user.split(' ').map(n => n[0]).join('')}</div>
                <div>
                  <h4 className="font-semibold text-gray-900">{session.user}</h4>
                  <p className="text-sm text-gray-600">{session.email} • {session.role}</p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4 mt-1 text-xs text-gray-500">
                    <div className="flex items-center gap-1"><Smartphone className="h-3 w-3" />{session.device}</div>
                    <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{session.location}</div>
                    <div className="flex items-center gap-1"><Clock className="h-3 w-3" />Login: {session.loginTime}</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50"><Eye className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50"><XCircle className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security Actions */}
      <Card className="border-pink-100 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center"><Lock className="h-5 w-5 mr-2 text-purple-500" />Security Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            { icon: <Lock className="h-6 w-6" />, label: "Force Password Reset" },
            { icon: <XCircle className="h-6 w-6" />, label: "Terminate Sessions" },
            { icon: <Shield className="h-6 w-6" />, label: "Enable Lockdown" }
          ].map((action, idx) => (
            <Button key={idx} variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">{action.icon}<span>{action.label}</span></Button>
          ))}
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <div className="mt-6 sm:mt-8 text-center">
        <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-pink-100 text-pink-700 rounded-full">
          <Shield className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
          <span className="font-medium text-sm sm:text-base">Advanced Security Features Coming Soon</span>
        </div>
      </div>
    </div>
  )
}

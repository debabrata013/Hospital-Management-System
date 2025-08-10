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
  {
    id: 1,
    type: "failed_login",
    severity: "high",
    message: "Multiple failed login attempts detected",
    user: "unknown@suspicious.com",
    ip: "192.168.1.100",
    timestamp: "2 minutes ago",
    status: "active"
  },
  {
    id: 2,
    type: "unusual_access",
    severity: "medium",
    message: "Login from new device detected",
    user: "dr.sharma@hospital.com",
    ip: "203.192.12.45",
    timestamp: "15 minutes ago",
    status: "resolved"
  },
  {
    id: 3,
    type: "permission_change",
    severity: "low",
    message: "User permissions modified",
    user: "admin@hospital.com",
    ip: "192.168.1.50",
    timestamp: "1 hour ago",
    status: "resolved"
  }
]

const activeSessions = [
  {
    id: 1,
    user: "Dr. Rajesh Kumar",
    email: "rajesh@hospital.com",
    role: "Doctor",
    device: "Chrome on Windows",
    location: "Mumbai, India",
    ip: "192.168.1.25",
    loginTime: "2 hours ago",
    lastActivity: "5 minutes ago",
    status: "active"
  },
  {
    id: 2,
    user: "Nurse Priya",
    email: "priya@hospital.com",
    role: "Nurse",
    device: "Safari on iPhone",
    location: "Mumbai, India",
    ip: "192.168.1.30",
    loginTime: "4 hours ago",
    lastActivity: "10 minutes ago",
    status: "active"
  }
]

export default function SecurityPage() {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge className="bg-red-100 text-red-700">High</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-700">Medium</Badge>
      case 'low':
        return <Badge className="bg-blue-100 text-blue-700">Low</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{severity}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge className="bg-red-100 text-red-700">Active</Badge>
      : <Badge className="bg-green-100 text-green-700">Resolved</Badge>
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'failed_login':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'unusual_access':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'permission_change':
        return <Key className="h-5 w-5 text-blue-500" />
      default:
        return <Shield className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Shield className="h-8 w-8 mr-3 text-pink-500" />
              Security Center
            </h1>
            <p className="text-gray-600 mt-2">Monitor system security, alerts, and user activities</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600">
              <Download className="h-4 w-4 mr-2" />
              Security Report
            </Button>
          </div>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Score</p>
                <p className="text-2xl font-bold text-green-600">94%</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-red-600">3</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-blue-600">24</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Logins</p>
                <p className="text-2xl font-bold text-yellow-600">12</p>
              </div>
              <XCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Security Alerts */}
        <Card className="border-pink-100">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Security Alerts
            </CardTitle>
            <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {securityAlerts.map((alert) => (
                <div key={alert.id} className="p-4 border border-pink-100 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{alert.message}</h4>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span>User: {alert.user}</span>
                          <span>IP: {alert.ip}</span>
                          <span>{alert.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getSeverityBadge(alert.severity)}
                      {getStatusBadge(alert.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Firewall Status</span>
                </div>
                <Badge className="bg-green-100 text-green-700">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">SSL Certificate</span>
                </div>
                <Badge className="bg-green-100 text-green-700">Valid</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">Antivirus Scan</span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Database Encryption</span>
                </div>
                <Badge className="bg-green-100 text-green-700">Enabled</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Backup Status</span>
                </div>
                <Badge className="bg-green-100 text-green-700">Up to Date</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions */}
      <Card className="border-pink-100 mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-500" />
            Active User Sessions
          </CardTitle>
          <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
            View All Sessions
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeSessions.map((session) => (
              <div key={session.id} className="p-4 border border-pink-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-full h-12 w-12 flex items-center justify-center font-bold">
                      {session.user.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{session.user}</h4>
                      <p className="text-sm text-gray-600">{session.email} • {session.role}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Smartphone className="h-3 w-3 mr-1" />
                          {session.device}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {session.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Login: {session.loginTime}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">IP: {session.ip}</p>
                      <p className="text-xs text-gray-500">Last activity: {session.lastActivity}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Actions */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="h-5 w-5 mr-2 text-purple-500" />
            Security Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Lock className="h-6 w-6" />
              <span>Force Password Reset</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <XCircle className="h-6 w-6" />
              <span>Terminate Sessions</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Shield className="h-6 w-6" />
              <span>Enable Lockdown</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-pink-100 text-pink-700 rounded-full">
          <Shield className="h-5 w-5 mr-2" />
          <span className="font-medium">Advanced Security Features Coming Soon</span>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { 
  Settings, 
  Save, 
  RefreshCw,
  Database,
  Mail,
  Bell,
  Shield,
  Globe,
  Palette,
  Server,
  Key
} from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
              <Settings className="h-6 sm:h-8 w-6 sm:w-8 mr-2 sm:mr-3 text-pink-500" />
              System Settings
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              Configure system-wide settings and preferences
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 flex-1 sm:flex-none">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
            <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 flex-1 sm:flex-none">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* General Settings */}
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2 text-pink-500" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="hospital-name">Hospital System Name</Label>
              <Input 
                id="hospital-name" 
                defaultValue="NMSC Management System"
                className="border-pink-200 focus:border-pink-400"
              />
            </div>
            
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="system-timezone">System Timezone</Label>
              <Input 
                id="system-timezone" 
                defaultValue="Asia/Kolkata (IST)"
                className="border-pink-200 focus:border-pink-400"
              />
            </div>
            
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="default-language">Default Language</Label>
              <Input 
                id="default-language" 
                defaultValue="Hindi/English"
                className="border-pink-200 focus:border-pink-400"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-gray-600">Enable system maintenance mode</p>
              </div>
              <Switch />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="space-y-0.5">
                <Label>Auto Backup</Label>
                <p className="text-sm text-gray-600">Enable automatic daily backups</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-blue-500" />
              Database Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <div>
                  <h4 className="font-semibold text-green-800">Database Status</h4>
                  <p className="text-sm text-green-600">Connected and operational</p>
                </div>
                <Badge className="bg-green-100 text-green-700">Online</Badge>
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="backup-frequency">Backup Frequency</Label>
              <Input 
                id="backup-frequency" 
                defaultValue="Daily at 2:00 AM"
                className="border-pink-200 focus:border-pink-400"
              />
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="retention-period">Data Retention Period</Label>
              <Input 
                id="retention-period" 
                defaultValue="7 years"
                className="border-pink-200 focus:border-pink-400"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="space-y-0.5">
                <Label>Query Logging</Label>
                <p className="text-sm text-gray-600">Log database queries for debugging</p>
              </div>
              <Switch />
            </div>

            <Button variant="outline" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50">
              <Database className="h-4 w-4 mr-2" />
              Test Database Connection
            </Button>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2 text-green-500" />
              Email Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="smtp-server">SMTP Server</Label>
              <Input 
                id="smtp-server" 
                defaultValue="smtp.gmail.com"
                className="border-pink-200 focus:border-pink-400"
              />
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input 
                id="smtp-port" 
                defaultValue="587"
                className="border-pink-200 focus:border-pink-400"
              />
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="email-from">From Email Address</Label>
              <Input 
                id="email-from" 
                defaultValue="noreply@arogyahospital.com"
                className="border-pink-200 focus:border-pink-400"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-600">Send system notifications via email</p>
              </div>
              <Switch defaultChecked />
            </div>

            <Button variant="outline" className="w-full border-green-200 text-green-600 hover:bg-green-50">
              <Mail className="h-4 w-4 mr-2" />
              Test Email Configuration
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-red-500" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input 
                id="session-timeout" 
                defaultValue="30"
                className="border-pink-200 focus:border-pink-400"
              />
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="password-policy">Password Policy</Label>
              <Textarea 
                id="password-policy" 
                defaultValue="Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character"
                className="border-pink-200 focus:border-pink-400"
                rows={3}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="space-y-0.5">
                <Label>Login Attempt Monitoring</Label>
                <p className="text-sm text-gray-600">Monitor and block suspicious login attempts</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
              <Input 
                id="max-login-attempts" 
                defaultValue="5"
                className="border-pink-200 focus:border-pink-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2 text-yellow-500" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="space-y-0.5">
                <Label>System Alerts</Label>
                <p className="text-sm text-gray-600">Critical system notifications</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="space-y-0.5">
                <Label>User Activity Alerts</Label>
                <p className="text-sm text-gray-600">Notifications for user actions</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="space-y-0.5">
                <Label>Inventory Alerts</Label>
                <p className="text-sm text-gray-600">Low stock and expiry notifications</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="space-y-0.5">
                <Label>Appointment Reminders</Label>
                <p className="text-sm text-gray-600">Automated appointment reminders</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="notification-frequency">Notification Frequency</Label>
              <Input 
                id="notification-frequency" 
                defaultValue="Real-time"
                className="border-pink-200 focus:border-pink-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* System Performance */}
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="h-5 w-5 mr-2 text-purple-500" />
              System Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">99.8%</p>
                <p className="text-sm text-blue-600">Uptime</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">1.2s</p>
                <p className="text-sm text-green-600">Avg Response</p>
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="cache-duration">Cache Duration (hours)</Label>
              <Input 
                id="cache-duration" 
                defaultValue="24"
                className="border-pink-200 focus:border-pink-400"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="space-y-0.5">
                <Label>Performance Monitoring</Label>
                <p className="text-sm text-gray-600">Enable system performance tracking</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="space-y-0.5">
                <Label>Auto-scaling</Label>
                <p className="text-sm text-gray-600">Automatically scale resources</p>
              </div>
              <Switch />
            </div>

            <Button variant="outline" className="w-full border-purple-200 text-purple-600 hover:bg-purple-50">
              <Server className="h-4 w-4 mr-2" />
              View Performance Metrics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* API Keys Section */}
      <Card className="border-pink-100 mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="h-5 w-5 mr-2 text-indigo-500" />
            API Keys & Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-4">
              <div className="p-3 sm:p-4 border border-pink-100 rounded-lg">
                <h4 className="font-semibold text-gray-900">Payment Gateway</h4>
                <p className="text-sm text-gray-600 mb-2">Razorpay Integration</p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Input 
                    type="password" 
                    defaultValue="rz_test_1234567890"
                    className="border-pink-200 focus:border-pink-400 flex-1"
                  />
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </div>

              <div className="p-3 sm:p-4 border border-pink-100 rounded-lg">
                <h4 className="font-semibold text-gray-900">SMS Service</h4>
                <p className="text-sm text-gray-600 mb-2">Twilio API Key</p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Input 
                    type="password" 
                    defaultValue="AC1234567890abcdef"
                    className="border-pink-200 focus:border-pink-400 flex-1"
                  />
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3 sm:p-4 border border-pink-100 rounded-lg">
                <h4 className="font-semibold text-gray-900">Google Maps</h4>
                <p className="text-sm text-gray-600 mb-2">Maps API Key</p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Input 
                    type="password" 
                    defaultValue="AIzaSyC1234567890"
                    className="border-pink-200 focus:border-pink-400 flex-1"
                  />
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </div>

              <div className="p-3 sm:p-4 border border-pink-100 rounded-lg">
                <h4 className="font-semibold text-gray-900">AI Service</h4>
                <p className="text-sm text-gray-600 mb-2">OpenAI API Key</p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Input 
                    type="password" 
                    defaultValue="sk-1234567890abcdef"
                    className="border-pink-200 focus:border-pink-400 flex-1"
                  />
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <div className="mt-6 sm:mt-8 text-center">
        <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-pink-100 text-pink-700 rounded-full">
          <Settings className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
          <span className="font-medium text-sm sm:text-base">Advanced Configuration Options Coming Soon</span>
        </div>
      </div>
    </div>
  )
}

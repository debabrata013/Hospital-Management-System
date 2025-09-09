"use client"

import { useAuth } from '@/hooks/useAuth'
import { LogoutButton } from './LogoutButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  User, 
  Shield, 
  Building, 
  Mail, 
  Phone, 
  Clock,
  Settings
} from 'lucide-react'

export function UserSession() {
  const { authState } = useAuth()

  if (!authState.isAuthenticated || !authState.user) {
    return null
  }

  const { user } = authState

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'super-admin': 'bg-purple-100 text-purple-800',
      'admin': 'bg-blue-100 text-blue-800',
      'doctor': 'bg-green-100 text-green-800',
      'pharmacy': 'bg-orange-100 text-orange-800',
      'staff': 'bg-gray-100 text-gray-800',
      'receptionist': 'bg-pink-100 text-pink-800',
      'patient': 'bg-cyan-100 text-cyan-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Current Session
          </span>
          <LogoutButton 
            variant="outline" 
            size="sm"
            showText={false}
          />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* User Avatar and Basic Info */}
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{user.name}</h3>
            <p className="text-sm text-gray-600">ID: {user.user_id}</p>
          </div>
        </div>

        {/* Role Badge */}
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-gray-500" />
          <Badge className={getRoleColor(user.role)}>
            {user.role.replace('-', ' ').toUpperCase()}
          </Badge>
        </div>

        {/* Contact Information */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">{user.email}</span>
          </div>
          
          {user.mobile && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">{user.mobile}</span>
            </div>
          )}
          
          {user.department && (
            <div className="flex items-center space-x-2 text-sm">
              <Building className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">{user.department}</span>
            </div>
          )}
        </div>

        {/* Permissions */}
        {user.permissions && user.permissions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Permissions</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {user.permissions.slice(0, 3).map((permission, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs"
                >
                  {permission.replace('_', ' ')}
                </Badge>
              ))}
              {user.permissions.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{user.permissions.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Session Info */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Session Active</span>
            </div>
            <span>Secure Connection</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

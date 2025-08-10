"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter,
  Send,
  User,
  Clock,
  Stethoscope,
  Users,
  Phone,
  Video,
  Paperclip,
  MoreHorizontal
} from 'lucide-react'

// Mock message data
const mockConversations = [
  {
    id: "CONV001",
    participantName: "Dr. Priya Sharma",
    participantRole: "Cardiologist",
    lastMessage: "Patient in Room 101 needs immediate attention",
    lastMessageTime: "2 min ago",
    unreadCount: 2,
    status: "online",
    avatar: "PS"
  },
  {
    id: "CONV002",
    participantName: "Nurse Ravi Kumar",
    participantRole: "Senior Nurse",
    lastMessage: "Medicine inventory updated for Ward 3",
    lastMessageTime: "15 min ago",
    unreadCount: 0,
    status: "busy",
    avatar: "RK"
  },
  {
    id: "CONV003",
    participantName: "Reception Team",
    participantRole: "Front Desk",
    lastMessage: "New patient registration completed",
    lastMessageTime: "1 hour ago",
    unreadCount: 1,
    status: "online",
    avatar: "RT"
  },
  {
    id: "CONV004",
    participantName: "Dr. Amit Patel",
    participantRole: "Gynecologist",
    lastMessage: "Surgery scheduled for tomorrow 9 AM",
    lastMessageTime: "2 hours ago",
    unreadCount: 0,
    status: "offline",
    avatar: "AP"
  }
]

const mockMessages = [
  {
    id: "MSG001",
    senderId: "admin",
    senderName: "You",
    message: "Good morning Dr. Sharma, how is the patient in Room 101?",
    timestamp: "09:30 AM",
    type: "text"
  },
  {
    id: "MSG002",
    senderId: "dr_priya",
    senderName: "Dr. Priya Sharma",
    message: "Patient is stable now. Blood pressure normalized after medication.",
    timestamp: "09:32 AM",
    type: "text"
  },
  {
    id: "MSG003",
    senderId: "dr_priya",
    senderName: "Dr. Priya Sharma",
    message: "However, I recommend keeping him under observation for 24 hours.",
    timestamp: "09:33 AM",
    type: "text"
  },
  {
    id: "MSG004",
    senderId: "admin",
    senderName: "You",
    message: "Understood. I'll arrange for extended monitoring. Should we inform the family?",
    timestamp: "09:35 AM",
    type: "text"
  },
  {
    id: "MSG005",
    senderId: "dr_priya",
    senderName: "Dr. Priya Sharma",
    message: "Patient in Room 101 needs immediate attention",
    timestamp: "09:45 AM",
    type: "text"
  }
]

export default function AdminMessagesPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      case 'busy':
        return <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
      case 'offline':
        return <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
    }
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      'Cardiologist': 'bg-red-100 text-red-700',
      'Gynecologist': 'bg-pink-100 text-pink-700',
      'Senior Nurse': 'bg-blue-100 text-blue-700',
      'Front Desk': 'bg-green-100 text-green-700'
    }
    
    return <Badge className={colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-700'}>{role}</Badge>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <MessageSquare className="h-8 w-8 mr-3 text-pink-500" />
              Internal Messaging
            </h1>
            <p className="text-gray-600 mt-2">Communicate with doctors, nurses, and staff members</p>
          </div>
          <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600">
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Conversations</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <MessageSquare className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold text-blue-600">8</p>
              </div>
              <Badge className="bg-blue-100 text-blue-700">New</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Online Staff</p>
                <p className="text-2xl font-bold text-green-600">24</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Messages Today</p>
                <p className="text-2xl font-bold text-purple-600">156</p>
              </div>
              <Send className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Messaging Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Conversations</span>
              <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                <Filter className="h-4 w-4" />
              </Button>
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search conversations..." 
                className="pl-10 border-pink-200 focus:border-pink-400"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {mockConversations.map((conversation) => (
                <div key={conversation.id} className="p-4 hover:bg-pink-50 cursor-pointer border-b border-pink-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-full h-12 w-12 flex items-center justify-center font-bold text-sm">
                        {conversation.avatar}
                      </div>
                      <div className="absolute -bottom-1 -right-1">
                        {getStatusBadge(conversation.status)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">{conversation.participantName}</h4>
                        <span className="text-xs text-gray-500">{conversation.lastMessageTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-pink-500 text-white text-xs ml-2">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1">
                        {getRoleBadge(conversation.participantRole)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="border-pink-100 lg:col-span-2">
          <CardHeader className="border-b border-pink-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold text-sm">
                    PS
                  </div>
                  <div className="absolute -bottom-1 -right-1">
                    {getStatusBadge('online')}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Dr. Priya Sharma</h3>
                  <p className="text-sm text-gray-600">Cardiologist • Online</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {/* Messages */}
          <CardContent className="p-4 h-96 overflow-y-auto">
            <div className="space-y-4">
              {mockMessages.map((message) => (
                <div key={message.id} className={`flex ${message.senderId === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderId === 'admin' 
                      ? 'bg-pink-500 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderId === 'admin' ? 'text-pink-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          
          {/* Message Input */}
          <div className="border-t border-pink-100 p-4">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                <Paperclip className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <Textarea 
                  placeholder="Type your message..." 
                  className="border-pink-200 focus:border-pink-400 resize-none"
                  rows={1}
                />
              </div>
              <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Online Staff */}
      <Card className="border-pink-100 mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-green-500" />
            Online Staff Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="relative">
                <div className="bg-gradient-to-r from-red-400 to-red-500 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold text-sm">
                  PS
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Dr. Priya Sharma</p>
                <p className="text-sm text-gray-600">Cardiologist</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold text-sm">
                  RK
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full"></div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Ravi Kumar</p>
                <p className="text-sm text-gray-600">Senior Nurse</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="relative">
                <div className="bg-gradient-to-r from-green-400 to-green-500 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold text-sm">
                  RT
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Reception Team</p>
                <p className="text-sm text-gray-600">Front Desk</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <div className="relative">
                <div className="bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold text-sm">
                  AP
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Dr. Amit Patel</p>
                <p className="text-sm text-gray-600">Gynecologist</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-pink-100 mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Plus className="h-6 w-6" />
              <span>New Message</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Users className="h-6 w-6" />
              <span>Group Chat</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Stethoscope className="h-6 w-6" />
              <span>Doctor Consult</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Phone className="h-6 w-6" />
              <span>Emergency Alert</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-pink-100 text-pink-700 rounded-full">
          <MessageSquare className="h-5 w-5 mr-2" />
          <span className="font-medium">Real-time Messaging Features Coming Soon</span>
        </div>
      </div>
    </div>
  )
}

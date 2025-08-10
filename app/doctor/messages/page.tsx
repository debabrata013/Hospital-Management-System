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
  UserCog,
  Users,
  Phone,
  Video,
  Paperclip,
  MoreHorizontal,
  Shield,
  Stethoscope
} from 'lucide-react'

// Mock message data
const mockConversations = [
  {
    id: "CONV001",
    participantName: "Admin Sarah",
    participantRole: "Branch Admin",
    lastMessage: "Patient in Room 101 discharge papers ready for review",
    lastMessageTime: "5 min ago",
    unreadCount: 2,
    status: "online",
    avatar: "AS",
    type: "admin"
  },
  {
    id: "CONV002",
    participantName: "Nurse Ravi Kumar",
    participantRole: "Senior Nurse",
    lastMessage: "Patient vitals updated for Mr. Rajesh Kumar",
    lastMessageTime: "15 min ago",
    unreadCount: 0,
    status: "busy",
    avatar: "RK",
    type: "staff"
  },
  {
    id: "CONV003",
    participantName: "Reception Team",
    participantRole: "Front Desk",
    lastMessage: "New patient appointment scheduled for 2 PM",
    lastMessageTime: "30 min ago",
    unreadCount: 1,
    status: "online",
    avatar: "RT",
    type: "reception"
  },
  {
    id: "CONV004",
    participantName: "Dr. Amit Patel",
    participantRole: "Gynecologist",
    lastMessage: "Consultation needed for shared patient case",
    lastMessageTime: "1 hour ago",
    unreadCount: 0,
    status: "offline",
    avatar: "AP",
    type: "doctor"
  },
  {
    id: "CONV005",
    participantName: "Lab Technician",
    participantRole: "Laboratory",
    lastMessage: "Urgent lab results ready for Patient P002",
    lastMessageTime: "2 hours ago",
    unreadCount: 3,
    status: "online",
    avatar: "LT",
    type: "staff"
  }
]

const mockMessages = [
  {
    id: "MSG001",
    senderId: "admin_sarah",
    senderName: "Admin Sarah",
    message: "Good morning Dr. Sharma, the discharge papers for Patient P001 are ready for your review.",
    timestamp: "09:30 AM",
    type: "text"
  },
  {
    id: "MSG002",
    senderId: "doctor",
    senderName: "You",
    message: "Thank you Sarah. I'll review them shortly. Has the patient's family been informed about the discharge process?",
    timestamp: "09:32 AM",
    type: "text"
  },
  {
    id: "MSG003",
    senderId: "admin_sarah",
    senderName: "Admin Sarah",
    message: "Yes, they've been contacted and will arrive by 2 PM to complete the formalities.",
    timestamp: "09:33 AM",
    type: "text"
  },
  {
    id: "MSG004",
    senderId: "doctor",
    senderName: "You",
    message: "Perfect. Please ensure all medications are prepared and the final bill is ready.",
    timestamp: "09:35 AM",
    type: "text"
  },
  {
    id: "MSG005",
    senderId: "admin_sarah",
    senderName: "Admin Sarah",
    message: "Patient in Room 101 discharge papers ready for review",
    timestamp: "09:45 AM",
    type: "text"
  }
]

export default function DoctorMessagesPage() {
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
      'Branch Admin': 'bg-purple-100 text-purple-700',
      'Senior Nurse': 'bg-blue-100 text-blue-700',
      'Front Desk': 'bg-green-100 text-green-700',
      'Gynecologist': 'bg-pink-100 text-pink-700',
      'Laboratory': 'bg-orange-100 text-orange-700'
    }
    
    return <Badge className={colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-700'}>{role}</Badge>
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'admin':
        return <UserCog className="h-4 w-4 text-purple-500" />
      case 'doctor':
        return <Stethoscope className="h-4 w-4 text-pink-500" />
      case 'staff':
        return <Users className="h-4 w-4 text-blue-500" />
      case 'reception':
        return <User className="h-4 w-4 text-green-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <MessageSquare className="h-8 w-8 mr-3 text-pink-500" />
              Messages
            </h1>
            <p className="text-gray-600 mt-2">Communicate with admin, staff, and reception team</p>
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
                <p className="text-2xl font-bold text-gray-900">8</p>
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
                <p className="text-2xl font-bold text-blue-600">6</p>
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
                <p className="text-2xl font-bold text-green-600">18</p>
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
                <p className="text-2xl font-bold text-purple-600">42</p>
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
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900 truncate">{conversation.participantName}</h4>
                          {getTypeIcon(conversation.type)}
                        </div>
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
                  <div className="bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold text-sm">
                    AS
                  </div>
                  <div className="absolute -bottom-1 -right-1">
                    {getStatusBadge('online')}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Admin Sarah</h3>
                  <p className="text-sm text-gray-600">Branch Admin • Online</p>
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
                <div key={message.id} className={`flex ${message.senderId === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderId === 'doctor' 
                      ? 'bg-pink-500 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderId === 'doctor' ? 'text-pink-100' : 'text-gray-500'
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

      {/* Contact Categories */}
      <Card className="border-pink-100 mt-6">
        <CardHeader>
          <CardTitle>Quick Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg text-center hover:shadow-md transition-all duration-200 cursor-pointer">
              <UserCog className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h4 className="font-semibold text-purple-800">Admin Team</h4>
              <p className="text-sm text-purple-600">Hospital administration</p>
              <Badge className="bg-green-100 text-green-700 mt-2">3 Online</Badge>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg text-center hover:shadow-md transition-all duration-200 cursor-pointer">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-800">Nursing Staff</h4>
              <p className="text-sm text-blue-600">Ward and patient care</p>
              <Badge className="bg-green-100 text-green-700 mt-2">8 Online</Badge>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg text-center hover:shadow-md transition-all duration-200 cursor-pointer">
              <User className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-semibold text-green-800">Reception</h4>
              <p className="text-sm text-green-600">Front desk and appointments</p>
              <Badge className="bg-green-100 text-green-700 mt-2">4 Online</Badge>
            </div>
            
            <div className="p-4 bg-pink-50 rounded-lg text-center hover:shadow-md transition-all duration-200 cursor-pointer">
              <Stethoscope className="h-8 w-8 text-pink-500 mx-auto mb-2" />
              <h4 className="font-semibold text-pink-800">Other Doctors</h4>
              <p className="text-sm text-pink-600">Medical consultations</p>
              <Badge className="bg-green-100 text-green-700 mt-2">5 Online</Badge>
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
              <Shield className="h-6 w-6" />
              <span>Emergency Alert</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Phone className="h-6 w-6" />
              <span>Voice Call</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-pink-100 text-pink-700 rounded-full">
          <MessageSquare className="h-5 w-5 mr-2" />
          <span className="font-medium">Real-time Messaging & Video Calls Coming Soon</span>
        </div>
      </div>
    </div>
  )
}

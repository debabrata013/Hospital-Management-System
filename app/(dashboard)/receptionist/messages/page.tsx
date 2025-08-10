"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  MessageSquare, 
  Send, 
  Search, 
  Plus, 
  ArrowLeft,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Stethoscope,
  Shield,
  Phone,
  Bell,
  Archive,
  Star,
  Reply,
  Forward,
  Trash2
} from 'lucide-react'
import Link from 'next/link'

interface Message {
  id: string
  from: string
  fromRole: 'doctor' | 'admin' | 'receptionist' | 'staff'
  to: string
  toRole: 'doctor' | 'admin' | 'receptionist' | 'staff'
  subject: string
  content: string
  timestamp: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'unread' | 'read' | 'replied' | 'archived'
  type: 'message' | 'notification' | 'alert' | 'reminder'
  attachments?: string[]
  relatedPatient?: string
}

interface Contact {
  id: string
  name: string
  role: 'doctor' | 'admin' | 'receptionist' | 'staff'
  department?: string
  status: 'online' | 'offline' | 'busy'
  lastSeen?: string
}

const mockContacts: Contact[] = [
  {
    id: "D001",
    name: "डॉ. अनिल कुमार",
    role: "doctor",
    department: "सामान्य चिकित्सा",
    status: "online"
  },
  {
    id: "D002", 
    name: "डॉ. प्रिया सिंह",
    role: "doctor",
    department: "स्त्री रोग",
    status: "busy"
  },
  {
    id: "A001",
    name: "Admin",
    role: "admin",
    status: "online"
  },
  {
    id: "S001",
    name: "नर्स सुमित्रा",
    role: "staff",
    department: "नर्सिंग",
    status: "offline",
    lastSeen: "2 घंटे पहले"
  },
  {
    id: "R002",
    name: "Reception-2",
    role: "receptionist",
    status: "online"
  }
]

const mockMessages: Message[] = [
  {
    id: "M001",
    from: "डॉ. अनिल कुमार",
    fromRole: "doctor",
    to: "Reception-1",
    toRole: "receptionist",
    subject: "मरीज़ P001 के लिए रक्त जांच",
    content: "कृपया राम शर्मा (P001) के लिए रक्त जांच की रिपोर्ट तैयार करवाएं। CBC और Sugar Test करवाना है।",
    timestamp: "2024-01-15T11:45:00Z",
    priority: "normal",
    status: "unread",
    type: "message",
    relatedPatient: "P001"
  },
  {
    id: "M002",
    from: "Admin",
    fromRole: "admin", 
    to: "All Staff",
    toRole: "staff",
    subject: "स्टाफ मीटिंग - आज शाम 5 बजे",
    content: "सभी स्टाफ सदस्यों से अनुरोध है कि आज शाम 5 बजे कॉन्फ्रेंस रूम में उपस्थित हों। नई नीतियों पर चर्चा होगी।",
    timestamp: "2024-01-15T11:30:00Z",
    priority: "high",
    status: "read",
    type: "notification"
  },
  {
    id: "M003",
    from: "डॉ. प्रिया सिंह",
    fromRole: "doctor",
    to: "Reception-1", 
    toRole: "receptionist",
    subject: "आपातकालीन - मरीज़ P002",
    content: "सुनीता देवी (P002) की स्थिति गंभीर है। तुरंत एम्बुलेंस की व्यवस्था करें और परिवार को सूचित करें।",
    timestamp: "2024-01-15T10:15:00Z",
    priority: "urgent",
    status: "read",
    type: "alert",
    relatedPatient: "P002"
  }
]

export default function InternalMessaging() {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [filteredMessages, setFilteredMessages] = useState<Message[]>(mockMessages)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [currentView, setCurrentView] = useState<'inbox' | 'sent' | 'archived'>('inbox')
  
  // New message state
  const [newMessage, setNewMessage] = useState({
    to: "",
    subject: "",
    content: "",
    priority: "normal" as const,
    type: "message" as const
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Filter messages
  useEffect(() => {
    let filtered = messages

    if (searchQuery) {
      filtered = filtered.filter(msg => 
        msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.from.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(msg => msg.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(msg => msg.priority === priorityFilter)
    }

    // Filter by current view
    if (currentView === 'inbox') {
      filtered = filtered.filter(msg => msg.to === 'Reception-1')
    } else if (currentView === 'sent') {
      filtered = filtered.filter(msg => msg.from === 'Reception-1')
    } else if (currentView === 'archived') {
      filtered = filtered.filter(msg => msg.status === 'archived')
    }

    setFilteredMessages(filtered)
  }, [messages, searchQuery, statusFilter, priorityFilter, currentView])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'normal': return 'bg-pink-100 text-pink-800 border-pink-200'
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'तत्काल'
      case 'high': return 'उच्च'
      case 'normal': return 'सामान्य'
      case 'low': return 'कम'
      default: return priority
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread': return <Bell className="h-4 w-4 text-pink-500" />
      case 'read': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'replied': return <Reply className="h-4 w-4 text-purple-500" />
      case 'archived': return <Archive className="h-4 w-4 text-gray-500" />
      default: return <MessageSquare className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'doctor': return <Stethoscope className="h-4 w-4 text-pink-500" />
      case 'admin': return <Shield className="h-4 w-4 text-purple-500" />
      case 'receptionist': return <User className="h-4 w-4 text-green-500" />
      case 'staff': return <Users className="h-4 w-4 text-orange-500" />
      default: return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'busy': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const sendMessage = () => {
    if (!newMessage.to || !newMessage.subject || !newMessage.content) {
      alert('कृपया सभी आवश्यक फील्ड भरें')
      return
    }

    const recipient = mockContacts.find(c => c.id === newMessage.to)
    if (!recipient) return

    const message: Message = {
      id: `M${Date.now()}`,
      from: "Reception-1",
      fromRole: "receptionist",
      to: recipient.name,
      toRole: recipient.role,
      subject: newMessage.subject,
      content: newMessage.content,
      timestamp: new Date().toISOString(),
      priority: newMessage.priority,
      status: "unread",
      type: newMessage.type
    }

    setMessages(prev => [...prev, message])
    setShowNewMessageDialog(false)
    
    // Reset form
    setNewMessage({
      to: "",
      subject: "",
      content: "",
      priority: "normal",
      type: "message"
    })

    alert('संदेश सफलतापूर्वक भेजा गया!')
  }

  const markAsRead = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, status: 'read' as const } : msg
    ))
  }

  const archiveMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, status: 'archived' as const } : msg
    ))
  }

  const deleteMessage = (messageId: string) => {
    if (confirm('क्या आप वाकई इस संदेश को हटाना चाहते हैं?')) {
      setMessages(prev => prev.filter(msg => msg.id !== messageId))
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'अभी'
    } else if (diffInHours < 24) {
      return `${diffInHours} घंटे पहले`
    } else {
      return date.toLocaleDateString('hi-IN')
    }
  }

  const messageStats = {
    total: messages.filter(m => m.to === 'Reception-1').length,
    unread: messages.filter(m => m.to === 'Reception-1' && m.status === 'unread').length,
    urgent: messages.filter(m => m.to === 'Reception-1' && m.priority === 'urgent').length,
    today: messages.filter(m => {
      const today = new Date().toDateString()
      const msgDate = new Date(m.timestamp).toDateString()
      return msgDate === today && m.to === 'Reception-1'
    }).length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      {/* Header */}
      <div className="bg-white border-b border-pink-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/receptionist">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                वापस
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">आंतरिक संदेश</h1>
              <p className="text-sm text-gray-600">Internal Messaging System</p>
            </div>
          </div>
          
          <Button onClick={() => setShowNewMessageDialog(true)} className="bg-pink-600 hover:bg-pink-700">
            <Plus className="h-4 w-4 mr-2" />
            नया संदेश
          </Button>
        </div>
      </div>

      <div className="p-6">
        {/* Message Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm">कुल संदेश</p>
                  <p className="text-2xl font-bold">{messageStats.total}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-pink-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">अपठित</p>
                  <p className="text-2xl font-bold">{messageStats.unread}</p>
                </div>
                <Bell className="h-8 w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">तत्काल</p>
                  <p className="text-2xl font-bold">{messageStats.urgent}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">आज के</p>
                  <p className="text-2xl font-bold">{messageStats.today}</p>
                </div>
                <Clock className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Contacts Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">संपर्क</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {contact.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(contact.status)}`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{contact.name}</p>
                      <div className="flex items-center space-x-1">
                        {getRoleIcon(contact.role)}
                        <p className="text-xs text-gray-500 truncate">
                          {contact.department || contact.role}
                        </p>
                      </div>
                      {contact.lastSeen && (
                        <p className="text-xs text-gray-400">{contact.lastSeen}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Messages List */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-1">
                    <Button
                      variant={currentView === 'inbox' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentView('inbox')}
                    >
                      इनबॉक्स
                    </Button>
                    <Button
                      variant={currentView === 'sent' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentView('sent')}
                    >
                      भेजे गए
                    </Button>
                    <Button
                      variant={currentView === 'archived' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentView('archived')}
                    >
                      संग्रहीत
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="संदेश खोजें..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-48"
                    />
                  </div>
                  
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">सभी</SelectItem>
                      <SelectItem value="urgent">तत्काल</SelectItem>
                      <SelectItem value="high">उच्च</SelectItem>
                      <SelectItem value="normal">सामान्य</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredMessages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      message.status === 'unread' ? 'bg-pink-50 border-pink-200' : 'bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedMessage(message)
                      if (message.status === 'unread') {
                        markAsRead(message.id)
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(message.status)}
                          <Badge className={getPriorityColor(message.priority)}>
                            {getPriorityText(message.priority)}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-2">
                          {getRoleIcon(message.fromRole)}
                          <p className="font-semibold text-gray-900">{message.from}</p>
                          {message.relatedPatient && (
                            <Badge variant="outline" className="text-xs">
                              मरीज़: {message.relatedPatient}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="font-medium text-gray-800 mb-1">{message.subject}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{message.content}</p>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            archiveMessage(message.id)
                          }}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteMessage(message.id)
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredMessages.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>कोई संदेश नहीं मिला</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Message Dialog */}
      <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>नया संदेश भेजें</DialogTitle>
            <DialogDescription>
              स्टाफ सदस्य को संदेश भेजें
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recipient">प्राप्तकर्ता *</Label>
                <Select value={newMessage.to} onValueChange={(value) => setNewMessage(prev => ({ ...prev, to: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="प्राप्तकर्ता चुनें" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockContacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(contact.role)}
                          <span>{contact.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="priority">प्राथमिकता</Label>
                <Select value={newMessage.priority} onValueChange={(value: any) => setNewMessage(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">कम</SelectItem>
                    <SelectItem value="normal">सामान्य</SelectItem>
                    <SelectItem value="high">उच्च</SelectItem>
                    <SelectItem value="urgent">तत्काल</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="subject">विषय *</Label>
              <Input
                id="subject"
                value={newMessage.subject}
                onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="संदेश का विषय"
              />
            </div>
            
            <div>
              <Label htmlFor="content">संदेश *</Label>
              <Textarea
                id="content"
                value={newMessage.content}
                onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                placeholder="अपना संदेश यहाँ लिखें..."
                rows={6}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewMessageDialog(false)}>
              रद्द करें
            </Button>
            <Button onClick={sendMessage}>
              <Send className="h-4 w-4 mr-2" />
              भेजें
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
            <DialogDescription>
              {selectedMessage?.from} से • {selectedMessage && formatTimestamp(selectedMessage.timestamp)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {getRoleIcon(selectedMessage.fromRole)}
                <span className="font-medium">{selectedMessage.from}</span>
                <Badge className={getPriorityColor(selectedMessage.priority)}>
                  {getPriorityText(selectedMessage.priority)}
                </Badge>
                {selectedMessage.relatedPatient && (
                  <Badge variant="outline">
                    मरीज़: {selectedMessage.relatedPatient}
                  </Badge>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800 whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMessage(null)}>
              बंद करें
            </Button>
            <Button onClick={() => {
              // Implement reply functionality
              alert('रिप्लाई फीचर जल्द आएगा')
            }}>
              <Reply className="h-4 w-4 mr-2" />
              जवाब दें
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

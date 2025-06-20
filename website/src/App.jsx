import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { ScrollArea } from '@/components/ui/scroll-area.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Input } from '@/components/ui/input.jsx'
import { 
  Search, 
  Send, 
  Users, 
  Building2, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Key,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  Code,
  Book,
  Zap,
  Shield,
  Globe
} from 'lucide-react'
import './App.css'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeEndpoint, setActiveEndpoint] = useState(null)
  const [copiedCode, setCopiedCode] = useState('')

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(id)
      setTimeout(() => setCopiedCode(''), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const endpoints = [
    {
      id: 'auth',
      category: 'Authentication',
      icon: Key,
      color: 'bg-blue-500',
      endpoints: [
        {
          method: 'POST',
          path: '/api/login',
          title: 'User Login',
          description: 'Authenticate user and receive access token',
          requestBody: {
            email: 'user@example.com',
            password: 'password123'
          },
          response: {
            user: { id: '1', name: 'John Doe', email: 'user@example.com', role: 'user' },
            token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...'
          }
        },
        {
          method: 'GET',
          path: '/api/logout',
          title: 'User Logout',
          description: 'Revoke current access token',
          requiresAuth: true,
          response: {
            message: 'successful-logout'
          }
        }
      ]
    },
    {
      id: 'campaigns',
      category: 'SMS Campaigns',
      icon: Send,
      color: 'bg-green-500',
      endpoints: [
        {
          method: 'GET',
          path: '/api/campaigns',
          title: 'List Campaigns',
          description: 'Get paginated list of SMS campaigns',
          requiresAuth: true,
          queryParams: {
            page: 1,
            per_page: 20,
            account_id: '1',
            search: 'summer'
          },
          response: {
            data: [
              {
                id: '1',
                name: 'Summer Sale Campaign',
                content: 'Get 20% off! Use code SUMMER20',
                type: 'campaign',
                marketing: true,
                messages_count: 150,
                created_at: '2023-06-20T10:00:00Z'
              }
            ],
            current_page: 1,
            total: 25
          }
        },
        {
          method: 'POST',
          path: '/api/campaigns',
          title: 'Create Campaign',
          description: 'Create a new SMS campaign with recipients',
          requiresAuth: true,
          requestBody: {
            name: 'Summer Sale Campaign',
            content: 'Get 20% off all items! Use code SUMMER20. Valid until July 31st.',
            account_id: '1',
            type: 'campaign',
            marketing: true,
            recipients: ['1', '2', '3'],
            lists: ['1'],
            numbers: ['+1234567890', '+1987654321']
          },
          response: {
            campaign: {
              id: '1',
              name: 'Summer Sale Campaign',
              content: 'Get 20% off all items! Use code SUMMER20',
              messages_count: 150
            },
            messages_count: 150
          }
        }
      ]
    },
    {
      id: 'recipients',
      category: 'Recipients',
      icon: Users,
      color: 'bg-purple-500',
      endpoints: [
        {
          method: 'GET',
          path: '/api/recipients',
          title: 'List Recipients',
          description: 'Get list of recipients with optional filtering',
          requiresAuth: true,
          queryParams: {
            account_id: '1',
            list_id: '1',
            'filter[name]': 'John'
          },
          response: {
            recipients: [
              {
                id: '1',
                number: '+1234567890',
                name: 'John Doe',
                account_id: '1',
                created_at: '2023-06-20T10:00:00Z'
              }
            ],
            count: 150
          }
        },
        {
          method: 'POST',
          path: '/api/recipients',
          title: 'Create Recipients',
          description: 'Create one or more recipients',
          requiresAuth: true,
          requestBody: {
            account_id: '1',
            list_id: '1',
            recipients: [
              { number: '+1234567890', name: 'John Doe' },
              { number: '+1987654321', name: 'Jane Smith' }
            ]
          },
          response: {
            recipients: [
              { id: '1', number: '+1234567890', name: 'John Doe' },
              { id: '2', number: '+1987654321', name: 'Jane Smith' }
            ]
          }
        }
      ]
    },
    {
      id: 'analytics',
      category: 'Analytics',
      icon: BarChart3,
      color: 'bg-orange-500',
      endpoints: [
        {
          method: 'GET',
          path: '/api/summary',
          title: 'Get Summary',
          description: 'Get overall summary statistics',
          requiresAuth: true,
          queryParams: {
            account_id: '1',
            date_from: '2023-01-01',
            date_to: '2023-12-31'
          },
          response: {
            total_campaigns: 25,
            total_messages: 1500,
            total_recipients: 800,
            messages_delivered: 1420,
            success_rate: 97.9,
            period: { from: '2023-01-01', to: '2023-12-31' }
          }
        }
      ]
    }
  ]

  const filteredEndpoints = endpoints.map(category => ({
    ...category,
    endpoints: category.endpoints.filter(endpoint =>
      endpoint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.endpoints.length > 0)

  const getMethodColor = (method) => {
    const colors = {
      GET: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      POST: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      PUT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }
    return colors[method] || 'bg-gray-100 text-gray-800'
  }

  const CodeBlock = ({ code, language = 'json', id }) => (
    <div className="relative">
      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-t-lg">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(code, id)}
          className="h-6 w-6 p-0"
        >
          {copiedCode === id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-b-lg overflow-x-auto">
        <code className="text-sm">{code}</code>
      </pre>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">SMS Marketing API</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive API Documentation</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                v1.0.0
              </Badge>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                OpenAPI Spec
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search endpoints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Quick Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">API Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Endpoints</span>
                    <Badge variant="secondary">25+</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Categories</span>
                    <Badge variant="secondary">8</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Auth Type</span>
                    <Badge variant="secondary">OAuth2</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {endpoints.map((category) => {
                    const Icon = category.icon
                    return (
                      <Button
                        key={category.id}
                        variant="ghost"
                        className="w-full justify-start h-auto p-3"
                        onClick={() => {
                          document.getElementById(category.id)?.scrollIntoView({ behavior: 'smooth' })
                        }}
                      >
                        <div className={`w-2 h-2 rounded-full mr-3 ${category.color}`}></div>
                        <Icon className="h-4 w-4 mr-2" />
                        <span className="text-sm">{category.category}</span>
                        <Badge variant="secondary" className="ml-auto">
                          {category.endpoints.length}
                        </Badge>
                      </Button>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-8">
              <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-full">
                <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Powerful SMS Marketing Platform</span>
              </div>
              <h2 className="text-3xl font-bold">Complete API Reference</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Integrate SMS marketing capabilities into your applications with our comprehensive REST API. 
                Manage campaigns, recipients, and track analytics with ease.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Shield className="h-8 w-8 mx-auto mb-4 text-blue-600" />
                  <h3 className="font-semibold mb-2">Secure Authentication</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">OAuth2 with personal access tokens</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Globe className="h-8 w-8 mx-auto mb-4 text-green-600" />
                  <h3 className="font-semibold mb-2">Global Reach</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">International phone number support</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <BarChart3 className="h-8 w-8 mx-auto mb-4 text-purple-600" />
                  <h3 className="font-semibold mb-2">Real-time Analytics</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Track delivery and success rates</p>
                </CardContent>
              </Card>
            </div>

            {/* API Endpoints */}
            {filteredEndpoints.map((category) => {
              const Icon = category.icon
              return (
                <div key={category.id} id={category.id}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${category.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{category.category}</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {category.endpoints.length} endpoint{category.endpoints.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {category.endpoints.map((endpoint, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Badge className={getMethodColor(endpoint.method)}>
                                {endpoint.method}
                              </Badge>
                              <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {endpoint.path}
                              </code>
                              {endpoint.requiresAuth && (
                                <Badge variant="outline" className="text-xs">
                                  <Key className="h-3 w-3 mr-1" />
                                  Auth Required
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div>
                            <CardTitle className="text-lg">{endpoint.title}</CardTitle>
                            <CardDescription>{endpoint.description}</CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <Tabs defaultValue="example" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="example">Example</TabsTrigger>
                              <TabsTrigger value="request">Request</TabsTrigger>
                              <TabsTrigger value="response">Response</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="example" className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">cURL Example</h4>
                                <CodeBlock
                                  id={`curl-${category.id}-${index}`}
                                  language="bash"
                                  code={`curl -X ${endpoint.method} "https://api.your-domain.com${endpoint.path}" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json"${endpoint.requestBody ? ` \\
  -d '${JSON.stringify(endpoint.requestBody, null, 2)}'` : ''}`}
                                />
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">JavaScript Example</h4>
                                <CodeBlock
                                  id={`js-${category.id}-${index}`}
                                  language="javascript"
                                  code={`const response = await fetch('https://api.your-domain.com${endpoint.path}', {
  method: '${endpoint.method}',
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
    'Content-Type': 'application/json'
  }${endpoint.requestBody ? `,
  body: JSON.stringify(${JSON.stringify(endpoint.requestBody, null, 2)})` : ''}
});

const data = await response.json();
console.log(data);`}
                                />
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="request" className="space-y-4">
                              {endpoint.queryParams && (
                                <div>
                                  <h4 className="font-semibold mb-2">Query Parameters</h4>
                                  <CodeBlock
                                    id={`query-${category.id}-${index}`}
                                    code={JSON.stringify(endpoint.queryParams, null, 2)}
                                  />
                                </div>
                              )}
                              
                              {endpoint.requestBody && (
                                <div>
                                  <h4 className="font-semibold mb-2">Request Body</h4>
                                  <CodeBlock
                                    id={`request-${category.id}-${index}`}
                                    code={JSON.stringify(endpoint.requestBody, null, 2)}
                                  />
                                </div>
                              )}
                            </TabsContent>
                            
                            <TabsContent value="response" className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">Response Example</h4>
                                <CodeBlock
                                  id={`response-${category.id}-${index}`}
                                  code={JSON.stringify(endpoint.response, null, 2)}
                                />
                              </div>
                            </TabsContent>
                          </Tabs>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {category.id !== filteredEndpoints[filteredEndpoints.length - 1].id && (
                    <Separator className="my-12" />
                  )}
                </div>
              )
            })}

            {/* Getting Started Section */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Book className="h-5 w-5" />
                  <span>Getting Started</span>
                </CardTitle>
                <CardDescription>
                  Quick guide to start using the SMS Marketing API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">1. Authentication</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Obtain your API token by logging in via the /api/login endpoint
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">2. Create Recipients</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add recipients to your account using the /api/recipients endpoint
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">3. Launch Campaign</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Create and send SMS campaigns via the /api/campaigns endpoint
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">4. Track Results</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Monitor campaign performance using the analytics endpoints
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-900 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">SMS Marketing API</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Built with ❤️ for developers. Need help? Contact our support team.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button variant="ghost" size="sm">Documentation</Button>
              <Button variant="ghost" size="sm">Support</Button>
              <Button variant="ghost" size="sm">Status</Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App


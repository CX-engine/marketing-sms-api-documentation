import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { ScrollArea } from '@/components/ui/scroll-area.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible.jsx'
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
  ChevronDown,
  Copy,
  Check,
  ExternalLink,
  Code,
  Book,
  Zap,
  Shield,
  Globe,
  List,
  FileText,
  Webhook,
  Mail
} from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import './App.css'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeEndpoint, setActiveEndpoint] = useState(null)
  const [copiedCode, setCopiedCode] = useState('')
  const [openCategories, setOpenCategories] = useState({})
  const [exampleSelection, setExampleSelection] = useState('curl')

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(id)
      setTimeout(() => setCopiedCode(''), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const toggleCategory = (categoryId) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  const scrollToEndpoint = (categoryId, endpointIndex) => {
    const element = document.getElementById(`${categoryId}-endpoint-${endpointIndex}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // Highlight the endpoint briefly
      element.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50')
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50')
      }, 2000)
    }
  }

  // Helper to convert JS object to PHP array string
  const jsObjToPhpArray = (obj, indent = 0) => {
    const pad = '  '.repeat(indent)
    if (Array.isArray(obj)) {
      let items = obj.map(item => jsObjToPhpArray(item, indent + 1)).join(',\n')
      return `[\n${items}\n${pad}]`
    } else if (typeof obj === 'object' && obj !== null) {
      let items = Object.entries(obj).map(([key, value]) => {
        return `${pad}  '${key}' => ${jsObjToPhpArray(value, indent + 1)}`
      }).join(',\n')
      return `[\n${items}\n${pad}]`
    } else if (typeof obj === 'string') {
      return `'${obj.replace(/'/g, "\\'")}'`
    } else if (typeof obj === 'number' || typeof obj === 'boolean') {
      return obj.toString()
    } else {
      return 'null'
    }
  }

  // Helper to convert queryParams object to query string
  const getQueryString = (queryParams) => {
    if (!queryParams) return ''
    const esc = encodeURIComponent
    return (
      '?' +
      Object.entries(queryParams)
        .map(([k, v]) =>
          Array.isArray(v)
            ? v.map(val => `${esc(k)}=${esc(val)}`).join('&')
            : `${esc(k)}=${esc(v)}`
        )
        .join('&')
    )
  }

  // Helper to generate cURL example
  const getCurlExample = (endpoint) => {
    const query = endpoint.queryParams ? getQueryString(endpoint.queryParams) : ''
    return `curl -X ${endpoint.method} "https://sms.encom.tel/api${endpoint.path}${query}" \n\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \n\
  -H "Content-Type: application/json"${endpoint.requestBody ? ` \n\
  -d '${JSON.stringify(endpoint.requestBody, null, 2)}'` : ''}`.replace(/\\"/g, '"')
  }

  // Helper to generate JavaScript example
  const getJsExample = (endpoint) => {
    let queryBlock = ''
    let urlVar = `'https://sms.encom.tel/api${endpoint.path}'`
    if (endpoint.queryParams) {
      queryBlock = `const params = ${JSON.stringify(endpoint.queryParams, null, 2)};
const url = 'https://sms.encom.tel/api${endpoint.path}' + '?' + new URLSearchParams(params).toString();
`
      urlVar = 'url'
    }
    let fetchOptions = `  method: '${endpoint.method}',
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
    'Content-Type': 'application/json'
  }`
    if (endpoint.requestBody) {
      const bodyString = JSON.stringify(endpoint.requestBody, null, 2)
      fetchOptions += `,
  body: JSON.stringify(${bodyString.replace(/\n/g, '\n  ')})`
    }
    return `${queryBlock}const response = await fetch(${urlVar}, {
${fetchOptions}
});

const data = await response.json();

console.log(data);`
  }

  // Helper to generate PHP example using Guzzle
  const getPhpExample = (endpoint) => {
    let body = ''
    if (endpoint.requestBody) {
      body = `\n    'body' => json_encode(${jsObjToPhpArray(endpoint.requestBody, 2)}),`
    }
    let queryBlock = ''
    let pathVar = `'https://sms.encom.tel/api${endpoint.path}'`
    if (endpoint.queryParams) {
      queryBlock = `$query = ${jsObjToPhpArray(endpoint.queryParams, 1)};
$path = 'https://sms.encom.tel/api${endpoint.path}' . '?' . http_build_query($query);`
      pathVar = '$path'
    }
    return `<?php require 'vendor/autoload.php';

use GuzzleHttp\\Client;

${queryBlock ? queryBlock + '\n\n' : ''}$client = new Client();
$response = $client->request('${endpoint.method}', ${pathVar}, [
    'headers' => [
        'Authorization' => 'Bearer YOUR_ACCESS_TOKEN',
        'Content-Type' => 'application/json',
    ],${body}
]);

$body = $response->getBody();
$data = json_decode($body, true);

print_r($data);`
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
          path: '/login',
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
          path: '/logout',
          title: 'User Logout',
          description: 'Revoke current access token',
          requiresAuth: true,
          response: {
            message: 'successful-logout'
          }
        },
        {
          method: 'POST',
          path: '/password-reset-request',
          title: 'Request Password Reset',
          description: 'Send password reset link to user email',
          requestBody: {
            email: 'user@example.com'
          },
          response: {
            success: true,
            message: 'passwords.sent'
          }
        },
        {
          method: 'POST',
          path: '/password-reset',
          title: 'Reset Password',
          description: 'Reset user password using token from email',
          requestBody: {
            email: 'user@example.com',
            token: 'abc123def456',
            password: 'newPassword123'
          },
          response: {
            success: true,
            message: 'passwords.reset'
          }
        }
      ]
    },
    {
      id: 'users',
      category: 'Users',
      icon: Users,
      color: 'bg-indigo-500',
      endpoints: [
        {
          method: 'GET',
          path: '/users',
          title: 'List Users',
          description: 'Get paginated list of users',
          requiresAuth: true,
          queryParams: {
            page: 1,
            per_page: 20
          },
          response: {
            data: [{ id: '1', name: 'John Doe', email: 'john@example.com', role: 'user' }],
            current_page: 1,
            total: 100
          }
        },
        {
          method: 'POST',
          path: '/users',
          title: 'Create User',
          description: 'Create a new user',
          requiresAuth: true,
          requestBody: {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            role: 'user'
          },
          response: {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'user'
          }
        },
        {
          method: 'GET',
          path: '/users/{user}',
          title: 'Get User',
          description: 'Get user details by ID',
          requiresAuth: true,
          response: {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'user'
          }
        },
        {
          method: 'PUT',
          path: '/users/{user}',
          title: 'Update User',
          description: 'Update user details',
          requiresAuth: true,
          requestBody: {
            name: 'John Doe Updated',
            email: 'john.updated@example.com'
          },
          response: {
            user: { id: '1', name: 'John Doe Updated' },
            updated: true
          }
        },
        {
          method: 'DELETE',
          path: '/users/{user}',
          title: 'Delete User',
          description: 'Delete a user',
          requiresAuth: true,
          response: {
            deleted: true
          }
        },
        {
          method: 'POST',
          path: '/users/{user}/welcome',
          title: 'Complete Welcome Process',
          description: 'Set the user password from the welcome email (signed route)',
          queryParams: {
            signature: 'signed_url_signature'
          },
          requestBody: {
            password: 'password123'
          },
          response: {
            success: true
          }
        }
      ]
    },
    {
      id: 'organisations',
      category: 'Organizations',
      icon: Building2,
      color: 'bg-cyan-500',
      endpoints: [
        {
          method: 'GET',
          path: '/organisations',
          title: 'List Organizations',
          description: 'Get paginated list of organizations',
          requiresAuth: true,
          response: {
            data: [{ id: '1', name: 'Acme Corp' }],
            current_page: 1,
            total: 50
          }
        },
        {
          method: 'POST',
          path: '/organisations',
          title: 'Create Organization',
          description: 'Create a new organization',
          requiresAuth: true,
          requestBody: {
            name: 'Acme Corp'
          },
          response: {
            id: '1',
            name: 'Acme Corp'
          }
        },
        {
          method: 'GET',
          path: '/organisations/{organisation}',
          title: 'Get Organization',
          description: 'Get organization details by ID',
          requiresAuth: true,
          response: {
            id: '1',
            name: 'Acme Corp'
          }
        },
        {
          method: 'PUT',
          path: '/organisations/{organisation}',
          title: 'Update Organization',
          description: 'Update organization details',
          requiresAuth: true,
          requestBody: {
            name: 'Acme Corp Updated'
          },
          response: {
            organisation: { id: '1', name: 'Acme Corp Updated' },
            updated: true
          }
        },
        {
          method: 'DELETE',
          path: '/organisations/{organisation}',
          title: 'Delete Organization',
          description: 'Delete an organization',
          requiresAuth: true,
          response: {
            deleted: true
          }
        }
      ]
    },
    {
      id: 'accounts',
      category: 'Accounts',
      icon: Settings,
      color: 'bg-slate-500',
      endpoints: [
        {
          method: 'GET',
          path: '/accounts',
          title: 'List Accounts',
          description: 'Get paginated list of accounts',
          requiresAuth: true,
          response: {
            data: [{ id: '1', name: 'Marketing Account' }],
            current_page: 1,
            total: 25
          }
        },
        {
          method: 'POST',
          path: '/accounts',
          title: 'Create Account',
          description: 'Create a new account',
          requiresAuth: true,
          requestBody: {
            name: 'Marketing Account',
            organisation_id: '1'
          },
          response: {
            id: '1',
            name: 'Marketing Account'
          }
        },
        {
          method: 'GET',
          path: '/accounts/{account}',
          title: 'Get Account',
          description: 'Get account details by ID',
          requiresAuth: true,
          response: {
            id: '1',
            name: 'Marketing Account'
          }
        },
        {
          method: 'PUT',
          path: '/accounts/{account}',
          title: 'Update Account',
          description: 'Update account details',
          requiresAuth: true,
          requestBody: {
            name: 'Marketing Account Updated'
          },
          response: {
            account: { id: '1', name: 'Marketing Account Updated' },
            updated: true
          }
        },
        {
          method: 'DELETE',
          path: '/accounts/{account}',
          title: 'Delete Account',
          description: 'Delete an account',
          requiresAuth: true,
          response: {
            deleted: true
          }
        },
        {
          method: 'GET',
          path: '/accounts/{account}/users',
          title: 'List Account Users',
          description: 'Get users associated with an account',
          requiresAuth: true,
          response: [
            { id: '1', name: 'John Doe', email: 'john@example.com' }
          ]
        },
        {
          method: 'PUT',
          path: '/accounts/{account}/users',
          title: 'Update Account Users',
          description: 'Associate users with an account',
          requiresAuth: true,
          requestBody: {
            user_ids: ['1', '2', '3']
          },
          response: {
            success: true
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
          path: '/recipients',
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
                account_id: '1'
              }
            ],
            count: 150
          }
        },
        {
          method: 'POST',
          path: '/recipients',
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
        },
        {
          method: 'GET',
          path: '/recipients/{recipient}',
          title: 'Get Recipient',
          description: 'Get recipient details by ID',
          requiresAuth: true,
          response: {
            id: '1',
            number: '+1234567890',
            name: 'John Doe'
          }
        },
        {
          method: 'PUT',
          path: '/recipients/{recipient}',
          title: 'Update Recipient',
          description: 'Update recipient details',
          requiresAuth: true,
          requestBody: {
            number: '+1234567890',
            name: 'John Doe Updated'
          },
          response: {
            recipient: { id: '1', name: 'John Doe Updated' },
            updated: true
          }
        },
        {
          method: 'DELETE',
          path: '/recipients/{recipient}',
          title: 'Delete Recipient',
          description: 'Delete a recipient',
          requiresAuth: true,
          response: {
            deleted: true
          }
        },
        {
          method: 'GET',
          path: '/recipients-export',
          title: 'List Recipient Exports',
          description: 'Get list of recipient export jobs',
          requiresAuth: true,
          response: [
            { id: '1', status: 'completed', format: 'csv' }
          ]
        },
        {
          method: 'POST',
          path: '/recipients-export',
          title: 'Create Recipient Export',
          description: 'Create a new recipient export job',
          requiresAuth: true,
          requestBody: {
            account_id: '1',
            format: 'csv'
          },
          response: {
            id: '1',
            status: 'pending'
          }
        }
      ]
    },
    {
      id: 'recipient-lists',
      category: 'Recipient Lists',
      icon: List,
      color: 'bg-pink-500',
      endpoints: [
        {
          method: 'GET',
          path: '/recipient-lists',
          title: 'List Recipient Lists',
          description: 'Get paginated list of recipient lists',
          requiresAuth: true,
          response: {
            data: [{ id: '1', name: 'VIP Customers', recipients_count: 150 }],
            current_page: 1,
            total: 10
          }
        },
        {
          method: 'POST',
          path: '/recipient-lists',
          title: 'Create Recipient List',
          description: 'Create a new recipient list',
          requiresAuth: true,
          requestBody: {
            name: 'VIP Customers',
            description: 'High-value customers',
            account_id: '1'
          },
          response: {
            id: '1',
            name: 'VIP Customers'
          }
        },
        {
          method: 'GET',
          path: '/recipient-lists/{list}',
          title: 'Get Recipient List',
          description: 'Get recipient list details by ID',
          requiresAuth: true,
          response: {
            id: '1',
            name: 'VIP Customers',
            recipients_count: 150
          }
        },
        {
          method: 'PUT',
          path: '/recipient-lists/{list}',
          title: 'Update Recipient List',
          description: 'Update recipient list details',
          requiresAuth: true,
          requestBody: {
            name: 'VIP Customers Updated'
          },
          response: {
            list: { id: '1', name: 'VIP Customers Updated' },
            updated: true
          }
        },
        {
          method: 'DELETE',
          path: '/recipient-lists/{list}',
          title: 'Delete Recipient List',
          description: 'Delete a recipient list',
          requiresAuth: true,
          response: {
            deleted: true
          }
        },
        {
          method: 'GET',
          path: '/recipient-lists/{list}/recipients',
          title: 'List Recipients in List',
          description: 'Get recipients associated with a list',
          requiresAuth: true,
          response: [
            { id: '1', number: '+1234567890', name: 'John Doe' }
          ]
        },
        {
          method: 'PUT',
          path: '/recipient-lists/{list}/recipients',
          title: 'Update List Recipients',
          description: 'Associate recipients with a list',
          requiresAuth: true,
          requestBody: {
            recipient_ids: ['1', '2', '3']
          },
          response: {
            success: true
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
          path: '/campaigns',
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
          path: '/campaigns',
          title: 'Create Campaign',
          description: 'Create a new SMS campaign with recipients',
          requiresAuth: true,
          requestBody: {
            name: 'Summer Sale Campaign',
            content: 'Hello  %%name%%! Get 20% off all items. Use code SUMMER20. Valid until July 31st.',
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
        },
        {
          method: 'GET',
          path: '/campaigns/{campaign}',
          title: 'Get Campaign',
          description: 'Get SMS campaign details by ID',
          requiresAuth: true,
          response: {
            id: '1',
            name: 'Summer Sale Campaign',
            content: 'Get 20% off! Use code SUMMER20'
          }
        },
        {
          method: 'PUT',
          path: '/campaigns/{campaign}',
          title: 'Update Campaign',
          description: 'Update SMS campaign details',
          requiresAuth: true,
          requestBody: {
            name: 'Summer Sale Campaign Updated'
          },
          response: {
            campaign: { id: '1', name: 'Summer Sale Campaign Updated' },
            updated: true
          }
        },
        {
          method: 'DELETE',
          path: '/campaigns/{campaign}',
          title: 'Delete Campaign',
          description: 'Delete an SMS campaign',
          requiresAuth: true,
          response: {
            deleted: true
          }
        }
      ]
    },
    {
      id: 'messages',
      category: 'SMS Messages',
      icon: MessageSquare,
      color: 'bg-yellow-500',
      endpoints: [
        {
          method: 'GET',
          path: '/messages',
          title: 'List SMS Messages',
          description: 'Get paginated list of SMS messages',
          requiresAuth: true,
          queryParams: {
            page: 1,
            per_page: 20,
            campaign_id: '1'
          },
          response: {
            data: [
              {
                id: '1',
                sms_campaign_id: '1',
                recipient_id: '1',
                status: 'delivered',
                sent_at: '2023-06-20T10:00:00Z'
              }
            ],
            current_page: 1,
            total: 500
          }
        },
        {
          method: 'GET',
          path: '/messages/{message}',
          title: 'Get SMS Message',
          description: 'Get SMS message details by ID',
          requiresAuth: true,
          response: {
            id: '1',
            sms_campaign_id: '1',
            recipient_id: '1',
            status: 'delivered'
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
          path: '/summary',
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
        },
        {
          method: 'GET',
          path: '/summary/success-rate',
          title: 'Get Success Rate Statistics',
          description: 'Get detailed success rate analytics',
          requiresAuth: true,
          queryParams: {
            account_id: '1',
            date_from: '2023-01-01',
            date_to: '2023-12-31'
          },
          response: {
            overall_success_rate: 97.9,
            daily_stats: [
              {
                date: '2023-06-20',
                sent: 150,
                delivered: 147,
                success_rate: 98.0
              }
            ]
          }
        }
      ]
    },
    {
      id: 'feedback',
      category: 'Feedback',
      icon: Mail,
      color: 'bg-teal-500',
      endpoints: [
        {
          method: 'POST',
          path: '/feedback-forms',
          title: 'Submit Feedback',
          description: 'Submit feedback form',
          requiresAuth: true,
          requestBody: {
            subject: 'Feature Request',
            message: 'It would be great to have scheduling functionality',
            email: 'user@example.com',
            name: 'John Doe'
          },
          response: {
            success: true,
            message: 'Thank you for your feedback'
          }
        }
      ]
    }
  ]

  // Calculate total endpoints
  const totalEndpoints = endpoints.reduce((total, category) => total + category.endpoints.length, 0)

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
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 rounded-t-lg dark:bg-gray-800">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(code, id)}
          className="w-6 h-6 p-0"
        >
          {copiedCode === id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        </Button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneLight}
        customStyle={{ margin: 0, borderRadius: '0 0 0.5rem 0.5rem', fontSize: '0.875rem', background: 'inherit' }}
        showLineNumbers={false}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src="/cx-engine-logo.svg"
                alt="CX Engine"
                className="w-auto h-8"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600" style={{display: 'none'}}>
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1 ml-8">
              <h1 className="text-xl font-bold">SMS API</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive API Documentation</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* <Badge variant="secondary" className="text-green-800 bg-green-100 dark:bg-green-900 dark:text-green-300">
                <div className="w-2 h-2 mr-2 bg-green-500 rounded-full"></div>
                v1.0.0
              </Badge> */}
              <a
                href="/sms-marketing-api-openapi.yaml"
                download
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white transition-colors bg-blue-600 border border-blue-600 rounded-lg cursor-pointer hover:bg-blue-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                OpenAPI Spec
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky space-y-6 top-24">
              {/* Search */}
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <Input
                  placeholder="Search endpoints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Navigation */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ScrollArea className="h-[400px] pr-4">
                    {endpoints.map((category) => {
                      const Icon = category.icon
                      const isOpen = openCategories[category.id]
                      return (
                        <Collapsible
                          key={category.id}
                          open={isOpen}
                          onOpenChange={() => toggleCategory(category.id)}
                        >
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              className="justify-start w-full h-auto p-3 mb-1"
                            >
                              <div className={`w-2 h-2 rounded-full mr-3 ${category.color}`}></div>
                              <Icon className="w-4 h-4 mr-2" />
                              <span className="flex-1 text-sm text-left">{category.category}</span>
                              <Badge variant="secondary" className="mr-2">
                                {category.endpoints.length}
                              </Badge>
                              {isOpen ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2 mb-2 ml-6 space-y-1">
                            {category.endpoints.map((endpoint, index) => (
                              <Button
                                key={index}
                                variant="ghost"
                                size="sm"
                                className="justify-start w-full h-8 pl-4 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                onClick={() => scrollToEndpoint(category.id, index)}
                              >
                                <Badge
                                  className={`${getMethodColor(endpoint.method)} mr-2 text-xs px-1 py-0`}
                                >
                                  {endpoint.method}
                                </Badge>
                                <span className="truncate">{endpoint.title}</span>
                              </Button>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      )
                    })}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">API Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Endpoints</span>
                    <Badge variant="secondary">{totalEndpoints}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Categories</span>
                    <Badge variant="secondary">{endpoints.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Auth Type</span>
                    <Badge variant="secondary">OAuth2</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8 lg:col-span-3">
            {/* Hero Section */}
            <div className="py-8 space-y-4 text-center">
              <div className="inline-flex items-center px-4 py-2 space-x-2 bg-blue-100 rounded-full dark:bg-blue-900">
                <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Powerful SMS Platform</span>
              </div>
              <h2 className="text-3xl font-bold">Complete API Reference</h2>
              <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
                Integrate SMS marketing capabilities into your applications with our comprehensive REST API.
                Manage campaigns, recipients, and track analytics with ease.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
              <Card className="text-center transition-colors border-blue-200 hover:border-blue-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-lg">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="mb-2 font-semibold">Secure Authentication</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">OAuth2 with personal access tokens</p>
                </CardContent>
              </Card>
              <Card className="text-center transition-colors border-green-200 hover:border-green-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-lg">
                    <Globe className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="mb-2 font-semibold">Global Reach</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">International phone number support</p>
                </CardContent>
              </Card>
              <Card className="text-center transition-colors border-purple-200 hover:border-purple-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="mb-2 font-semibold">Real-time Analytics</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Track delivery and success rates</p>
                </CardContent>
              </Card>
            </div>

            {/* API Endpoints */}
            {filteredEndpoints.map((category) => {
              const Icon = category.icon
              return (
                <div key={category.id} id={category.id}>
                  <div className="flex items-center mb-6 space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${category.color}`}>
                      <Icon className="w-5 h-5 text-white" />
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
                      <Card key={index} id={`${category.id}-endpoint-${index}`} className="overflow-hidden transition-all duration-200">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Badge className={getMethodColor(endpoint.method)}>
                                {endpoint.method}
                              </Badge>
                              <code className="px-2 py-1 font-mono text-sm bg-gray-100 rounded dark:bg-gray-800">
                                {endpoint.path}
                              </code>
                              {endpoint.requiresAuth && (
                                <Badge variant="outline" className="text-xs">
                                  <Key className="w-3 h-3 mr-1" />
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
                              <TabsTrigger className="cursor-pointer" value="example">Example</TabsTrigger>
                              <TabsTrigger className="cursor-pointer" value="request">Request</TabsTrigger>
                              <TabsTrigger className="cursor-pointer" value="response">Response</TabsTrigger>
                            </TabsList>

                            <TabsContent value="example" className="space-y-4">
                              <div>
                                {/* Example selector dropdown */}
                                <label className="block mb-2 text-sm font-semibold" htmlFor="example-select-global">Example Language</label>
                                <select
                                  id="example-select-global"
                                  className="px-2 py-1 mb-4 text-sm border rounded dark:bg-gray-800 dark:text-white"
                                  value={exampleSelection}
                                  onChange={e => setExampleSelection(e.target.value)}
                                >
                                  <option value="curl">cURL</option>
                                  <option value="javascript">JavaScript</option>
                                  <option value="php">PHP</option>
                                </select>
                                {/* Show only the selected code block */}
                                {(() => {
                                  const selected = exampleSelection
                                  if (selected === 'curl') {
                                    return (
                                      <CodeBlock
                                        id={`curl-${category.id}-${index}`}
                                        language="bash"
                                        code={getCurlExample(endpoint)}
                                      />
                                    )
                                  } else if (selected === 'javascript') {
                                    return (
                                      <CodeBlock
                                        id={`js-${category.id}-${index}`}
                                        language="javascript"
                                        code={getJsExample(endpoint)}
                                      />
                                    )
                                  } else if (selected === 'php') {
                                    return (
                                      <CodeBlock
                                        id={`php-${category.id}-${index}`}
                                        language="php"
                                        code={getPhpExample(endpoint)}
                                      />
                                    )
                                  }
                                  return null
                                })()}
                              </div>
                            </TabsContent>

                            <TabsContent value="request" className="space-y-4">
                              {endpoint.queryParams && (
                                <div>
                                  <h4 className="mb-2 font-semibold">Query Parameters</h4>
                                  <CodeBlock
                                    id={`query-${category.id}-${index}`}
                                    code={JSON.stringify(endpoint.queryParams, null, 2)}
                                  />
                                </div>
                              )}

                              {endpoint.requestBody && (
                                <div>
                                  <h4 className="mb-2 font-semibold">Request Body</h4>
                                  <CodeBlock
                                    id={`request-${category.id}-${index}`}
                                    code={JSON.stringify(endpoint.requestBody, null, 2)}
                                  />
                                </div>
                              )}
                            </TabsContent>

                            <TabsContent value="response" className="space-y-4">
                              <div>
                                <h4 className="mb-2 font-semibold">Response Example</h4>
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
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Book className="w-5 h-5" />
                  <span>Getting Started</span>
                </CardTitle>
                <CardDescription>
                  Quick guide to start using the SMS API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
      <footer className="mt-16 bg-white border-t dark:bg-gray-900">
        <div className="container px-4 py-8 mx-auto">
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <img
                src="/cx-engine-logo.svg"
                alt="CX Engine"
                className="w-auto h-6"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div className="flex items-center justify-center w-6 h-6 rounded bg-gradient-to-r from-blue-600 to-purple-600" style={{display: 'none'}}>
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">SMS API</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Built with ❤️ at{' '}
              <a href="https://cx-engine.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">CX-Engine</a>.
              Need help? Contact our support team at{' '}
              <a href="mailto:developers@cx-engine.com" className="text-blue-600 hover:underline">developers@cx-engine.com</a>.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App


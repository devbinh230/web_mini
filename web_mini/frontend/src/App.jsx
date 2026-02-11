import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Typography, Space, Badge } from 'antd'
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  ScheduleOutlined,
  FormOutlined,
  CreditCardOutlined,
  BookOutlined,
} from '@ant-design/icons'
import Dashboard from './pages/Dashboard'
import ParentsPage from './pages/ParentsPage'
import StudentsPage from './pages/StudentsPage'
import ClassesPage from './pages/ClassesPage'
import RegistrationPage from './pages/RegistrationPage'
import SubscriptionsPage from './pages/SubscriptionsPage'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/parents', icon: <TeamOutlined />, label: 'Phụ huynh' },
  { key: '/students', icon: <UserOutlined />, label: 'Học sinh' },
  { key: '/classes', icon: <ScheduleOutlined />, label: 'Lớp học' },
  { key: '/register', icon: <FormOutlined />, label: 'Đăng ký lớp' },
  { key: '/subscriptions', icon: <CreditCardOutlined />, label: 'Gói học' },
]

// Map route keys to page titles
const pageTitles = {
  '/': 'Tổng quan',
  '/parents': 'Quản lý Phụ huynh',
  '/students': 'Quản lý Học sinh',
  '/classes': 'Quản lý Lớp học',
  '/register': 'Đăng ký Lớp học',
  '/subscriptions': 'Quản lý Gói học',
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  const currentTitle = pageTitles[location.pathname] || 'Mini LMS'

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="80"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        }}
        theme="dark"
      >
        <div className="sidebar-logo">
          <Space size={8} align="center">
            <BookOutlined style={{ color: '#60a5fa', fontSize: 22 }} />
            <h4>Mini LMS</h4>
          </Space>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
            borderRight: 'none',
            marginTop: 8,
          }}
        />
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: 0,
          right: 0,
          textAlign: 'center',
          padding: '12px',
        }}>
          <Typography.Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>
            Mini LMS v1.0
          </Typography.Text>
        </div>
      </Sider>
      <Layout style={{ marginLeft: 200 }}>
        <Header className="app-header">
          <Space size={12}>
            <Typography.Title level={4} style={{
              margin: 0,
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
            }}>
              {currentTitle}
            </Typography.Title>
          </Space>
        </Header>
        <Content style={{ margin: '24px', minHeight: 280 }}>
          <div className="page-container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/parents" element={<ParentsPage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/classes" element={<ClassesPage />} />
              <Route path="/register" element={<RegistrationPage />} />
              <Route path="/subscriptions" element={<SubscriptionsPage />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App

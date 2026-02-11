import { Row, Col, Card, Statistic, Spin, Typography, Space, Empty } from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  ScheduleOutlined,
  FormOutlined,
  CreditCardOutlined,
  CalendarOutlined,
  RiseOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../services/api'

const statCards = [
  {
    key: 'total_students', title: 'Tổng Học sinh', icon: <UserOutlined />,
    color: '#3b82f6', bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
  },
  {
    key: 'total_parents', title: 'Tổng Phụ huynh', icon: <TeamOutlined />,
    color: '#10b981', bg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
  },
  {
    key: 'total_classes', title: 'Tổng Lớp học', icon: <ScheduleOutlined />,
    color: '#8b5cf6', bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
  },
  {
    key: 'total_registrations', title: 'Lượt Đăng ký', icon: <FormOutlined />,
    color: '#f59e0b', bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
  },
  {
    key: 'active_subscriptions', title: 'Gói học Active', icon: <CreditCardOutlined />,
    color: '#ec4899', bg: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
  },
  {
    key: 'classes_today', title: 'Lớp học hôm nay', icon: <CalendarOutlined />,
    color: '#14b8a6', bg: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
  },
]

export default function Dashboard() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
  })

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    )
  }

  if (isError) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Empty
          description={
            <Space direction="vertical" size={4}>
              <Typography.Text type="secondary">Không thể kết nối đến server</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Kiểm tra backend đang chạy tại http://localhost:8000
              </Typography.Text>
            </Space>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Space align="center" size={8}>
          <RiseOutlined style={{ fontSize: 20, color: '#3b82f6' }} />
          <Typography.Title level={4} style={{ margin: 0 }}>
            Tổng quan hệ thống
          </Typography.Title>
        </Space>
        <Typography.Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
          Thống kê tổng quan về hệ thống quản lý lớp học
        </Typography.Text>
      </div>

      <Row gutter={[20, 20]}>
        {statCards.map((card) => (
          <Col xs={24} sm={12} lg={8} key={card.key}>
            <Card
              className="stat-card"
              style={{
                borderRadius: 16,
                background: card.bg,
                border: 'none',
              }}
              bodyStyle={{ padding: '24px 28px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Typography.Text style={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}>
                    {card.title}
                  </Typography.Text>
                  <div style={{
                    fontSize: 36,
                    fontWeight: 700,
                    color: card.color,
                    lineHeight: 1.2,
                    marginTop: 6,
                    letterSpacing: '-1px',
                  }}>
                    {stats?.[card.key] ?? 0}
                  </div>
                </div>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: `${card.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  color: card.color,
                }}>
                  {card.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}
